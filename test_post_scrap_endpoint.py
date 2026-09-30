import urllib.request
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8088"

def test_post_scrap():
    print("Testing POST /api/household/post-scrap...")
    payload = {
        "household_name": "Test Citizen",
        "household_phone": "+91 98640 12345",
        "address": "House 14, Peace Enclave, Paltan Bazaar, Guwahati",
        "service_zone": "ZONE B",
        "materials": [
            {"code": "FE_SCRAP", "name": "Iron & Steel Scrap", "weight": 10.0, "rate": 28.50},
            {"code": "PLAST_PET", "name": "Plastic Bottles (PET)", "weight": 5.0, "rate": 18.00}
        ],
        "total_weight": 15.0,
        "total_value": 375.0,
        "waste_image": "sample_scrap.jpg"
    }

    req = urllib.request.Request(
        f"{BASE_URL}/api/household/post-scrap",
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("Response:", data)
            assert data.get("success") is True, f"Failed: {data}"
            assert "lot_id" in data, "lot_id missing"
            assert "pickup_id" in data, "pickup_id missing"
            assert data.get("is_locked") is True, "is_locked should be True"
            print("\nSUCCESS! /api/household/post-scrap works perfectly without any 'random' errors!")
    except urllib.error.HTTPError as e:
        print(f"HTTPError {e.code}: {e.read().decode('utf-8')}")
        sys.exit(1)
    except Exception as e:
        print("Error:", e)
        sys.exit(1)

if __name__ == "__main__":
    test_post_scrap()
