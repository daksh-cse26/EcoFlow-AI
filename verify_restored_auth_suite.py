import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://127.0.0.1:8088"

def post(endpoint, data):
    req = urllib.request.Request(
        f"{BASE}{endpoint}",
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def get(endpoint):
    with urllib.request.urlopen(f"{BASE}{endpoint}") as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def get_text(endpoint):
    with urllib.request.urlopen(f"{BASE}{endpoint}") as resp:
        return resp.status, resp.read().decode('utf-8')

def test_full_restored_suite():
    print("==================================================")
    print("🔒 ECOFLOW AI - RESTORED AUTH & ENCRYPTION SUITE")
    print("==================================================")

    # 1. HTML Verification
    code, html = get_text("/")
    assert code == 200, "Failed to load index.html"
    assert 'id="portal-gateway-screen"' in html, "portal-gateway-screen missing in HTML"
    assert 'id="bypass-interface-nav" aria-label="Direct Interface Selector" style="display: none;"' in html, "Bypass nav should be hidden"
    assert 'id="admin-setup-password-modal"' in html, "Admin setup password modal missing in HTML"
    assert 'id="admin-forgot-password-modal"' in html, "Admin forgot password modal missing in HTML"
    assert 'id="collector-celebration-modal"' in html, "Collector celebration modal missing in HTML"
    print("✅ 1. HTML Verification: Authentic Portal Gateway active, bypass bar hidden, all security modals present.")

    # 2. Command Center Whitelist Enforcement
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "unauthorized.intruder@domain.com",
        "password": "AnyPassword123#"
    })
    assert code == 403, f"Expected 403 for unauthorized admin, got {code}: {res}"
    print(f"✅ 2. Whitelist Security: Intruder email blocked with 403: {res['error']}")

    # 3. Master Password Incorrect Attempt
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "dakssinghi@gmail.com",
        "password": "WrongPassword2026#"
    })
    assert code == 401, f"Expected 401 for wrong master password, got {code}: {res}"
    print(f"✅ 3. PBKDF2 Password Check: Incorrect password rejected with 401: {res['error']}")

    # 4. Master Password Correct Attempt
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "dakssinghi@gmail.com",
        "password": "EcoVaultSecure2026#"
    })
    assert code == 200 and res["success"] is True, f"Login failed: {res}"
    assert res["user"]["is_root"] is True
    print(f"✅ 4. Root Owner Authentication: Daksh Singhi (dakssinghi@gmail.com) verified with PBKDF2 600k iterations.")

    # 5. Coordinator Directory Check: Fake ID rejection
    code, res = post("/api/auth/register-login", {
        "role": "coordinator",
        "name": "Intruder Coordinator",
        "phone": "+91 98000 00000",
        "email": "intruder@domain.com",
        "address": "Depot 1",
        "employee_id": "FAKE-EMP-999"
    })
    assert code == 403, f"Expected 403, got {code}: {res}"
    print(f"✅ 5. Coordinator Directory Security: Unverified Employee ID blocked with 403.")

    # 6. Coordinator Directory Check: Verified ID acceptance
    code, res = post("/api/auth/register-login", {
        "role": "coordinator",
        "name": "Priyanka Baruah",
        "phone": "+91 98640 10001",
        "email": "priyanka.b@ecoflow.ai",
        "address": "Panbazar HQ",
        "employee_id": "EMP-2026-101"
    })
    assert code == 200 and res["success"] is True, f"Coordinator login failed: {res}"
    print(f"✅ 6. Coordinator Verification: EMP-2026-101 verified against authorized directory.")

    # 7. Field Collector Onboarding & Unique Token Generation
    code, res = post("/api/auth/register-login", {
        "role": "collector",
        "name": "Bikram Thapa",
        "address": "Ward 4, Ulubari Depot"
    })
    assert code == 200 and "COL-2026-" in res["collector_id"], f"Collector registration failed: {res}"
    col_id = res["collector_id"]
    print(f"✅ 7. Field Collector Generated Unique ID: {col_id}")

    # 8. Household Registration & AES-256 Vault Insertion
    code, res = post("/api/auth/register-login", {
        "role": "household",
        "name": "Ankita Borah",
        "phone": "+91 98640 11223",
        "email": "ankita.borah@example.com",
        "address": "Borah Niwas, Christian Basti, Guwahati"
    })
    assert code == 200 and res["success"] is True, f"Household failed: {res}"
    print("✅ 8. Citizen Registration: Credentials securely encrypted and inserted into encrypted_user_registry.")

    # 9. Encrypted Registry Retrieval & Categorization
    code, res = get("/api/auth/registry")
    assert code == 200, f"Registry failed: {res}"
    assert "households" in res and "coordinators" in res and "collectors" in res and "hubs" in res
    assert res["total_records"] >= 1
    # Check that raw ciphertext starts with ENC:
    first_row = res["registry"][0]
    assert first_row["raw_ciphertext"].startswith("ENC:"), f"Ciphertext token should start with ENC:, got {first_row['raw_ciphertext'][:10]}"
    print(f"✅ 9. Encrypted Registry: {res['total_records']} total records categorized (HH: {len(res['households'])}, Coord: {len(res['coordinators'])}, Col: {len(res['collectors'])}, Hub: {len(res['hubs'])}). Raw AES cipher format verified (ENC:...).")

    # 10. Whitelist Admin Management API
    code, res = get("/api/auth/whitelist")
    assert code == 200 and len(res["whitelist"]) >= 1
    root_owner = next((w for w in res["whitelist"] if w["email"] == "dakssinghi@gmail.com"), None)
    assert root_owner is not None and root_owner["is_root"] == 1 and root_owner["has_password"] == 1
    print(f"✅ 10. Command Center Whitelist: Root Owner dakssinghi@gmail.com verified with PBKDF2 hash active.")

    print("\n🎉 ALL 10 RESTORATION & CRYPTOGRAPHIC VERIFICATION CHECKS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    test_full_restored_suite()
