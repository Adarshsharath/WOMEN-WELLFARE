import os
import requests
from dotenv import load_dotenv

load_dotenv()

FAST2SMS_API_KEY = os.getenv('FAST2SMS_API_KEY')
FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2'


def send_emergency_sms(phone_number, woman_name, latitude, longitude, battery):
    """Send emergency SMS via Fast2SMS"""
    try:
        if not FAST2SMS_API_KEY:
            print("Warning: Fast2SMS API key not configured")
            return False
        
        message = f"🚨 EMERGENCY ALERT! {woman_name} has triggered SOS. Location: https://maps.google.com/?q={latitude},{longitude} | Battery: {battery}% | Please respond immediately!"
        
        payload = {
            'authorization': FAST2SMS_API_KEY,
            'route': 'q',
            'message': message,
            'language': 'english',
            'flash': '0',
            'numbers': phone_number
        }
        
        headers = {
            'cache-control': 'no-cache'
        }
        
        response = requests.post(FAST2SMS_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            print(f"SMS sent successfully to {phone_number}")
            return True
        else:
            print(f"Failed to send SMS: {response.text}")
            return False
    
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        return False


def send_bulk_emergency_sms(contacts, woman_name, latitude, longitude, battery):
    """Send emergency SMS to multiple contacts"""
    results = []
    for contact in contacts:
        success = send_emergency_sms(
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
