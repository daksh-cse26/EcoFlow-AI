import urllib.request
import json
import sqlite3

BASE_URL = "http://127.0.0.1:8088"

def make_req(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    try:
        with urllib.request.urlopen(req, data=body) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

print("=== 1. Testing GET /api/auth/registry ===")
status, res = make_req("/api/auth/registry")
print(f"Status: {status}")
print(f"Total decrypted in registry: {len(res.get('registry', []))}")
print(f"Households: {len(res.get('categorized', {}).get('households', []))}")
print(f"Collectors: {len(res.get('categorized', {}).get('collectors', []))}")
print(f"Coordinators: {len(res.get('categorized', {}).get('coordinators', []))}")
print(f"Hubs: {len(res.get('categorized', {}).get('hubs', []))}")

print("\n=== 2. Testing Admin Login without Password ===")
status, res = make_req("/api/auth/register-login", "POST", {
    "role": "admin",
    "email": "dakssinghi@gmail.com",
    "password": ""
})
print(f"Status: {status}, Response: {res}")

print("\n=== 3. Testing Admin Login with Wrong Password ===")
status, res = make_req("/api/auth/register-login", "POST", {
    "role": "admin",
    "email": "dakssinghi@gmail.com",
    "password": "WrongPassword123"
})
print(f"Status: {status}, Response: {res}")

print("\n=== 4. Testing Admin Login with 'Badminton1#' ===")
status, res = make_req("/api/auth/register-login", "POST", {
    "role": "admin",
    "email": "dakssinghi@gmail.com",
    "password": "Badminton1#"
})
print(f"Status: {status}, Response: {res}")

print("\n=== 5. Checking DB Tables to ensure zero sample data ===")
conn = sqlite3.connect("ecoflow.db")
c = conn.cursor()
tables = ["pickup_requests", "waste_lots", "settlements", "inventory", "recycler_offers", "encrypted_user_registry", "employees", "users"]
for t in tables:
    c.execute(f"SELECT COUNT(*) FROM {t}")
    print(f"Table {t}: {c.fetchone()[0]} rows")
conn.close()
