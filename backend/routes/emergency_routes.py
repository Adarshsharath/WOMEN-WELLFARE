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
