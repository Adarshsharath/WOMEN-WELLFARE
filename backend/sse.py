from flask import Response, stream_with_context
from models import SOSEvent, LocationUpdate
import json
import time


class SSEManager:
    """Manage Server-Sent Events for real-time updates"""
    
    def __init__(self):
        self.last_sos_id = 0
        self.last_location_update_id = 0
    
    def get_sos_updates(self):
        """Stream SOS events and location updates"""
        @stream_with_context
        def generate():
            last_sos_check = 0
            last_location_check = 0
            
            while True:
                try:
                    # Check for new SOS events
                    new_sos_events = SOSEvent.query.filter(
                        SOSEvent.id > last_sos_check
                    ).all()
                    
                    for sos_event in new_sos_events:
                        event_data = {
                            'type': 'NEW_SOS' if sos_event.status == 'ACTIVE' else 'SOS_RESOLVED',
                            'data': sos_event.to_dict()
                        }
                        yield f"data: {json.dumps(event_data)}\n\n"
                        last_sos_check = max(last_sos_check, sos_event.id)
                    
                    # Check for location updates
                    new_location_updates = LocationUpdate.query.filter(
                        LocationUpdate.id > last_location_check
                    ).all()
                    
                    for update in new_location_updates:
                        sos_event = SOSEvent.query.get(update.sos_event_id)
                        if sos_event:
                            event_data = {
                                'type': 'LOCATION_UPDATE',
                                'data': {
                                    'sos_id': sos_event.id,
                                    'woman_id': sos_event.woman_id,
                                    'woman_name': sos_event.woman.name,
                                    'latitude': update.latitude,
                                    'longitude': update.longitude,
                                    'battery_percentage': update.battery_percentage,
                                    'timestamp': update.timestamp.isoformat()
                                }
                            }
                            yield f"data: {json.dumps(event_data)}\n\n"
                            last_location_check = max(last_location_check, update.id)
                    
                    # Keep connection alive
                    yield f": heartbeat\n\n"
                    
                    # Sleep for 2 seconds before next check
                    time.sleep(2)
                
                except GeneratorExit:
                    break
                except Exception as e:
                    print(f"SSE error: {str(e)}")
                    time.sleep(2)
        
        return Response(generate(), mimetype='text/event-stream')


sse_manager = SSEManager()


def create_sse_blueprint():
    """Create SSE blueprint"""
    from flask import Blueprint
    from auth import token_required, role_required
    
    sse_bp = Blueprint('sse', __name__)
    
    @sse_bp.route('/sos-updates')
    @token_required
    @role_required('POLICE', 'EMERGENCY')
    def sos_updates(current_user):
        """Stream SOS updates to police and emergency"""
        return sse_manager.get_sos_updates()
    
    return sse_bp
