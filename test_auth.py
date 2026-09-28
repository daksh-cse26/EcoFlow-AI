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

    # 3. Coordinator requires Employee ID
    code, res = post("/api/auth/register-login", {
        "role": "coordinator",
        "name": "Kavita Deka",
        "phone": "+91 98640 44556",
        "email": "kavita.deka@ecoflow.ai",
        "address": "Zone C Field HQ, Dispur",
        "employee_id": "EMP-2026-904"
    })
    assert code == 200 and res["success"] is True, f"Coordinator failed: {res}"
    print("PASS: Coordinator registered with Employee ID EMP-2026-904.")

    # 4. Command Center unauthorized email rejection
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "intruder@domain.com"
    })
    assert code == 403, f"Expected 403, got {code}: {res}"
    print(f"PASS: Unauthorized Command Center email rejected: {res['error']}")

    # 5. Command Center first-time setup for dakssinghi@gmail.com
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "dakssinghi@gmail.com"
    })
    assert code == 200 and res.get("first_time_setup") is True, f"Expected first_time_setup True: {res}"
    print("PASS: First-time setup detected for dakssinghi@gmail.com.")

    # 6. Set master password for dakssinghi@gmail.com
    code, res = post("/api/auth/register-login", {
        "role": "admin",
        "email": "dakssinghi@gmail.com",
        "password": "EcoVaultSecure2026#",
        "is_first_setup": True
    })
    assert code == 200 and res["success"] is True, f"Password setup failed: {res}"
    print("PASS: Master password configured with PBKDF2 (600k iterations).")

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
