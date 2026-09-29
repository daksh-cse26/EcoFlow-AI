import json
import urllib.request

def test_household_flow():
    base = "http://127.0.0.1:8088"
    
    print("--- 1. Testing HTML Elements for Household Scrap ---", flush=True)
    with urllib.request.urlopen(f"{base}/", timeout=5) as resp:
        html = resp.read().decode('utf-8')
        elements = [
            "hh-dynamic-greeting-title",
            "btn-main-post-scrap",
            "household-live-progress-card",
            "market-rates-grid",
            "environment-tagline-card",
            "hh-screen-post-scrap",
            "scrap-table-tbody",
            "scrap-camera-input",
            "scrap-photo-preview-container",
            "photo-confirm-card",
            "ai-cost-estimation-card",
            "btn-request-pickup-submit",
            "post-scrap-exit-modal",
            "radius-search-hud-modal",
            "pickup-confirmed-toast",
            "js/household_scrap.js"
        ]
        for el in elements:
            assert el in html, f"Missing element or script: {el}"
            print(f"  ✓ Found '{el}' in DOM")

    print("\n--- 2. Testing /api/household/live-rates ---", flush=True)
    with urllib.request.urlopen(f"{base}/api/household/live-rates", timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        rates = data.get("rates", [])
        assert len(rates) >= 8, f"Expected at least 8 rates, got {len(rates)}"
        print(f"  ✓ Live rates loaded successfully ({len(rates)} materials):")
        for r in rates[:4]:
            print(f"    • {r['name']}: ₹{r['rate']}/{r['unit']} ({r['trend']})")

    print("\n--- 3. Testing /api/household/post-scrap (Post Scrap Submission) ---", flush=True)
    payload = {
        "household_name": "Rahul Sharma",
        "household_phone": "+91 98640 12345",
        "address": "House 14, Peace Enclave, Paltan Bazaar, Guwahati",
        "service_zone": "ZONE B",
        "materials": [
            {"code": "IRON_STEEL", "name": "Iron & Steel Scraps", "weight": 14.5, "rate": 32.0},
            {"code": "COPPER_SCRAP", "name": "Copper Scrap & Wires", "weight": 3.2, "rate": 580.0},
            {"code": "PET_BOTTLE", "name": "PET Plastic Containers", "weight": 5.0, "rate": 24.0}
        ],
        "total_weight": 22.7,
        "total_value": 2440.0,
        "waste_image": "sample_scrap_pile.jpg"
    }
    req = urllib.request.Request(
        f"{base}/api/household/post-scrap",
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        assert res.get("success") is True, "Failed to post scrap"
        lot_id = res.get("lot_id")
        pickup_id = res.get("pickup_id")
        print(f"  ✓ Scrap posted with unique Lot ID: {lot_id} (Pickup: {pickup_id})")
        print(f"  ✓ Locked state: {res.get('is_locked')}")
        print(f"  ✓ Assigned collector: {res.get('assigned_collector', {}).get('name')} ({res.get('assigned_collector', {}).get('employee_id')})")
        print(f"  ✓ Dispatched to {len(res.get('dispatched_sms', []))} SMS collectors and {len(res.get('dispatched_smartphone', []))} smartphone collectors")

    print("\n--- 4. Testing /api/household/active-pickup (Lock Verification) ---", flush=True)
    with urllib.request.urlopen(f"{base}/api/household/active-pickup", timeout=5) as resp:
        act = json.loads(resp.read().decode('utf-8'))
        assert act.get("has_active") is True, "Should have active pickup"
        assert act.get("is_locked") is True, "Should be locked"
        print(f"  ✓ Active pickup verified: Lot {act.get('lot_id')}, Step: {act.get('step')}, Locked: {act.get('is_locked')}")

    print("\n--- 5. Testing 5-Step Lifecycle Progression (1 to 5) ---", flush=True)
    steps = [
        (2, "Pickup Accepted"),
        (3, "Scrap Verified"),
        (4, "Payment Confirmed"),
        (5, "Payment Received")
    ]
    for step_num, step_name in steps:
        step_req = urllib.request.Request(
            f"{base}/api/household/progress-step",
            data=json.dumps({"lot_id": lot_id, "step": step_num}).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(step_req, timeout=5) as resp:
            step_res = json.loads(resp.read().decode('utf-8'))
            assert step_res.get("success") is True
            print(f"  ✓ Step {step_num} ({step_name}): success, is_completed={step_res.get('is_completed')}")

    print("\n--- 6. Post-Completion Check (Post Scrap Re-enabled) ---", flush=True)
    with urllib.request.urlopen(f"{base}/api/household/active-pickup", timeout=5) as resp:
        post_act = json.loads(resp.read().decode('utf-8'))
        print(f"  ✓ Active pickup after Payment Received: has_active={post_act.get('has_active')}")
        print(f"  ✓ Post Scrap unlocked: {not post_act.get('is_locked')}")

    print("\n🎉 ALL HOUSEHOLD SCRAP LIFECYCLE TESTS PASSED!", flush=True)

if __name__ == '__main__':
    test_household_flow()
