from flask import Blueprint, request, jsonify
from models import db, SOSEvent, FlaggedZone, ChatMessage, Issue
from auth import token_required, role_required
from datetime import datetime

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
    required = ['latitude', 'longitude', 'risk_level', 'reason']
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
        reason=data['reason'],
        description=data.get('description', ''),
        is_active=True
    )
    
    db.session.add(flagged_zone)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Zone marked successfully',
        'zone': flagged_zone.to_dict()
    }), 201


@police_bp.route('/flagged-zones', methods=['GET'])
@token_required
@role_required('POLICE', 'WOMAN')
def get_flagged_zones(current_user):
    """Get all flagged zones (active only for women, all for police)"""
    if current_user.role == 'WOMAN':
        # Women only see active zones
        zones = FlaggedZone.query.filter_by(is_active=True).order_by(FlaggedZone.timestamp.desc()).all()
    else:
        # Police see all zones
        zones = FlaggedZone.query.order_by(FlaggedZone.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'zones': [zone.to_dict() for zone in zones]
    }), 200


@police_bp.route('/flagged-zones/<int:zone_id>/unmark', methods=['PUT'])
@token_required
@role_required('POLICE')
def unmark_zone(current_user, zone_id):
    """Unmark a flagged zone (mark as resolved)"""
    zone = FlaggedZone.query.get(zone_id)
    
    if not zone:
        return jsonify({'error': 'Zone not found'}), 404
    
    # Only creator or admin can unmark
    if zone.police_id != current_user.id and current_user.role != 'ADMIN':
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Mark as inactive
    zone.is_active = False
    zone.unmarked_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Zone unmarked successfully',
        'zone': zone.to_dict()
    }), 200


@police_bp.route('/flagged-zones/<int:zone_id>', methods=['DELETE'])
@token_required
@role_required('POLICE')
def delete_flagged_zone(current_user, zone_id):
    """Delete a flagged zone permanently (only by creator or admin)"""
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
        'message': 'Zone deleted permanently'
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
    """Report issue to infrastructure with map coordinates"""
    data = request.get_json()
    
    if not data.get('description'):
        return jsonify({'error': 'Description required'}), 400
    
    if not data.get('latitude') or not data.get('longitude'):
        return jsonify({'error': 'Location coordinates required'}), 400
    
    issue = Issue(
        reported_by_police_id=current_user.id,
        description=data['description'],
        location=data.get('location', ''),
        latitude=data['latitude'],
        longitude=data['longitude'],
        status='PENDING'
    )
    
    db.session.add(issue)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Issue reported to infrastructure',
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


@police_bp.route('/issues/all', methods=['GET'])
@token_required
@role_required('POLICE')
def get_all_police_issues(current_user):
    """Get all infrastructure issues from all police officers (for map view)"""
    issues = Issue.query.order_by(Issue.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'issues': [issue.to_dict() for issue in issues]
    }), 200


@police_bp.route('/dashboard-stats', methods=['GET'])
@token_required
@role_required('POLICE')
def get_dashboard_stats(current_user):
    """Get statistics for police dashboard"""
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # SOS Statistics
    total_sos = SOSEvent.query.count()
    active_sos = SOSEvent.query.filter_by(status='ACTIVE').count()
    resolved_sos = SOSEvent.query.filter_by(status='RESOLVED').count()
    
    # Flagged Zones Statistics
    total_zones = FlaggedZone.query.count()
    active_zones = FlaggedZone.query.filter_by(is_active=True).count()
    critical_zones = FlaggedZone.query.filter_by(is_active=True, risk_level='CRITICAL').count()
    high_zones = FlaggedZone.query.filter_by(is_active=True, risk_level='HIGH').count()
    
    # Infrastructure Issues Statistics
    total_issues = Issue.query.count()
    pending_issues = Issue.query.filter_by(status='PENDING').count()
    accepted_issues = Issue.query.filter_by(status='ACCEPTED').count()
    completed_issues = Issue.query.filter_by(status='COMPLETED').count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_sos = SOSEvent.query.filter(SOSEvent.timestamp >= week_ago).count()
    recent_zones = FlaggedZone.query.filter(FlaggedZone.timestamp >= week_ago).count()
    recent_issues = Issue.query.filter(Issue.timestamp >= week_ago).count()
    
    # Daily SOS trend (last 7 days)
    daily_sos = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        count = SOSEvent.query.filter(
            SOSEvent.timestamp >= day_start,
            SOSEvent.timestamp < day_end
        ).count()
        daily_sos.append({
            'date': day_start.strftime('%a'),
            'count': count
        })
    
    # High risk zones by risk level
    risk_distribution = []
    for level in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        count = FlaggedZone.query.filter_by(is_active=True, risk_level=level).count()
        risk_distribution.append({
            'level': level,
            'count': count
        })
    
    # Get high risk areas (active zones sorted by risk level)
    high_risk_areas = FlaggedZone.query.filter_by(is_active=True).order_by(
        db.case(
            (FlaggedZone.risk_level == 'CRITICAL', 1),
            (FlaggedZone.risk_level == 'HIGH', 2),
            (FlaggedZone.risk_level == 'MEDIUM', 3),
            (FlaggedZone.risk_level == 'LOW', 4),
            else_=5
        ),
        FlaggedZone.timestamp.desc()
    ).limit(10).all()
    
    return jsonify({
        'success': True,
        'stats': {
            'sos': {
                'total': total_sos,
                'active': active_sos,
                'resolved': resolved_sos,
                'recent': recent_sos
            },
            'zones': {
                'total': total_zones,
                'active': active_zones,
                'critical': critical_zones,
                'high': high_zones,
                'recent': recent_zones
            },
            'issues': {
                'total': total_issues,
                'pending': pending_issues,
                'accepted': accepted_issues,
                'completed': completed_issues,
                'recent': recent_issues
            },
            'trends': {
                'daily_sos': daily_sos,
                'risk_distribution': risk_distribution
            },
            'high_risk_areas': [zone.to_dict() for zone in high_risk_areas]
        }
    }), 200
