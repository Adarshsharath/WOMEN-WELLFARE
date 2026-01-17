import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
DEFAULT_MODEL = 'llama-3.3-70b-versatile'

def chat_with_gemini(message, conversation_history=None):
    """
    Send message to Groq AI and get response. 
    Maintained the function name 'chat_with_gemini' to avoid breaking frontend/other service calls.
    """
    try:
        # Debug: Check key loading
        print(f"DEBUG: Groq API Key loaded (first 4): {GROQ_API_KEY[:4] if GROQ_API_KEY else 'None'}")
        
        if not GROQ_API_KEY:
            return {
                'success': False,
                'error': 'Groq API key not configured',
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
        
        # Build Groq messages list
        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            for msg in conversation_history:
                # Map roles correctly if needed, Groq uses 'user' and 'assistant'
                role = "user" if msg['role'] == 'user' else "assistant"
                messages.append({"role": role, "content": msg['content']})
        
        messages.append({"role": "user", "content": message})
        
        # API Request
        payload = {
            'model': DEFAULT_MODEL,
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 500
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {GROQ_API_KEY}'
        }
        
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                reply = data['choices'][0]['message']['content']
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
            print(f"DEBUG: Groq API Error {response.status_code}")
            print(f"DEBUG: Response body: {response.text}")
            return {
                'success': False,
                'error': f'API error: {response.status_code}',
                'message': "I'm experiencing technical difficulties. Please contact your emergency contacts if you need immediate help."
            }
    
    except Exception as e:
        print(f"Error with Groq AI: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'message': "Something went wrong. If you're in danger, please call emergency services immediately."
        }


def summarize_incident(incident_description, location, timestamp):
    """Generate a structured incident summary using Groq AI"""
    try:
        if not GROQ_API_KEY:
            return {
                'success': False,
                'error': 'Groq API key not configured'
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
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {GROQ_API_KEY}'
        }
        
        payload = {
            'model': DEFAULT_MODEL,
            'messages': [
                {"role": "system", "content": "You are a professional safety coordinator."},
                {"role": "user", "content": prompt}
            ]
        }
        
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                summary = data['choices'][0]['message']['content']
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
