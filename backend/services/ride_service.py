import json
import os
import time
import threading
from datetime import datetime, timedelta, timezone

RIDES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'rides.json')

class RideService:
    @staticmethod
    def _read_rides():
        if not os.path.exists(RIDES_FILE):
            return []
        try:
            with open(RIDES_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    @staticmethod
    def _write_rides(rides):
        try:
            with open(RIDES_FILE, 'w') as f:
                json.dump(rides, f, indent=4)
        except IOError as e:
            print(f"Error writing to rides.json: {e}")

    @classmethod
    def start_ride(cls, woman_id, woman_name, woman_phone, data):
        rides = cls._read_rides()
        
        # Check if user already has an active ride
        active_ride = next((r for r in rides if r['woman_id'] == woman_id and r['status'] == 'ACTIVE'), None)
        if active_ride:
            return None, "You already have an active ride timer"

        duration = int(data.get('duration_minutes', 30))
        start_time = datetime.now(timezone.utc)
        expires_at = start_time + timedelta(minutes=duration)

        ride = {
            "ride_id": f"ride_{int(time.time())}_{woman_id}",
            "woman_id": woman_id,
            "woman_name": woman_name,
            "woman_phone": woman_phone,
            "vehicle_number": data.get('vehicle_number', ''),
            "driver_name": data.get('driver_name', ''),
            "destination_name": data.get('destination_name', ''),
            "ride_type": data.get('ride_type', ''),
            "start_lat": data.get('latitude'),
            "start_lng": data.get('longitude'),
            "current_lat": data.get('latitude'),
            "current_lng": data.get('longitude'),
            "start_time": start_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
            "expires_at": expires_at.strftime('%Y-%m-%dT%H:%M:%SZ'),
            "duration_minutes": duration,
            "status": "ACTIVE"
        }

        rides.append(ride)
        cls._write_rides(rides)
        return ride, None

    @classmethod
    def get_active_ride(cls, woman_id):
        rides = cls._read_rides()
        return next((r for r in rides if r['woman_id'] == woman_id and r['status'] == 'ACTIVE'), None)

    @classmethod
    def check_in(cls, woman_id, ride_id):
        rides = cls._read_rides()
        for ride in rides:
            if ride['ride_id'] == ride_id and ride['woman_id'] == woman_id:
                if ride['status'] == 'ACTIVE':
                    ride['status'] = 'CHECKED_IN'
                    ride['checked_in_at'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
                    cls._write_rides(rides)
                    return True, None
                return False, "Ride is not active"
        return False, "Ride not found"

    @classmethod
    def cancel_ride(cls, woman_id, ride_id):
        rides = cls._read_rides()
        for ride in rides:
            if ride['ride_id'] == ride_id and ride['woman_id'] == woman_id:
                if ride['status'] == 'ACTIVE':
                    ride['status'] = 'CANCELLED'
                    cls._write_rides(rides)
                    return True, None
                return False, "Ride is not active"
        return False, "Ride not found"

    @classmethod
    def get_all_active_rides(cls):
        return [r for r in cls._read_rides() if r['status'] == 'ACTIVE']

    @classmethod
    def get_sos_triggered_rides(cls):
        return [r for r in cls._read_rides() if r['status'] in ['SOS_TRIGGERED', 'RESOLVED']]

    @classmethod
    def update_location(cls, woman_id, ride_id, lat, lng):
        rides = cls._read_rides()
        for ride in rides:
            if ride['ride_id'] == ride_id and ride['woman_id'] == woman_id and ride['status'] == 'ACTIVE':
                ride['current_lat'] = lat
                ride['current_lng'] = lng
                cls._write_rides(rides)
                return True
        return False

    @classmethod
    def trigger_sos(cls, ride_id):
        rides = cls._read_rides()
        for ride in rides:
            if ride['ride_id'] == ride_id and ride['status'] == 'ACTIVE':
                ride['status'] = 'SOS_TRIGGERED'
                ride['sos_triggered_at'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
                # Capture last known location as SOS location
                ride['sos_lat'] = ride.get('current_lat', ride.get('start_lat'))
                ride['sos_lng'] = ride.get('current_lng', ride.get('start_lng'))
                cls._write_rides(rides)
                return ride
        return None

    @classmethod
    def resolve_ride(cls, ride_id):
        rides = cls._read_rides()
        for ride in rides:
            if ride['ride_id'] == ride_id:
                ride['status'] = 'RESOLVED'
                ride['resolved_at'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
                cls._write_rides(rides)
                return True
        return False

def start_ride_monitor(app, db, SOSEvent, EmergencyContact, User, send_bulk_sms, send_bulk_whatsapp):
    """Monitor expired rides in a background thread"""
    def monitor():
        while True:
            with app.app_context():
                try:
                    rides = RideService.get_all_active_rides()
                    now = datetime.now(timezone.utc)
                    
                    for ride in rides:
                        # Handle 'Z' suffix for compatibility
                        expires_str = ride['expires_at'].replace('Z', '+00:00')
                        expires_at = datetime.fromisoformat(expires_str)
                        
                        # Ensure expires_at is aware
                        if expires_at.tzinfo is None:
                            expires_at = expires_at.replace(tzinfo=timezone.utc)
                            
                        if now >= expires_at:
                            print(f"Ride {ride['ride_id']} expired. Triggering SOS.")
                            triggered_ride = RideService.trigger_sos(ride['ride_id'])
                            
                            if not triggered_ride:
                                print(f"Ride {ride['ride_id']} already triggered or no longer active.")
                                continue
                                
                            # Integrate with existing SOS system
                            woman_id = triggered_ride['woman_id']
                            woman = User.query.get(woman_id)
                            if not woman:
                                continue
 
                            # Create SOS event in DB for consistency with Police feed
                            sos_event = SOSEvent(
                                woman_id=woman_id,
                                latitude=ride.get('current_lat') or ride.get('start_lat') or 0,
                                longitude=ride.get('current_lng') or ride.get('start_lng') or 0,
                                battery_percentage=0,
                                status='ACTIVE'
                            )
                            db.session.add(sos_event)
                            db.session.commit()
 
                            # Send alerts
                            contacts = EmergencyContact.query.filter_by(woman_id=woman_id).all()
                            if contacts:
                                contact_list = [{'contact_name': c.contact_name, 'contact_phone': c.contact_phone} for c in contacts]
                                sos_lat = ride.get('current_lat') or ride.get('start_lat') or 0
                                sos_lng = ride.get('current_lng') or ride.get('start_lng') or 0
                                maps_link = f"https://maps.google.com/?q={sos_lat},{sos_lng}"
                                
                                alert_msg = (
                                    f"🚨 EMERGENCY ALERT! {woman.name}'s ride timer expired.\n"
                                    f"Driver: {ride.get('driver_name')}\n"
                                    f"Vehicle: {ride.get('vehicle_number')}\n"
                                    f"Start Loc: {ride.get('start_lat')},{ride.get('start_lng')}\n"
                                    f"Current SOS Loc: {maps_link}"
                                )
                                
                                # Use provided send functions
                                send_bulk_sms(contact_list, woman.name, sos_lat, sos_lng, 0, custom_message=alert_msg)
                                send_bulk_whatsapp(contact_list, woman.name, sos_lat, sos_lng, 0, custom_message=alert_msg)
                
                except Exception as e:
                    print(f"Error in ride monitor: {e}")
            
            time.sleep(30) # Check every 30 seconds

    thread = threading.Thread(target=monitor, daemon=True)
    thread.start()
