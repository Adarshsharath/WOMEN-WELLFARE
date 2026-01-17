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
