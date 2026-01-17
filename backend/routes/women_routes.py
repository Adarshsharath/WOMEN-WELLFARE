from flask import Blueprint, request, jsonify
from models import db, EmergencyContact, SOSEvent, LocationUpdate, AbuseMonitoring, FlaggedZone
from auth import token_required, role_required
from services.sms_service import send_bulk_emergency_sms
from services.whatsapp_service import send_bulk_emergency_whatsapp
from services.routes_service import calculate_safe_routes
from datetime import datetime

women_bp = Blueprint('women', __name__)


@women_bp.route('/emergency-contacts', methods=['GET'])
@token_required
@role_required('WOMAN')
def get_emergency_contacts(current_user):
    """Get all emergency contacts for the woman"""
    contacts = EmergencyContact.query.filter_by(woman_id=current_user.id).all()
    return jsonify({
        'success': True,
        'contacts': [contact.to_dict() for contact in contacts]
    }), 200


@women_bp.route('/emergency-contacts', methods=['POST'])
@token_required
@role_required('WOMAN')
def create_emergency_contact(current_user):
    """Create a new emergency contact"""
    data = request.get_json()
    
    if not data.get('contact_name') or not data.get('contact_phone'):
        return jsonify({'error': 'Contact name and phone required'}), 400
    
    new_contact = EmergencyContact(
        woman_id=current_user.id,
        contact_name=data['contact_name'],
        contact_phone=data['contact_phone']
    )
    
    db.session.add(new_contact)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Emergency contact added',
        'contact': new_contact.to_dict()
    }), 201


@women_bp.route('/emergency-contacts/<int:contact_id>', methods=['PUT'])
@token_required
@role_required('WOMAN')
def update_emergency_contact(current_user, contact_id):
    """Update an emergency contact"""
    contact = EmergencyContact.query.filter_by(id=contact_id, woman_id=current_user.id).first()
    
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
    
    data = request.get_json()
    
    if data.get('contact_name'):
        contact.contact_name = data['contact_name']
    if data.get('contact_phone'):
        contact.contact_phone = data['contact_phone']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Contact updated',
        'contact': contact.to_dict()
    }), 200


@women_bp.route('/emergency-contacts/<int:contact_id>', methods=['DELETE'])
@token_required
@role_required('WOMAN')
def delete_emergency_contact(current_user, contact_id):
    """Delete an emergency contact"""
    contact = EmergencyContact.query.filter_by(id=contact_id, woman_id=current_user.id).first()
    
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
    
    db.session.delete(contact)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Contact deleted'
    }), 200


