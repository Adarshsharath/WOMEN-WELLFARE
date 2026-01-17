"""
Test script to verify zone marking endpoint works
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

# First, login as police to get token
def test_zone_marking():
    print("🧪 Testing Zone Marking Endpoint...\n")
    
    # Step 1: Login as police officer
    print("1️⃣ Logging in as police officer...")
    login_data = {
        "email": "police@test.com",
        "password": "police123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"   ✅ Login successful! Token: {token[:20]}...")
            
            # Step 2: Test marking a zone
            print("\n2️⃣ Testing zone marking...")
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            zone_data = {
                "latitude": 12.9716,
                "longitude": 77.5946,
                "risk_level": "HIGH",
                "reason": "Recent incidents of harassment reported in this area",
                "description": "Poor lighting, isolated area at night"
            }
            
            response = requests.post(f"{BASE_URL}/police/flag-zone", json=zone_data, headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            
            if response.status_code in [200, 201]:
                print("\n   ✅ Zone marked successfully!")
                zone = response.json()
                print(f"   Zone ID: {zone.get('zone', {}).get('id')}")
                print(f"   Reason: {zone.get('zone', {}).get('reason')}")
            else:
                print(f"\n   ❌ Failed to mark zone")
                
        else:
            print(f"   ❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "="*50)

if __name__ == '__main__':
    test_zone_marking()
