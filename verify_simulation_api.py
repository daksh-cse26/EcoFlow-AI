import urllib.request
import json

BASE_URL = "http://127.0.0.1:8088"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

print("=== 1. Traceability Chain for LOT-2026-001 ===")
status, chain = get("/api/traceability/LOT-2026-001")
print(f"Status: {status}")
for k in ["pickup", "household", "assignment", "lot", "ai_assessment", "verification", "settlement", "inventory_batch", "recycler_offer", "sale_transaction", "dispatch"]:
    print(f"  {k}:", "PRESENT" if chain.get(k) else "MISSING")

print("\n=== 2. Decrypted User Registry ===")
status, reg = get("/api/auth/registry")
print(f"Status: {status}")
print("Total records:", reg.get("total_records"))
print("Households:", [u["name"] for u in reg.get("households", [])])
print("Coordinators:", [u["name"] for u in reg.get("coordinators", [])])
print("Collectors:", [u["name"] for u in reg.get("collectors", [])])
print("Hubs & Recyclers:", [u["name"] for u in reg.get("hubs", [])])

print("\n=== 3. Pickups, Lots, Batches ===")
status, p = get("/api/pickups")
print(f"Pickups ({len(p.get('pickups', []))}):", [x["pickup_id"] for x in p.get("pickups", [])])
status, l = get("/api/lots")
print(f"Lots ({len(l.get('lots', []))}):", [x["lot_id"] for x in l.get("lots", [])])
status, b = get("/api/batches")
print(f"Batches ({len(b.get('batches', []))}):", [x["batch_id"] for x in b.get("batches", [])])
status, s = get("/api/settlements/LOT-2026-001")
print(f"Settlement: {s.get('settlement', {}).get('receipt_number')} - Amount: ₹{s.get('settlement', {}).get('final_amount')}")