@women_bp.route('/sos', methods=['POST'])
@token_required
@role_required('WOMAN')
def trigger_sos(current_user):
    """Trigger SOS emergency alert"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('latitude') or not data.get('longitude'):
        return jsonify({'error': 'Location required'}), 400
    
    # Check if user has emergency contacts
    contacts = EmergencyContact.query.filter_by(woman_id=current_user.id).all()
    if not contacts:
        return jsonify({'error': 'Please add emergency contacts before triggering SOS'}), 400
    
    # Create SOS event
    sos_event = SOSEvent(
        woman_id=current_user.id,
        latitude=data['latitude'],
        longitude=data['longitude'],
        battery_percentage=data.get('battery_percentage', 0),
        status='ACTIVE'
    )
    
    db.session.add(sos_event)
    
    # Update abuse monitoring
    monitoring = AbuseMonitoring.query.filter_by(woman_id=current_user.id).first()
    if not monitoring:
        monitoring = AbuseMonitoring(woman_id=current_user.id, sos_count=1)
        db.session.add(monitoring)
    else:
        monitoring.sos_count += 1
        monitoring.last_updated = datetime.utcnow()
    
    db.session.commit()
    
    # Send SMS and WhatsApp alerts to all emergency contacts
    contact_list = [{'contact_name': c.contact_name, 'contact_phone': c.contact_phone} for c in contacts]
    
    sms_results = send_bulk_emergency_sms(
        contact_list,
        current_user.name,
        data['latitude'],
        data['longitude'],
        data.get('battery_percentage', 0)
    )
    
    whatsapp_results = send_bulk_emergency_whatsapp(
        contact_list,
        current_user.name,
        data['latitude'],
        data['longitude'],
        data.get('battery_percentage', 0)
    )
    
    return jsonify({
        'success': True,
        'message': 'SOS triggered successfully',
        'sos_event': sos_event.to_dict(),
        'alerts_sent': {
            'sms': sms_results,
            'whatsapp': whatsapp_results
        }
    }), 201


@women_bp.route('/sos/<int:sos_id>/location', methods=['POST'])
@token_required
@role_required('WOMAN')
def update_sos_location(current_user, sos_id):
    """Update live location for active SOS"""
    sos_event = SOSEvent.query.filter_by(id=sos_id, woman_id=current_user.id).first()
    
    if not sos_event:
        return jsonify({'error': 'SOS event not found'}), 404
    
    if sos_event.status != 'ACTIVE':
        return jsonify({'error': 'SOS is not active'}), 400
    
    data = request.get_json()
    
    if not data.get('latitude') or not data.get('longitude'):
        return jsonify({'error': 'Location required'}), 400
    
    # Create location update
    location_update = LocationUpdate(
        sos_event_id=sos_id,
        latitude=data['latitude'],
        longitude=data['longitude'],
        battery_percentage=data.get('battery_percentage', 0)
    )
    
    # Update SOS event with latest location
    sos_event.latitude = data['latitude']
    sos_event.longitude = data['longitude']
    sos_event.battery_percentage = data.get('battery_percentage', 0)
    
    db.session.add(location_update)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Location updated'
    }), 200


@women_bp.route('/sos/<int:sos_id>/cancel', methods=['PUT'])
@token_required
@role_required('WOMAN')
def cancel_sos(current_user, sos_id):
    """Cancel/resolve SOS event"""
    sos_event = SOSEvent.query.filter_by(id=sos_id, woman_id=current_user.id).first()
    
    if not sos_event:
        return jsonify({'error': 'SOS event not found'}), 404
    
    sos_event.status = 'RESOLVED'
    sos_event.resolved_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'SOS resolved'
    }), 200


@women_bp.route('/sos/active', methods=['GET'])
@token_required
@role_required('WOMAN')
def get_active_sos(current_user):
    """Get active SOS event for the woman"""
    sos_event = SOSEvent.query.filter_by(
        woman_id=current_user.id,
        status='ACTIVE'
    ).order_by(SOSEvent.timestamp.desc()).first()
    
    if not sos_event:
        return jsonify({'success': True, 'sos_event': None}), 200
    
    return jsonify({
        'success': True,
        'sos_event': sos_event.to_dict()
    }), 200


@women_bp.route('/fake-call', methods=['POST'])
@token_required
@role_required('WOMAN')
def log_fake_call(current_user):
    """Log fake call usage"""
    # Update abuse monitoring
    monitoring = AbuseMonitoring.query.filter_by(woman_id=current_user.id).first()
    if not monitoring:
        monitoring = AbuseMonitoring(woman_id=current_user.id, fake_call_count=1)
        db.session.add(monitoring)
    else:
        monitoring.fake_call_count += 1
        monitoring.last_updated = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Fake call logged'
    }), 200


@women_bp.route('/safe-routes', methods=['POST'])
@token_required
@role_required('WOMAN')
def get_safe_routes(current_user):
    """Calculate safe routes between two locations"""
    data = request.get_json()
    
    # Validate required fields
    required = ['start_latitude', 'start_longitude', 'end_latitude', 'end_longitude']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Get flagged zones from police
    flagged_zones = FlaggedZone.query.all()
    flagged_zones_data = [zone.to_dict() for zone in flagged_zones]
    
    # Calculate routes
    result = calculate_safe_routes(
        data['start_latitude'],
        data['start_longitude'],
        data['end_latitude'],
        data['end_longitude'],
        flagged_zones_data
    )
    
    if not result['success']:
        return jsonify(result), 500
    
    return jsonify(result), 200
