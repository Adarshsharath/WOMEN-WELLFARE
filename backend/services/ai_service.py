import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'


def chat_with_gemini(message, conversation_history=None):
    """Send message to Gemini AI and get response"""
    try:
        if not GEMINI_API_KEY:
            return {
                'success': False,
                'error': 'Gemini API key not configured',
                'message': "I'm here to help, but the AI service isn't configured yet. Please reach out to your emergency contacts if you need immediate assistance."
            }
        
        # System prompt for emotional support
        system_prompt = """You are a compassionate AI assistant for SafeSpace, a women's safety platform. 
        Your role is to provide emotional support to women who may be in distress or feeling unsafe.
        
        Guidelines:
        - Be warm, empathetic, and non-judgmental
        - Listen actively and validate their feelings
        - Offer practical safety advice when appropriate
        - Encourage them to reach out to emergency contacts or authorities if they're in danger
        - Keep responses concise but caring (2-3 sentences)
        - Never dismiss their concerns, no matter how small they may seem
        - If they're in immediate danger, urge them to call emergency services (police, ambulance)
        
        Remember: Your goal is to make them feel heard, safe, and supported."""
        
        # Build conversation context
        conversation_text = system_prompt + "\n\n"
        if conversation_history:
            for msg in conversation_history:
                role = "User" if msg['role'] == 'user' else "Assistant"
                conversation_text += f"{role}: {msg['content']}\n"
        conversation_text += f"User: {message}\nAssistant:"
        
        # API Request
        url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
        payload = {
            'contents': [{
                'parts': [{'text': conversation_text}]
            }]
        }
        
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and len(data['candidates']) > 0:
                reply = data['candidates'][0]['content']['parts'][0]['text']
                return {
                    'success': True,
                    'message': reply.strip()
                }
            else:
                return {
                    'success': False,
                    'error': 'No response from AI',
                    'message': "I'm having trouble connecting right now. Please try again or reach out to your emergency contacts."
                }
        else:
            return {
                'success': False,
                'error': f'API error: {response.status_code}',
                'message': "I'm experiencing technical difficulties. Please contact your emergency contacts if you need immediate help."
            }
    
    except Exception as e:
        print(f"Error with Gemini AI: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'message': "Something went wrong. If you're in danger, please call emergency services immediately."
        }


def summarize_incident(incident_description, location, timestamp):
    """Generate a structured incident summary using Gemini AI"""
    try:
        if not GEMINI_API_KEY:
            return {
                'success': False,
                'error': 'Gemini API key not configured'
            }
        
        prompt = f"""Create a structured incident report based on the following information:

Incident Description: {incident_description}
Location: {location}
Timestamp: {timestamp}

Please provide:
1. Summary (1-2 sentences)
2. Key details
3. Recommended actions
4. Severity level (Low/Medium/High/Critical)

Format as a clear, professional incident report."""
        
        url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
        payload = {
            'contents': [{
                'parts': [{'text': prompt}]
            }]
        }
        
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and len(data['candidates']) > 0:
                summary = data['candidates'][0]['content']['parts'][0]['text']
                return {
                    'success': True,
                    'summary': summary.strip()
                }
        
        return {
            'success': False,
            'error': 'Failed to generate summary'
        }
    
    except Exception as e:
        print(f"Error generating incident summary: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
