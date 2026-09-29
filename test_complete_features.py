# -*- coding: utf-8 -*-
"""
Comprehensive automated test suite for the requested features:
1. Field Collector: Only smartphone app view shown; basic/no phone data stored on server; smartphone restore restores work.
2. Field Coordinator: Minimal lookup via Collector ID showing ONLY name and past successful pickups; all other data withheld.
3. Multilingual Video Demos: All 10 video demos localized across all 19 languages with dynamic switching.
4. Dynamic User Names & No Timezone Display: Name never fixed to 'Rahul Sharma' or any permanent name; no timezone displayed.
"""
import urllib.request
import json
import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8088"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def test_coordinator_minimal_lookup():
    print("\n--- TEST 1: Coordinator Minimal Collector ID Lookup (Strict Privacy) ---")
    url = f"{BASE_URL}/api/coordinator/collector-minimal?collector_id=COL-00156"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    
    assert data["success"] is True, f"Failed: {data}"
    assert "name" in data, "Collector name missing"
    assert "successful_pickups_count" in data, "successful_pickups_count missing"
    assert "successful_pickups" in data, "successful_pickups list missing"
    
    # STRICT PRIVACY: Verify all other personal data are withheld
    forbidden_fields = ["phone", "email", "address", "hourly_rate", "salary", "notes", "personal_info"]
    for field in forbidden_fields:
        assert field not in data, f"Privacy violation: '{field}' should NOT be in minimal data!"
    
    print(f"  Passed! Minimal data for {data['collector_id']}: Name={data['name']}, Pickups={data['successful_pickups_count']}")
    print(f"  Privacy check passed: {forbidden_fields} strictly omitted.")

