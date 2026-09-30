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
    print("[TEST 1] Check static/index.html for removed simulate button...")
    with open("C:/Users/LOQ/.gemini/antigravity-ide/scratch/ecoflow-ai/static/index.html", "r", encoding="utf-8") as f:
        html = f.read()
    assert "btn-advance-step-demo" not in html, "ERROR: btn-advance-step-demo still in HTML!"
    assert "Simulate Real-Time Step Advance" not in html, "ERROR: Simulate text still in HTML!"
    assert "advancePickupStepDemo" not in html, "ERROR: advancePickupStepDemo still referenced in HTML!"
    assert "progress-dynamic-sync-pill" in html, "ERROR: dynamic sync pill not in HTML!"
    print("[PASSED] HTML does not have simulate button; dynamic sync pill is present.")

    print("\n[TEST 2] Lifecycle Path A: Post Scrap -> Field Collector Seals Lot -> Hub Verifies -> Hub Settles")
    # 1. Post Scrap
    post_res = api_post("/api/household/post-scrap", {
        "household_name": "Dynamic Sync Test User",
        "phone": "+91 94350 11223",
        "address": "House 42, Zoo Road, Guwahati",
        "zone": "ZONE B",
        "items": [
            {"code": "IRON_STEEL", "name": "Iron & Steel Scrap", "weight": 15.0, "rate": 28.0, "amount": 420.0},
            {"code": "PET_BOTTLE", "name": "PET Plastic Containers", "weight": 5.0, "rate": 18.0, "amount": 90.0}
        ]
    })
    pickup_id = post_res.get("pickup_id")
    print(f"Created Pickup: {pickup_id}")
    assert pickup_id, "Pickup ID should be present"

    # Check Household status -> Step 2 (Assigned)
    hh_status = api_get(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Household initial step: {hh_status.get('step')}, is_locked: {hh_status.get('is_locked')}")
    assert hh_status.get("step") == 2, f"Expected step 2, got {hh_status.get('step')}"
    assert hh_status.get("is_locked") is True

    # 2. Field Collector updates process -> Seals digital waste lot
    collect_res = api_post("/api/collector/collect", {
        "pickup_id": pickup_id,
        "collector_id": "COL-00142"
    })
    lot_id = collect_res.get("lot_id")
    print(f"Field Collector sealed lot: {lot_id}")

    # Check Household status -> Step 3 (Scrap Verified)
    hh_status = api_get(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Household after collector collection: step={hh_status.get('step')}")
    assert hh_status.get("step") == 3, f"Expected step 3, got {hh_status.get('step')}"

    # 3. Storage Hub verifies physical scale weighment
    verify_res = api_post("/api/hub/verify", {
        "lot_id": lot_id,
        "operator_name": "Hub Operator",
        "materials_breakdown": [
            {"material_name": "Iron & Steel Scrap", "grade": "GRADE A", "verified_weight": 14.8, "rate_per_kg": 28.0},
            {"material_name": "PET Plastic Containers", "grade": "GRADE B", "verified_weight": 5.1, "rate_per_kg": 18.0}
        ]
    })
    print(f"Hub verified lot: final_amount={verify_res.get('final_amount')}")

    # Check Household status -> Step 4 (Payment Confirmed / Awaiting Settlement)
    hh_status = api_get(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Household after hub verification: step={hh_status.get('step')}")
    assert hh_status.get("step") == 4, f"Expected step 4, got {hh_status.get('step')}"

    # 4. Storage Hub disburses payment
    settle_res = api_post("/api/hub/settle-payment", {"lot_id": lot_id})
    print(f"Hub settled payment: {settle_res.get('success')}")

    # Check Household status -> Step 5 (Payment Received)
    hh_status = api_get(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Household after settlement: step={hh_status.get('step')}")
    assert hh_status.get("step") == 5, f"Expected step 5, got {hh_status.get('step')}"
    print("[PASSED] Lifecycle Path A completed successfully.")

    print("\n[TEST 3] Lifecycle Path B: Post Scrap -> Field Coordinator Marks COLLECTED (for no-phone collector) -> Hub Verifies -> Hub Settles")
    post_res_b = api_post("/api/household/post-scrap", {
        "household_name": "Coordinator Assisted Citizen",
        "phone": "+91 98640 55443",
        "address": "Sector 3, Dispur, Guwahati",
        "zone": "ZONE A",
        "items": [
            {"code": "CARDBOARD", "name": "Corrugated Cardboard", "weight": 20.0, "rate": 9.0, "amount": 180.0}
        ]
    })
    pickup_id_b = post_res_b.get("pickup_id")
    print(f"Created Pickup B: {pickup_id_b}")

    # Check Household status -> Step 2
    hh_status_b = api_get(f"/api/household/active-pickup?pickup_id={pickup_id_b}")
    assert hh_status_b.get("step") == 2

    # Field Coordinator marks status as COLLECTED
    coord_res = api_post("/api/coordinator/mark-status", {
        "pickup_id": pickup_id_b,
        "status": "COLLECTED"
    })
    print(f"Field Coordinator marked status: {coord_res}")

    # Check Household status -> Step 3 (Dynamically filled because coordinator updated process!)
    hh_status_b = api_get(f"/api/household/active-pickup?pickup_id={pickup_id_b}")
    lot_id_b = hh_status_b.get("lot_id")
    print(f"Household after coordinator update: step={hh_status_b.get('step')}, lot_id={lot_id_b}")
    assert hh_status_b.get("step") == 3, f"Expected step 3, got {hh_status_b.get('step')}"

    # Storage Hub verifies lot
    verify_res_b = api_post("/api/hub/verify", {
        "lot_id": lot_id_b,
        "operator_name": "Hub Operator",
        "materials_breakdown": [
            {"material_name": "Corrugated Cardboard", "grade": "GRADE A", "verified_weight": 20.5, "rate_per_kg": 9.0}
        ]
    })
    hh_status_b = api_get(f"/api/household/active-pickup?pickup_id={pickup_id_b}")
    assert hh_status_b.get("step") == 4, f"Expected step 4, got {hh_status_b.get('step')}"
    print(f"Household after hub verification: step={hh_status_b.get('step')}")

    # Storage Hub settles payment
    settle_res_b = api_post("/api/hub/settle-payment", {"lot_id": lot_id_b})
    hh_status_b = api_get(f"/api/household/active-pickup?pickup_id={pickup_id_b}")
    assert hh_status_b.get("step") == 5, f"Expected step 5, got {hh_status_b.get('step')}"
    print(f"Household after settlement: step={hh_status_b.get('step')}")
    print("[PASSED] Lifecycle Path B completed successfully.")

    print("\nALL DYNAMIC LIFECYCLE TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
