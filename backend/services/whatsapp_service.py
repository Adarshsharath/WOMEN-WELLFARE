import os
import requests
from dotenv import load_dotenv

load_dotenv()

WHATSAPP_API_TOKEN = os.getenv('WHATSAPP_API_TOKEN')
WHATSAPP_PHONE_ID = os.getenv('WHATSAPP_PHONE_ID')
WHATSAPP_URL = f'https://graph.facebook.com/v17.0/{WHATSAPP_PHONE_ID}/messages'


def send_emergency_whatsapp(phone_number, woman_name, latitude, longitude, battery):
    """Send emergency WhatsApp message via WhatsApp Business API"""
    try:
        if not WHATSAPP_API_TOKEN or not WHATSAPP_PHONE_ID:
            print("Warning: WhatsApp API credentials not configured")
            return False
        
        # Format phone number (remove leading + if present)
        formatted_phone = phone_number.replace('+', '')
        
        message_text = f"🚨 *EMERGENCY ALERT*\n\n{woman_name} has triggered an SOS!\n\n📍 Location: https://maps.google.com/?q={latitude},{longitude}\n🔋 Battery: {battery}%\n\n⚠️ Please respond immediately!"
        
        payload = {
            'messaging_product': 'whatsapp',
            'to': formatted_phone,
            'type': 'text',
            'text': {
                'body': message_text
            }
        }
        
        headers = {
            'Authorization': f'Bearer {WHATSAPP_API_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(WHATSAPP_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            print(f"WhatsApp message sent successfully to {phone_number}")
            return True
        else:
            print(f"Failed to send WhatsApp message: {response.text}")
            return False
    
    except Exception as e:
        print(f"Error sending WhatsApp message: {str(e)}")
        return False


def send_bulk_emergency_whatsapp(contacts, woman_name, latitude, longitude, battery):
    """Send emergency WhatsApp messages to multiple contacts"""
    results = []
    for contact in contacts:
        success = send_emergency_whatsapp(
            contact['contact_phone'],
            woman_name,
            latitude,
            longitude,
            battery
        )
        results.append({
            'contact': contact['contact_name'],
            'phone': contact['contact_phone'],
            'success': success
        })
    return results