def test_coordinator_register_verify():
    print("\n--- TEST 2: Coordinator Register & Verify Scrap for Collector ---")
    url = f"{BASE_URL}/api/coordinator/register-verify-for-collector"
    payload = {
        "collector_id": "COL-00173",
        "material": "Copper Scrap",
        "verified_weight_kg": 12.5,
        "rate_per_kg": 504.40,
        "source_address": "Kamrup Metro Ward 4"
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    
    assert data["success"] is True, f"Failed: {data}"
    assert data["collector_id"] == "COL-00173"
    assert data["verified_weight_kg"] == 12.5
    assert data["settlement_amount_inr"] == 12.5 * 504.40
    print(f"  Passed! Verified lot created: {data['lot_id']} for {data['collector_name']}. Payout: ₹{data['settlement_amount_inr']:.2f}")

def test_collector_restore_smartphone():
    print("\n--- TEST 3: Collector Upgrade & Restore to Smartphone Mode ---")
    url = f"{BASE_URL}/api/collector/restore-smartphone"
    payload = {"collector_id": "COL-00156"}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    
    assert data["success"] is True, f"Failed: {data}"
    assert data["mode"] == "smartphone", f"Expected mode smartphone, got {data['mode']}"
    assert "restored_lots" in data, "Restored lots missing"
    print(f"  Passed! {data['name']} upgraded to mode: {data['mode']}, Restored Lots: {data['restored_lots_count']}")

def test_html_and_ui_integrity():
    print("\n--- TEST 4: Frontend HTML Structure & Interface Rules ---")
    html_path = os.path.join(PROJECT_DIR, "static", "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    
    # Rule 1: No mode navigation tabs in field collector view
    assert 'data-mode="mode1"' not in html, "Mode 1 tab button should be removed from collector view"
    assert 'data-mode="mode2"' not in html, "Mode 2 tab button should be removed from collector view"
    assert 'data-mode="mode3"' not in html, "Mode 3 tab button should be removed from collector view"
    print("  Passed: Mode tabs removed from Field Collector interface.")
    
    # Rule 2: Mode 2 and Mode 3 panes are hidden
    assert 'id="collector-pane-mode2" style="display: none !important;"' in html
    assert 'id="collector-pane-mode3" style="display: none !important;"' in html
    print("  Passed: Mode 2 and Mode 3 panes are hidden with display: none !important.")
    
    # Rule 3: Coordinator verify button and modal
    assert 'id="btn-coord-verify-collector-id"' in html, "Verify button missing in Coordinator view"
    assert 'id="collector-id-verify-modal"' in html, "Collector ID Verify Modal missing"
    print("  Passed: Coordinator verify button and minimal modal present.")
    
    # Rule 4: Collector restore button and modal
    assert 'openJoinSmartphoneModal()' in html, "Restore Work button missing in Collector view"
    assert 'id="collector-restore-modal"' in html, "Collector restore modal missing"
    print("  Passed: Field Collector smartphone restore button and modal present.")
    
    # Rule 5: No timezone display in UI
    assert 'id="hh-timezone-sync-tag"' not in html, "Timezone sync tag must not be in HTML"
    assert 'id="hh-timezone-name"' not in html, "Timezone name must not be in HTML"
    print("  Passed: No timezone sync display in HTML.")
    
    # Rule 6: video_translations.js is loaded
    assert 'src="js/video_translations.js"' in html, "video_translations.js script tag missing"
    print("  Passed: video_translations.js is properly included.")

def test_video_translations():
    print("\n--- TEST 5: Multilingual Video Demonstration Catalog ---")
    vt_path = os.path.join(PROJECT_DIR, "static", "js", "video_translations.js")
    with open(vt_path, "r", encoding="utf-8") as f:
        code = f.read()
    
    # Extract JSON
    json_str = code.split("window.VIDEO_TRANSLATIONS = ", 1)[1].rsplit(";", 1)[0]
    vt = json.loads(json_str)
    
    expected_langs = ["en", "hi", "mr", "gu", "mwr", "te", "ta", "kn", "ml", "pa", "as", "bn", "or", "ur", "es", "fr", "de", "ja", "ar"]
    for lang in expected_langs:
        assert lang in vt, f"Language {lang} missing from video translations"
        assert len(vt[lang]) == 10, f"Language {lang} should have 10 videos, found {len(vt[lang])}"
        for vkey in ["hh_impact", "hh_scanner", "hh_pickup", "hh_settlement", "hh_rewards", "col_modes", "col_assignment", "col_seallot", "col_transfer", "col_grassroots"]:
            assert vkey in vt[lang], f"Video {vkey} missing in {lang}"
            assert len(vt[lang][vkey]["steps"]) == 4, f"Video {vkey} in {lang} must have 4 steps"
    
    print(f"  Passed! Verified all {len(expected_langs)} languages and all 10 video demo catalogs with full 4-step captions.")

def test_dynamic_name_and_greeting():
    print("\n--- TEST 6: Dynamic User Name & Greeting Validation ---")
    js_path = os.path.join(PROJECT_DIR, "static", "js", "household_scrap.js")
    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()
    
    assert 'let userName = "Rahul Sharma";' not in js, "User name must not be hardcoded to Rahul Sharma in household_scrap.js"
    assert 'getActiveUserName' in js, "household_scrap.js must use getActiveUserName()"
    assert 'hh-timezone-name' not in js, "Timezone display code must be removed from household_scrap.js"
    
    app_js_path = os.path.join(PROJECT_DIR, "static", "js", "app.js")
    with open(app_js_path, "r", encoding="utf-8") as f:
        app_js = f.read()
    
    assert 'function getActiveUserName' in app_js, "getActiveUserName missing in app.js"
    assert 'function setActiveUserName' in app_js, "setActiveUserName missing in app.js"
    assert 'function promptChangeUserName' in app_js, "promptChangeUserName missing in app.js"
    assert 'function updateAllInterfaceUserNames' in app_js, "updateAllInterfaceUserNames missing in app.js"
    
    print("  Passed! User name is dynamic across interfaces, editable anytime, and timezone is omitted.")

if __name__ == "__main__":
    print("=" * 60)
    print("Running Full Feature Verification Suite...")
    print("=" * 60)
    try:
        test_coordinator_minimal_lookup()
        test_coordinator_register_verify()
        test_collector_restore_smartphone()
        test_html_and_ui_integrity()
        test_video_translations()
        test_dynamic_name_and_greeting()
        print("\n" + "=" * 60)
        print("🎉 ALL 6 COMPREHENSIVE TESTS PASSED SUCCESSFULLY!")
        print("=" * 60)
    except AssertionError as err:
        print(f"\n❌ TEST ASSERTION FAILED: {err}")
        sys.exit(1)
    except Exception as ex:
        print(f"\n❌ UNEXPECTED ERROR: {ex}")
        sys.exit(1)
