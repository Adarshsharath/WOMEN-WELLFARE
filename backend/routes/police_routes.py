from flask import Blueprint, request, jsonify
from models import db, SOSEvent, FlaggedZone, ChatMessage, Issue
from auth import token_required, role_required

police_bp = Blueprint('police', __name__)


@police_bp.route('/sos-feed', methods=['GET'])
@token_required
@role_required('POLICE', 'EMERGENCY')
def get_sos_feed(current_user):
    """Get real-time SOS events feed"""
    # Get all active SOS events
    active_sos = SOSEvent.query.filter_by(status='ACTIVE').order_by(SOSEvent.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'sos_events': [event.to_dict() for event in active_sos]
    }), 200


@police_bp.route('/sos/<int:sos_id>', methods=['GET'])
@token_required
@role_required('POLICE', 'EMERGENCY')
def get_sos_details(current_user, sos_id):
    """Get detailed information about specific SOS event"""
    sos_event = SOSEvent.query.get(sos_id)
    
    if not sos_event:
        return jsonify({'error': 'SOS event not found'}), 404
    
    # Get location updates
    location_updates = [update.to_dict() for update in sos_event.location_updates]
    
    return jsonify({
        'success': True,
        'sos_event': sos_event.to_dict(),
        'location_updates': location_updates
    }), 200


@police_bp.route('/flag-zone', methods=['POST'])
@token_required
@role_required('POLICE')
def flag_zone(current_user):
    """Flag a high-risk zone"""
    data = request.get_json()
    
    # Validate required fields
    required = ['latitude', 'longitude', 'risk_level']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate risk level
    valid_risk_levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    if data['risk_level'] not in valid_risk_levels:
        return jsonify({'error': 'Invalid risk level'}), 400
    
    # Create flagged zone
    flagged_zone = FlaggedZone(
        police_id=current_user.id,
        latitude=data['latitude'],
        longitude=data['longitude'],
        risk_level=data['risk_level'],
        description=data.get('description', '')
    )
    
    db.session.add(flagged_zone)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Zone flagged successfully',
        'zone': flagged_zone.to_dict()
    }), 201


@police_bp.route('/flagged-zones', methods=['GET'])
@token_required
@role_required('POLICE', 'WOMAN')
def get_flagged_zones(current_user):
    """Get all flagged zones"""
    zones = FlaggedZone.query.order_by(FlaggedZone.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'zones': [zone.to_dict() for zone in zones]
    }), 200


@police_bp.route('/flagged-zones/<int:zone_id>', methods=['DELETE'])
@token_required
@role_required('POLICE')
def delete_flagged_zone(current_user, zone_id):
    """Delete a flagged zone (only by creator or admin)"""
    zone = FlaggedZone.query.get(zone_id)
    
    if not zone:
        return jsonify({'error': 'Zone not found'}), 404
    
    # Only creator or admin can delete
    if zone.police_id != current_user.id and current_user.role != 'ADMIN':
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(zone)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Zone deleted'
    }), 200


@police_bp.route('/chat', methods=['GET'])
@token_required
@role_required('POLICE')
def get_police_chat(current_user):
    """Get police chat messages"""
    messages = ChatMessage.query.filter_by(
        chat_type='POLICE'
    ).order_by(ChatMessage.timestamp.desc()).limit(100).all()
    
    return jsonify({
        'success': True,
        'messages': [msg.to_dict() for msg in reversed(messages)]
    }), 200


@police_bp.route('/chat', methods=['POST'])
@token_required
@role_required('POLICE')
def send_police_chat(current_user):
    """Send message in police chat"""
    data = request.get_json()
    
    if not data.get('message'):
        return jsonify({'error': 'Message required'}), 400
    
    message = ChatMessage(
        sender_id=current_user.id,
        message_text=data['message'],
        chat_type='POLICE'
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': message.to_dict()
    }), 201


@police_bp.route('/issue', methods=['POST'])
@token_required
@role_required('POLICE')
def report_issue(current_user):
    """Report issue to infrastructure"""
    data = request.get_json()
    
    if not data.get('description'):
        return jsonify({'error': 'Description required'}), 400
    
    issue = Issue(
        reported_by_police_id=current_user.id,
        description=data['description'],
        location=data.get('location', ''),
        status='PENDING'
    )
    
    db.session.add(issue)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Issue reported',
        'issue': issue.to_dict()
    }), 201


@police_bp.route('/issues', methods=['GET'])
@token_required
@role_required('POLICE')
def get_police_issues(current_user):
    """Get issues reported by this police officer"""
    issues = Issue.query.filter_by(
        reported_by_police_id=current_user.id
    ).order_by(Issue.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'issues': [issue.to_dict() for issue in issues]
    }), 200
