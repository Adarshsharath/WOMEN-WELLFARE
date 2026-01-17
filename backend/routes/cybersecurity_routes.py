from flask import Blueprint, request, jsonify
from models import db, AbuseMonitoring, FlaggedUser
from auth import token_required, role_required

cybersecurity_bp = Blueprint('cybersecurity', __name__)


@cybersecurity_bp.route('/monitoring', methods=['GET'])
@token_required
@role_required('CYBERSECURITY')
def get_abuse_monitoring(current_user):
    """Get abuse monitoring data for all women users"""
    monitoring_data = AbuseMonitoring.query.all()
    
    return jsonify({
        'success': True,
        'monitoring': [data.to_dict() for data in monitoring_data]
    }), 200


@cybersecurity_bp.route('/flag-user', methods=['POST'])
@token_required
@role_required('CYBERSECURITY')
def flag_user(current_user):
    """Flag a user for admin review"""
    data = request.get_json()
    
    if not data.get('user_id') or not data.get('reason'):
        return jsonify({'error': 'User ID and reason required'}), 400
    
    # Check if already flagged
    existing_flag = FlaggedUser.query.filter_by(
        user_id=data['user_id'],
        status='PENDING'
    ).first()
    
    if existing_flag:
        return jsonify({'error': 'User already flagged for review'}), 400
    
    # Create flag
    flagged_user = FlaggedUser(
        user_id=data['user_id'],
        flagged_by_id=current_user.id,
        reason=data['reason'],
        status='PENDING'
    )
    
    db.session.add(flagged_user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'User flagged for admin review',
        'flag': flagged_user.to_dict()
    }), 201


@cybersecurity_bp.route('/flagged-users', methods=['GET'])
@token_required
@role_required('CYBERSECURITY', 'ADMIN')
def get_flagged_users(current_user):
    """Get all flagged users"""
    flagged_users = FlaggedUser.query.order_by(FlaggedUser.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'flagged_users': [flag.to_dict() for flag in flagged_users]
    }), 200


@cybersecurity_bp.route('/dashboard-stats', methods=['GET'])
@token_required
@role_required('CYBERSECURITY')
def get_dashboard_stats(current_user):
    """Get statistics for cybersecurity dashboard"""
    from models import User, SOSEvent
    from datetime import datetime, timedelta
    
    # Monitoring Statistics
    total_monitored = AbuseMonitoring.query.count()
    active_monitoring = User.query.filter_by(role='WOMAN', is_suspended=False).count()
    
    # Flagged Users
    total_flags = FlaggedUser.query.count()
    pending_flags = FlaggedUser.query.filter_by(status='PENDING').count()
    reviewed_flags = FlaggedUser.query.filter_by(status='REVIEWED').count()
    
    # Suspended Users
    suspended_users = User.query.filter_by(is_suspended=True).count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_flags = FlaggedUser.query.filter(FlaggedUser.timestamp >= week_ago).count()
    
    # Daily flagging trend (last 7 days)
    daily_flags = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        count = FlaggedUser.query.filter(
            FlaggedUser.timestamp >= day_start,
            FlaggedUser.timestamp < day_end
        ).count()
        daily_flags.append({
            'date': day_start.strftime('%a'),
            'flags': count
        })
    
    # Status distribution
    status_distribution = [
        {'status': 'PENDING', 'count': pending_flags},
        {'status': 'REVIEWED', 'count': reviewed_flags}
    ]
    
    # System alerts
    active_sos_count = SOSEvent.query.filter_by(status='ACTIVE').count()
    
    return jsonify({
        'success': True,
        'stats': {
            'monitoring': {
                'total': total_monitored,
                'active': active_monitoring,
                'suspended': suspended_users
            },
            'flags': {
                'total': total_flags,
                'pending': pending_flags,
                'reviewed': reviewed_flags,
                'recent': recent_flags
            },
            'alerts': {
                'active_sos': active_sos_count,
                'pending_flags': pending_flags
            },
            'trends': {
                'daily_flags': daily_flags,
                'status_distribution': status_distribution
            }
        }
    }), 200
