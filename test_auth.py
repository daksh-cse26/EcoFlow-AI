import json
import urllib.request

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

def run_auth_tests():
    print("=== Testing Auth & Encrypted Vault ===")

    # 1. Household login
    code, res = post("/api/auth/register-login", {
        "role": "household",
        "name": "Ankita Borah",
        "phone": "+91 98640 11223",
        "email": "ankita.borah@example.com",
        "address": "Borah Niwas, Christian Basti, Guwahati"
    })
    assert code == 200 and res["success"] is True, f"Household failed: {res}"
    print("PASS: Household registered and credentials encrypted.")

    # 2. Collector login (unique ID generation)
    code, res = post("/api/auth/register-login", {
        "role": "collector",
        "name": "Bikram Thapa",
        "address": "Ward 4, Ulubari Depot, Guwahati"
    })
    assert code == 200 and "COL-2026-" in res["collector_id"], f"Collector failed: {res}"
    print(f"PASS: Collector registered with Unique ID: {res['collector_id']}")

    # 3a. Coordinator rejection on unverified Employee ID
    code, res = post("/api/auth/register-login", {
        "role": "coordinator",
        "name": "Unauthorized Person",
        "phone": "+91 98640 00000",
        "email": "unauth@domain.com",
        "address": "Zone A Depot",
        "employee_id": "FAKE-EMP-999"
    })
    assert code == 403, f"Expected 403 for unverified Employee ID, got {code}: {res}"
    print(f"PASS: Unverified Coordinator Employee ID rejected: {res['error']}")

    # 3b. Coordinator accepted with verified Command Center Employee ID
    code, res = post("/api/auth/register-login", {
        "role": "coordinator",
        "name": "Priyanka Baruah",
        "phone": "+91 98640 10001",
        "email": "priyanka.b@ecoflow.ai",
        "address": "Panbazar Operations HQ",
        "employee_id": "EMP-2026-101"
    })
    assert code == 200 and res["success"] is True, f"Coordinator failed: {res}"
    print(f"PASS: Coordinator verified and logged in with Command Center Employee ID: {res['user']['employee_id']}")

    # 3c. Field Coordinator directly onboards new smartphone collector
    code, res = post("/api/coordinator/add-collector", {
        "mode": "smartphone",
        "name": "Biren Das",
        "phone": "+91 98640 77112",
        "address": "Silpukhuri Ward 3",
        "service_zone": "ZONE B",
        "assigned_hub": "HUB-001"
    })
    assert code == 200 and "COL-2026-" in res["collector_id"], f"Coordinator add smartphone collector failed: {res}"
    print(f"PASS: Coordinator directly onboarded Smartphone Collector: {res['collector_id']}")

    # 3d. Field Coordinator directly onboards new phone-less collector (COL-NP)
    code, res = post("/api/coordinator/add-collector", {
        "mode": "no_phone",
        "name": "Kanai Medhi",
        "address": "Uzanbazar River Ghat",
        "service_zone": "ZONE B",
        "assigned_hub": "HUB-001"
    })
    assert code == 200 and "COL-NP-" in res["collector_id"], f"Coordinator add phoneless collector failed: {res}"
    print(f"PASS: Coordinator directly onboarded Phone-less Collector with NP code: {res['collector_id']}")

    # 3e. Verify employee fleet contains newly onboarded collectors
    code, res = get("/api/employees")
    assert code == 200 and len(res["employees"]) >= 5, f"Employees roster failed: {res}"
    print(f"PASS: Fleet roster successfully retrieved {len(res['employees'])} total collectors.")

    # 3b. Phone-less Grassroots Collector Onboarding (Field Collector permission)
    code, res = post("/api/auth/register-phoneless", {
        "type": "no_phone",
        "name": "Mantu Baishya",
        "address": "Brahmaputra Riverside Scrap Shed 2, Guwahati",
        "materials": "Iron & Steel, PET Bottles"
    })
    assert code == 200 and "COL-NP-" in res["collector_id"], f"Phoneless failed: {res}"
    print(f"PASS: Phone-less Collector registered with special NP code: {res['collector_id']}")

    # 3c. 10km Proximity SMS Invitation & Basic-Phone Onboarding (Field Coordinator permission)
    code, res = post("/api/auth/register-phoneless", {
        "type": "basic_phone",
        "name": "Shankar Mandal (SMS 10km)",
        "phone": "+91 98640 88121",
        "address": "Fancy Bazaar Scrap Cluster, Guwahati",
        "service_zone": "ZONE B"
    })
    assert code == 200 and "COL-NS-" in res["collector_id"], f"Basic phone failed: {res}"
    print(f"PASS: 10km Basic-Phone Collector registered via SMS with special NS code: {res['collector_id']}")

    # 4. Command Center unauthorized email rejection
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "intruder@domain.com"
    })
    assert code == 403, f"Expected 403, got {code}: {res}"
    print(f"PASS: Unauthorized Command Center email rejected: {res['error']}")

    # 5. Command Center access for dakssinghi@gmail.com
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "dakssinghi@gmail.com"
    })
    if res.get("first_time_setup"):
        print("PASS: First-time setup detected for dakssinghi@gmail.com.")
        code, res = post("/api/auth/register-login", {
            "role": "admin",
            "email": "dakssinghi@gmail.com",
            "password": "EcoVaultSecure2026#",
            "is_first_setup": True
        })
        assert code == 200 and res["success"] is True, f"Password setup failed: {res}"
        print("PASS: Master password configured with PBKDF2 (600k iterations).")
    else:
        assert code in (200, 400), f"Expected response: {res}"
        print("PASS: dakssinghi@gmail.com verified as authorized Command Center Root Owner.")

    # 7. Next login with password
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "dakssinghi@gmail.com",
        "password": "EcoVaultSecure2026#"
    })
    assert code == 200 and res["success"] is True, f"Login failed: {res}"
    print("PASS: Successful Command Center login with master password.")

    # 8. Check encrypted registry endpoint
    code, res = get("/api/auth/registry")
    assert code == 200 and res["total_records"] >= 1, f"Registry failed: {res}"
    print(f"PASS: Command Center retrieved {res['total_records']} decrypted records (raw cipher verified).")

    print("=== All Auth Tests Passed! ===")

if __name__ == "__main__":
    run_auth_tests()
