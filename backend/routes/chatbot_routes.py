from flask import Blueprint, request, jsonify
from auth import token_required, role_required
from services.ai_service import chat_with_gemini, summarize_incident

chatbot_bp = Blueprint('chatbot', __name__)


@chatbot_bp.route('/message', methods=['POST'])
@token_required
@role_required('WOMAN')
def send_message(current_user):
    """Send message to AI chatbot"""
    data = request.get_json()
    
    if not data.get('message'):
        return jsonify({'error': 'Message required'}), 400
    
    # Get conversation history if provided
    conversation_history = data.get('conversation_history', [])
    
    # Get AI response
    result = chat_with_gemini(data['message'], conversation_history)
    
    return jsonify(result), 200


@chatbot_bp.route('/summarize', methods=['POST'])
@token_required
@role_required('WOMAN')
def summarize(current_user):
    """Generate incident summary"""
    data = request.get_json()
    
    required = ['incident_description', 'location', 'timestamp']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    result = summarize_incident(
        data['incident_description'],
        data['location'],
        data['timestamp']
    )
    
    return jsonify(result), 200
