from flask import Blueprint, request, jsonify
from models import db, SOSEvent, ChatMessage
from auth import token_required, role_required

emergency_bp = Blueprint('emergency', __name__)


@emergency_bp.route('/sos-events', methods=['GET'])
@token_required
@role_required('EMERGENCY')
def get_all_sos_events(current_user):
    """Get all SOS events (active and resolved)"""
    status_filter = request.args.get('status')  # Optional filter
    
    query = SOSEvent.query
    
    if status_filter:
        query = query.filter_by(status=status_filter.upper())
    
    sos_events = query.order_by(SOSEvent.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'sos_events': [event.to_dict() for event in sos_events]
    }), 200


@emergency_bp.route('/broadcast', methods=['POST'])
@token_required
@role_required('EMERGENCY')
def broadcast_message(current_user):
    """Broadcast message to all emergency channels"""
    data = request.get_json()
    
    if not data.get('message'):
        return jsonify({'error': 'Message required'}), 400
    
    message = ChatMessage(
        sender_id=current_user.id,
        message_text=data['message'],
        chat_type='EMERGENCY_BROADCAST'
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': message.to_dict()
    }), 201


@emergency_bp.route('/broadcast', methods=['GET'])
@token_required
@role_required('EMERGENCY')
def get_broadcast_messages(current_user):
    """Get all broadcast messages"""
    messages = ChatMessage.query.filter_by(
        chat_type='EMERGENCY_BROADCAST'
    ).order_by(ChatMessage.timestamp.desc()).limit(100).all()
    
    return jsonify({
        'success': True,
        'messages': [msg.to_dict() for msg in reversed(messages)]
    }), 200


@emergency_bp.route('/dashboard-stats', methods=['GET'])
@token_required
@role_required('EMERGENCY')
def get_dashboard_stats(current_user):
    """Get statistics for emergency dashboard"""
    from models import User, FlaggedZone
    from datetime import datetime, timedelta
    
    # SOS Statistics
    total_sos = SOSEvent.query.count()
    active_sos = SOSEvent.query.filter_by(status='ACTIVE').count()
    resolved_sos = SOSEvent.query.filter_by(status='RESOLVED').count()
    cancelled_sos = SOSEvent.query.filter_by(status='CANCELLED').count()
    
    # Response Statistics
    # Calculate average response time (simplified)
    response_rate = round((resolved_sos / total_sos * 100) if total_sos > 0 else 0, 1)
    
    # Recent activity (last 24 hours)
    day_ago = datetime.utcnow() - timedelta(hours=24)
    recent_sos = SOSEvent.query.filter(SOSEvent.timestamp >= day_ago).count()
    recent_active = SOSEvent.query.filter(
        SOSEvent.timestamp >= day_ago,
        SOSEvent.status == 'ACTIVE'
    ).count()
    
    # Hourly SOS trend (last 12 hours)
    hourly_sos = []
    for i in range(11, -1, -1):
        hour_start = datetime.utcnow().replace(minute=0, second=0) - timedelta(hours=i)
        hour_end = hour_start + timedelta(hours=1)
        count = SOSEvent.query.filter(
            SOSEvent.timestamp >= hour_start,
            SOSEvent.timestamp < hour_end
        ).count()
        hourly_sos.append({
            'hour': hour_start.strftime('%I%p'),
            'count': count
        })
    
    # Status distribution
    status_distribution = [
        {'status': 'ACTIVE', 'count': active_sos},
        {'status': 'RESOLVED', 'count': resolved_sos},
        {'status': 'CANCELLED', 'count': cancelled_sos}
    ]
    
    # High risk areas count
    critical_zones = FlaggedZone.query.filter_by(is_active=True, risk_level='CRITICAL').count()
    high_zones = FlaggedZone.query.filter_by(is_active=True, risk_level='HIGH').count()
    
    # Women registered
    total_women = User.query.filter_by(role='WOMAN').count()
    
    return jsonify({
        'success': True,
        'stats': {
            'sos': {
                'total': total_sos,
                'active': active_sos,
                'resolved': resolved_sos,
                'cancelled': cancelled_sos,
                'recent_24h': recent_sos,
                'active_24h': recent_active
            },
            'response': {
                'rate': response_rate,
                'total_resolved': resolved_sos
            },
            'zones': {
                'critical': critical_zones,
                'high': high_zones,
                'total': critical_zones + high_zones
            },
            'users': {
                'total_women': total_women
            },
            'trends': {
                'hourly_sos': hourly_sos,
                'status_distribution': status_distribution
            }
        }
    }), 200
