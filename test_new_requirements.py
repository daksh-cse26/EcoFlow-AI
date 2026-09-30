import urllib.request
import json
import os
import re

BASE_URL = "http://127.0.0.1:8088"

def test_all():
    print("=== 1. Checking Recycler Portal Removal in static/index.html ===")
    html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    assert 'data-role="recycler"' not in html, "ERROR: Recycler button or card still found in index.html!"
    assert 'id="view-recycler"' not in html, "ERROR: view-recycler still found in index.html!"
    assert 'switchPerspective(\'recycler\')' not in html, "ERROR: switchPerspective('recycler') still in index.html!"
    assert 'Joined using a Smartphone?' not in html, "ERROR: 'Joined using a Smartphone?' still found in index.html!"
    assert 'Transfer Lot to Storage Hub Station' not in html, "ERROR: Transfer Lot button still found in index.html!"
    print("PASS: Recycler Portal completely removed from index.html.")
    print("PASS: 'Joined using a Smartphone?' card completely removed.")
    print("PASS: 'Transfer Lot to Storage Hub Station' button completely removed.")

    print("\n=== 2. Checking Field Collector Progress Bar & Lock in index.html ===")
    assert 'id="collector-lifecycle-progress-card"' in html, "ERROR: collector progress card missing!"
    assert 'Pickup accepted' in html, "ERROR: Step 'Pickup accepted' missing!"
    assert 'Pickup completed' in html, "ERROR: Step 'Pickup completed' missing!"
    assert 'Lot generated' in html, "ERROR: Step 'Lot generated' missing!"
    assert 'Storage hub verified' in html, "ERROR: Step 'Storage hub verified' missing!"
    assert 'Payment received' in html, "ERROR: Step 'Payment received' missing!"
    assert 'id="collector-lot-lock-badge"' in html, "ERROR: lot lock badge missing!"
    assert 'id="btn-collector-seal-lot"' in html, "ERROR: seal lot button missing!"
    print("PASS: Collector 5-step progress bar and lot lock badge confirmed in HTML.")

    print("\n=== 3. Testing Household active-pickup endpoint (Initially Active & Unlocked) ===")
    req = urllib.request.Request(f"{BASE_URL}/api/household/active-pickup")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("Response from /api/household/active-pickup:", data)
        assert data.get("has_active") is False, f"Expected has_active to be False initially, got {data}"
        assert data.get("is_locked") is False, f"Expected is_locked to be False initially, got {data}"
        assert data.get("step") == 0, f"Expected step to be 0 initially, got {data}"
    print("PASS: Household active-pickup initially returns has_active: False and is_locked: False!")

    print("\n=== 4. Testing Collector Restore Endpoint ===")
    req_restore = urllib.request.Request(
        f"{BASE_URL}/api/collector/restore-smartphone",
        data=json.dumps({"collector_id": "COL-00156"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_restore) as resp:
        restore_data = json.loads(resp.read().decode('utf-8'))
        print("Response from /api/collector/restore-smartphone:", restore_data)
        assert restore_data.get("success") is True, "Restore failed!"
        assert restore_data.get("collector_id") == "COL-00156", "Collector ID mismatch!"
        assert restore_data.get("mode") == "smartphone", "Mode was not updated to smartphone!"
        assert "restored_lots" in restore_data, "restored_lots missing!"
    print("PASS: Collector restore successfully upgrades to smartphone mode and returns restored lots.")

    print("\n=== 5. Testing Collector Lot Sealing & Locking Endpoint ===")
    test_lot_id = "LOT-2026-998877"
    req_collect = urllib.request.Request(
        f"{BASE_URL}/api/collector/collect",
        data=json.dumps({
            "lot_id": test_lot_id,
            "pickup_id": "PR-2026-000844",
            "collector_id": "COL-00156",
            "storage_hub_id": "HUB-001"
        }).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_collect) as resp:
        collect_data = json.loads(resp.read().decode('utf-8'))
        print("Response from /api/collector/collect:", collect_data)
        assert collect_data.get("success") is True, "Collect failed!"
        assert collect_data.get("lot_id") == test_lot_id, "Lot ID mismatch!"
        assert collect_data.get("locked") is True, "Expected locked: True!"
        assert collect_data.get("status") == "SEALED", "Expected status: SEALED!"
    print("PASS: Lot is successfully generated, sealed, and locked to server.")

    print("\nALL VERIFICATION CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_all()
