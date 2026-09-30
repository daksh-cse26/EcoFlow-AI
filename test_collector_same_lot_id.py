import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8088"

def api_post(endpoint, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def api_get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_tests():
    print("[TEST 1] Household posts scrap -> Verify same Lot ID is returned to Collector...")
    post_res = api_post("/api/household/post-scrap", {
        "household_name": "Collector Match Citizen",
        "phone": "+91 94350 99887",
        "address": "Peace Enclave, Beltola, Guwahati",
        "zone": "ZONE B",
        "items": [
            {"code": "IRON_STEEL", "name": "Iron & Steel Scrap", "weight": 22.0, "rate": 28.0, "amount": 616.0}
        ]
    })
    
    assert post_res.get("success"), "Post scrap failed"
    hh_lot_id = post_res.get("lot_id")
    hh_pickup_id = post_res.get("pickup_id")
    assigned_col = post_res.get("assigned_collector", {})
    col_id = assigned_col.get("employee_id")
    
    print(f"Household generated Pickup ID: {hh_pickup_id}")
    print(f"Household generated Lot ID: {hh_lot_id}")
    print(f"Assigned Collector ID: {col_id}")
    assert hh_lot_id, "Household Lot ID must exist"
    assert col_id, "Assigned collector ID must exist"

    # Query the Field Collector's active assignment
    col_active = api_get(f"/api/collector/active-assignment?collector_id={col_id}")
    print(f"Collector API response: has_active={col_active.get('has_active')}")
    print(f"Collector Lot ID: {col_active.get('lot_id')}")
    print(f"Collector Pickup ID: {col_active.get('pickup_id')}")
    
    assert col_active.get("has_active") is True, "Collector should have active assignment"
    assert col_active.get("lot_id") == hh_lot_id, f"Lot IDs must match! HH={hh_lot_id}, Col={col_active.get('lot_id')}"
    assert col_active.get("pickup_id") == hh_pickup_id, f"Pickup IDs must match! HH={hh_pickup_id}, Col={col_active.get('pickup_id')}"
    print("[PASSED] Test 1: Field collector interface receives EXACT same Lot ID from accepted pickup.")

    print("\n[TEST 2] Field Collector Seals Lot -> Verify Lot ID remains strictly identical...")
    seal_res = api_post("/api/collector/collect", {
        "pickup_id": hh_pickup_id,
        "lot_id": hh_lot_id,
        "collector_id": col_id
    })
    assert seal_res.get("success"), "Collector collect failed"
    sealed_lot_id = seal_res.get("lot_id")
    print(f"Sealed Lot ID returned: {sealed_lot_id}")
    assert sealed_lot_id == hh_lot_id, f"Sealed lot ID {sealed_lot_id} must match original {hh_lot_id}"
    print("[PASSED] Test 2: Sealed lot ID preserves the exact same Lot ID.")

    print("\n[TEST 3] Field Coordinator Assigns Pickup -> Verify Collector gets bound Lot ID...")
    coord_post = api_post("/api/household/post-scrap", {
        "household_name": "Coordinator Test Citizen",
        "phone": "+91 94350 44332",
        "address": "Chandmari, Guwahati",
        "zone": "ZONE B",
        "items": [
            {"code": "PET_BOTTLE", "name": "PET Plastic", "weight": 10.0, "rate": 18.0, "amount": 180.0}
        ]
    })
    coord_pickup_id = coord_post.get("pickup_id")
    initial_lot_id = coord_post.get("lot_id")
    
    # Coordinator explicitly assigns to a collector (e.g. COL-00142)
    target_collector = "COL-00142"
    assign_res = api_post("/api/coordinator/assign", {
        "pickup_id": coord_pickup_id,
        "employee_id": target_collector
    })
    assert assign_res.get("success"), "Coordinator assign failed"
    print(f"Coordinator assigned {coord_pickup_id} to {target_collector}")
    
    # Query Collector's active assignment
    col_active_coord = api_get(f"/api/collector/active-assignment?collector_id={target_collector}")
    print(f"Assigned Collector Lot ID: {col_active_coord.get('lot_id')}")
    assert col_active_coord.get("lot_id") == initial_lot_id, f"Expected {initial_lot_id}, got {col_active_coord.get('lot_id')}"
    assert col_active_coord.get("pickup_id") == coord_pickup_id
    print("[PASSED] Test 3: Coordinator assigned pickup correctly reflects the same Lot ID to the collector.")

    print("\nALL COLLECTOR LOT ID SYNCHRONIZATION TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
