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
