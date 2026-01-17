from flask import Blueprint, request, jsonify
from models import db, User, FlaggedUser
from auth import token_required, role_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/pending-approvals', methods=['GET'])
@token_required
@role_required('ADMIN')
def get_pending_approvals(current_user):
    """Get all community members awaiting approval"""
    pending_users = User.query.filter_by(is_approved=False).filter(
        User.role.in_(['POLICE', 'INFRASTRUCTURE', 'CYBERSECURITY', 'EMERGENCY'])
    ).all()
    
    return jsonify({
        'success': True,
        'pending_approvals': [user.to_dict() for user in pending_users]
    }), 200


@admin_bp.route('/approve/<int:user_id>', methods=['PUT'])
@token_required
@role_required('ADMIN')
def approve_user(current_user, user_id):
    """Approve a community member"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_approved:
        return jsonify({'error': 'User already approved'}), 400
    
    user.is_approved = True
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'{user.name} has been approved',
        'user': user.to_dict()
    }), 200


@admin_bp.route('/reject/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('ADMIN')
def reject_user(current_user, user_id):
    """Reject and delete a community member registration"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_approved:
        return jsonify({'error': 'Cannot reject approved user'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'User registration rejected'
    }), 200


@admin_bp.route('/flagged-users', methods=['GET'])
@token_required
@role_required('ADMIN')
def get_flagged_users(current_user):
    """Get all users flagged by cybersecurity"""
    flagged_users = FlaggedUser.query.filter_by(
        status='PENDING'
    ).order_by(FlaggedUser.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'flagged_users': [flag.to_dict() for flag in flagged_users]
    }), 200


@admin_bp.route('/suspend/<int:user_id>', methods=['PUT'])
@token_required
@role_required('ADMIN')
def suspend_user(current_user, user_id):
    """Suspend a user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_suspended:
        return jsonify({'error': 'User already suspended'}), 400
    
    user.is_suspended = True
    
    # Update all flags for this user
    FlaggedUser.query.filter_by(user_id=user_id, status='PENDING').update({'status': 'REVIEWED'})
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'{user.name} has been suspended',
        'user': user.to_dict()
    }), 200


@admin_bp.route('/unsuspend/<int:user_id>', methods=['PUT'])
@token_required
@role_required('ADMIN')
def unsuspend_user(current_user, user_id):
    """Unsuspend a user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not user.is_suspended:
        return jsonify({'error': 'User is not suspended'}), 400
    
    user.is_suspended = False
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'{user.name} has been unsuspended',
        'user': user.to_dict()
    }), 200


@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required('ADMIN')
def get_all_users(current_user):
    """Get all users"""
    users = User.query.all()
    
    return jsonify({
        'success': True,
        'users': [user.to_dict() for user in users]
    }), 200


@admin_bp.route('/dashboard-stats', methods=['GET'])
@token_required
@role_required('ADMIN')
def get_dashboard_stats(current_user):
    """Get statistics for admin dashboard"""
    from models import SOSEvent, FlaggedZone, Issue
    from datetime import datetime, timedelta
    
    # User Statistics
    total_users = User.query.count()
    women_users = User.query.filter_by(role='WOMAN').count()
    police_users = User.query.filter_by(role='POLICE', is_approved=True).count()
    infra_users = User.query.filter_by(role='INFRASTRUCTURE', is_approved=True).count()
    emergency_users = User.query.filter_by(role='EMERGENCY', is_approved=True).count()
    cyber_users = User.query.filter_by(role='CYBERSECURITY', is_approved=True).count()
    
    pending_approvals = User.query.filter_by(is_approved=False).filter(
        User.role.in_(['POLICE', 'INFRASTRUCTURE', 'CYBERSECURITY', 'EMERGENCY'])
    ).count()
    
    suspended_users = User.query.filter_by(is_suspended=True).count()
    
    # Flagged Users
    pending_flags = FlaggedUser.query.filter_by(status='PENDING').count()
    total_flags = FlaggedUser.query.count()
    
    # System-wide Statistics
    total_sos = SOSEvent.query.count()
    active_sos = SOSEvent.query.filter_by(status='ACTIVE').count()
    total_zones = FlaggedZone.query.filter_by(is_active=True).count()
    total_issues = Issue.query.count()
    pending_issues = Issue.query.filter_by(status='PENDING').count()
    
    # Recent activity (last 30 days)
    month_ago = datetime.utcnow() - timedelta(days=30)
    new_users_month = User.query.filter(User.created_at >= month_ago).count() if hasattr(User, 'created_at') else 0
    
    # User growth trend (last 7 days)
    user_growth = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0) - timedelta(days=i)
        # Approximate - in production you'd have timestamps
        user_growth.append({
            'date': day_start.strftime('%a'),
            'users': total_users  # Simplified - would track actual daily registrations
        })
    
    # Role distribution
    role_distribution = [
        {'role': 'WOMEN', 'count': women_users},
        {'role': 'POLICE', 'count': police_users},
        {'role': 'INFRASTRUCTURE', 'count': infra_users},
        {'role': 'EMERGENCY', 'count': emergency_users},
        {'role': 'CYBERSECURITY', 'count': cyber_users}
    ]
    
    # System health metrics
    system_health = {
        'active_sos': active_sos,
        'pending_approvals': pending_approvals,
        'pending_flags': pending_flags,
        'pending_issues': pending_issues,
        'status': 'healthy' if active_sos == 0 and pending_flags == 0 else 'attention_needed'
    }
    
    return jsonify({
        'success': True,
        'stats': {
            'users': {
                'total': total_users,
                'women': women_users,
                'police': police_users,
                'infrastructure': infra_users,
                'emergency': emergency_users,
                'cybersecurity': cyber_users,
                'pending_approvals': pending_approvals,
                'suspended': suspended_users
            },
            'flags': {
                'pending': pending_flags,
                'total': total_flags
            },
            'system': {
                'total_sos': total_sos,
                'active_sos': active_sos,
                'total_zones': total_zones,
                'total_issues': total_issues,
                'pending_issues': pending_issues
            },
            'trends': {
                'role_distribution': role_distribution
            },
            'health': system_health
        }
    }), 200
