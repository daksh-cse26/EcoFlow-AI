import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8088"

def req(path, method="GET", body=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"} if body else {}
    data = json.dumps(body).encode("utf-8") if body else None
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=== TEST 1: Household Posts Scrap & Collector is Assigned ===")
    post_res = req("/api/household/post-scrap", "POST", {
        "household_name": "Pooja Das",
        "household_phone": "+91 98640 55555",
        "address": "House 22, Silpukhuri, Guwahati",
        "service_zone": "ZONE B",
        "materials": [{"code": "COPPER_SCRAP", "name": "Copper Scrap & Wires", "weight": 8.0, "rate": 580.0, "subtotal": 4640.0}],
        "total_weight": 8.0,
        "total_value": 4640.0
    })
    assert post_res.get("success"), f"Failed: {post_res}"
    pickup_id = post_res["pickup_id"]
    assigned_collector = post_res["assigned_collector"]
    print(f"Created Pickup: {pickup_id}, Assigned Collector: {assigned_collector['name']} ({assigned_collector['employee_id']})")

    print("\n=== TEST 2: Active Pickup Check - Collector Assigned -> Step 2 ('Pickup Accepted' Checked) ===")
    act1 = req(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Active Pickup Step: {act1.get('step')}, has_active: {act1.get('has_active')}, is_locked: {act1.get('is_locked')}")
    assert act1["step"] == 2, f"Expected step 2, got {act1['step']}"
    assert act1["is_locked"] == True, "Expected is_locked to be True"

    print("\n=== TEST 3: Field Collector Seals Lot (Step 3: Scrap Verified / Lot Generated) ===")
    lot_id = f"LOT-2026-TEST-{pickup_id[-5:]}"
    seal_res = req("/api/collector/collect", "POST", {
        "lot_id": lot_id,
        "pickup_id": pickup_id,
        "collector_id": assigned_collector["employee_id"],
        "storage_hub_id": "HUB-001"
    })
    assert seal_res.get("success"), f"Failed to seal: {seal_res}"
    print(f"Lot sealed: {lot_id}, Status: {seal_res.get('status')}")

    print("\n=== TEST 4: Active Pickup Check - Lot Sealed -> Step 3 ('Scrap Verified' Checked) ===")
    act2 = req(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Active Pickup Step: {act2.get('step')}, lot_id: {act2.get('lot_id')}")
    assert act2["step"] == 3, f"Expected step 3, got {act2['step']}"

    print("\n=== TEST 5: Storage Hub Scans QR & Fetches Lot Details ===")
    lot_data = req(f"/api/lots/{lot_id}")
    assert "lot" in lot_data, f"Lot fetch failed: {lot_data}"
    fetched_lot = lot_data["lot"]
    print(f"Fetched Lot ID: {fetched_lot['lot_id']}, Household: {fetched_lot['household_name']}, Weight: {fetched_lot['user_estimated_weight']} kg, Status: {fetched_lot['verification_status']}")
    assert fetched_lot["verification_status"] == "SEALED"

    print("\n=== TEST 6: Storage Hub Manually Verifies Materials (/api/hub/verify) ===")
    verify_res = req("/api/hub/verify", "POST", {
        "lot_id": lot_id,
        "hub_id": "HUB-001",
        "operator_name": "Manoj Kalita (Chief Inspector)",
        "materials_breakdown": [
            {"material_name": "Copper Scrap", "grade": "GRADE A", "verified_weight": 8.1, "rate_per_kg": 610.0}
        ],
        "discrepancy_reason": "None",
        "discrepancy_notes": "Scale tare verified. High grade clean copper wire."
    })
    assert verify_res.get("success"), f"Verification failed: {verify_res}"
    print(f"Hub Verified! Weight: {verify_res.get('verified_weight')} kg, Amount: INR{verify_res.get('final_amount')}, Match: {verify_res.get('weight_match_status')}")

    print("\n=== TEST 7: Active Pickup Check - Hub Verified -> Step 4 ('Payment Confirmed' Checked) ===")
    act3 = req(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Active Pickup Step: {act3.get('step')}, status: {act3['pickup'].get('status')}")
    assert act3["step"] == 4, f"Expected step 4, got {act3['step']}"

    print("\n=== TEST 8: Storage Hub Releases Payment (/api/hub/settle-payment) ===")
    pay_res = req("/api/hub/settle-payment", "POST", {
        "lot_id": lot_id
    })
    assert pay_res.get("success"), f"Payment settlement failed: {pay_res}"
    print(f"Payment Settled! Lot: {pay_res.get('lot_id')}, Status: {pay_res.get('status')}, Paid: INR{pay_res.get('final_amount')}, Receipt: {pay_res.get('receipt_number')}")
    assert pay_res["status"] == "SETTLED"

    print("\n=== TEST 9: Active Pickup Check - Payment Settled -> Step 5 ('Payment Received' 100% Full) ===")
    act4 = req(f"/api/household/active-pickup?pickup_id={pickup_id}")
    print(f"Active Pickup Step: {act4.get('step')}, is_locked: {act4.get('is_locked')}")
    assert act4["step"] == 5, f"Expected step 5, got {act4['step']}"

    print("\n=== TEST 10: Field Coordinator Offline Verification for Non-Smartphone Collector ===")
    coord_res = req("/api/coordinator/register-verify-for-collector", "POST", {
        "collector_id": "COL-00156",
        "material": "Iron Scrap",
        "verified_weight_kg": 14.5,
        "rate_per_kg": 26.50,
        "source_address": "Panbazar Ward 4"
    })
    assert coord_res.get("success"), f"Coordinator verify failed: {coord_res}"
    print(f"Coordinator Verified: Lot {coord_res['lot_id']} for {coord_res['collector_name']} ({coord_res['collector_id']}), Amount: INR{coord_res['settlement_amount_inr']}")

    print("\n[SUCCESS] ALL 10 TESTS PASSED SUCCESSFULLY! COMPLETE LIFECYCLE VERIFIED.")

if __name__ == "__main__":
    main()
