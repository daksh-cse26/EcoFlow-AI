import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8088"

def test_api():
    print("[TEST] 1. Testing GET /api/status...")
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/status", timeout=5)
        res = json.loads(req.read().decode('utf-8'))
        print(f"Server is up! System: {res.get('system')} (status: {res.get('status')})")
    except Exception as e:
        print(f"Health check failed: {e}")
        sys.exit(1)

    # TEST CASE 1: Household generates request via /api/household/post-scrap
    print("\n[TEST] 2. Household generates pickup request via /api/household/post-scrap...")
    post_scrap_payload = {
        "household_name": "Dr. Ananya Sarma",
        "household_phone": "+91 94350 99881",
        "address": "Bungalow 7, Hillside Road, Kharghuli, Guwahati",
        "service_zone": "ZONE B",
        "total_weight": 18.5,
        "total_value": 720.0,
        "materials": [
            {"name": "Brass & Copper Scrap", "weight": 6.5, "rate": 80.0},
            {"name": "Old Newspaper", "weight": 12.0, "rate": 16.0}
        ]
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/household/post-scrap",
        data=json.dumps(post_scrap_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res1 = json.loads(urllib.request.urlopen(req, timeout=5).read().decode('utf-8'))
    print(f"Created pickup! ID: {res1.get('pickup_id')}, Lot ID: {res1.get('lot_id')}")
    pickup_id_1 = res1.get('pickup_id')
    lot_id_1 = res1.get('lot_id')
    assert pickup_id_1, "Pickup ID should not be empty"

    # TEST CASE 2: Coordinator verifies address is in /api/pickups
    print("\n[TEST] 3. Coordinator views address in /api/pickups...")
    req_coord = urllib.request.urlopen(f"{BASE_URL}/api/pickups", timeout=5)
    pickups = json.loads(req_coord.read().decode('utf-8')).get('pickups', [])
    assert len(pickups) > 0, "Pickups queue should not be empty"
    
    found_coord = None
    for p in pickups:
        if p.get('pickup_id') == pickup_id_1:
            found_coord = p
            break
            
    assert found_coord is not None, f"Pickup {pickup_id_1} not found in coordinator queue"
    print(f"Coordinator found pickup: {found_coord.get('pickup_id')}")
    print(f"  -> Address: {found_coord.get('address')}")
    print(f"  -> Landmark: {found_coord.get('landmark')}")
    print(f"  -> Citizen: {found_coord.get('household_name')} ({found_coord.get('household_phone')})")
    assert found_coord.get('address') == post_scrap_payload['address'], "Coordinator address mismatch!"

    # TEST CASE 3: Field Collector verifies address is in /api/collector/active-assignment
    print("\n[TEST] 4. Field Collector views address in /api/collector/active-assignment...")
    assigned_col = res1.get('assigned_collector', {}).get('employee_id', 'COL-00142')
    req_col = urllib.request.urlopen(f"{BASE_URL}/api/collector/active-assignment?collector_id={assigned_col}", timeout=5)
    col_data = json.loads(req_col.read().decode('utf-8'))
    
    print(f"Collector Active: {col_data.get('has_active')}")
    print(f"  -> Pickup ID: {col_data.get('pickup_id')}")
    print(f"  -> Address: {col_data.get('address')}")
    print(f"  -> Landmark: {col_data.get('landmark')}")
    print(f"  -> Citizen: {col_data.get('household_name')} ({col_data.get('household_phone')})")
    print(f"  -> Lot ID: {col_data.get('lot_id')}")
    assert col_data.get('has_active') is True, "Collector should have active assignment"
    assert col_data.get('address') == post_scrap_payload['address'], "Collector address mismatch!"
    assert col_data.get('lot_id') == lot_id_1, "Collector lot ID mismatch!"

    # TEST CASE 4: Household creates pickup via /api/pickups/create
    print("\n[TEST] 5. Household generates pickup request via /api/pickups/create...")
    create_payload = {
        "household_name": "Vikram Barua",
        "household_phone": "+91 98642 33445",
        "address": "Plot 104, Brahmaputra View, Uzanbazar, Guwahati",
        "landmark": "Near Uzanbazar Ghat",
        "service_zone": "ZONE B",
        "preliminary_material": "Corrugated Cardboard",
        "user_estimated_weight": 22.0,
        "indicative_rate": 15.0
    }
    req2 = urllib.request.Request(
        f"{BASE_URL}/api/pickups/create",
        data=json.dumps(create_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res2 = json.loads(urllib.request.urlopen(req2, timeout=5).read().decode('utf-8'))
    pickup_id_2 = res2.get('pickup_id')
    print(f"Created pickup! ID: {pickup_id_2}")
    assert pickup_id_2, "Pickup ID should not be empty"

    # Verify Coordinator sees new address immediately
    print("\n[TEST] 6. Coordinator views new request address in /api/pickups...")
    req_coord2 = urllib.request.urlopen(f"{BASE_URL}/api/pickups", timeout=5)
    pickups2 = json.loads(req_coord2.read().decode('utf-8')).get('pickups', [])
    found_coord2 = None
    for p in pickups2:
        if p.get('pickup_id') == pickup_id_2:
            found_coord2 = p
            break
            
    assert found_coord2 is not None, f"Pickup {pickup_id_2} not found in coordinator queue"
    print(f"Coordinator found pickup: {found_coord2.get('pickup_id')}")
    print(f"  -> Address: {found_coord2.get('address')}")
    print(f"  -> Landmark: {found_coord2.get('landmark')}")
    print(f"  -> Citizen: {found_coord2.get('household_name')} ({found_coord2.get('household_phone')})")
    assert found_coord2.get('address') == create_payload['address'], "Coordinator address mismatch for pickups/create!"

    # Verify Collector views new address
    print("\n[TEST] 7. Field Collector views newly generated address in /api/collector/active-assignment...")
    req_col2 = urllib.request.urlopen(f"{BASE_URL}/api/collector/active-assignment?collector_id=COL-00142", timeout=5)
    col_data2 = json.loads(req_col2.read().decode('utf-8'))
    print(f"Collector Active: {col_data2.get('has_active')}")
    print(f"  -> Pickup ID: {col_data2.get('pickup_id')}")
    print(f"  -> Address: {col_data2.get('address')}")
    print(f"  -> Citizen: {col_data2.get('household_name')}")
    assert col_data2.get('has_active') is True
    assert col_data2.get('address') in [post_scrap_payload['address'], create_payload['address']]

    print("\n[SUCCESS] ALL ADDRESS VISIBILITY TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_api()
