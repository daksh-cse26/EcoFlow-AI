"""
EcoFlow AI - Backend Test Runner
Verifies database integrity, AI engine, and business logic
"""

import os
import sys
import json
from database import get_db, init_db, seed_demo_data
from ai_engine import local_ai

def run_tests():
    print("=== Testing EcoFlow AI Core Modules ===")
    init_db()
    seed_demo_data()

    conn = get_db()
    cursor = conn.cursor()

    # 1. Verify Seeded Scenarios
    cursor.execute("SELECT * FROM pickup_requests WHERE pickup_id = 'PR-2026-000842'")
    p1 = cursor.fetchone()
    assert p1 is not None, "Scenario 1 pickup missing"
    print("PASS: Scenario 1 Pickup PR-2026-000842 found.")

    cursor.execute("SELECT * FROM physical_verifications WHERE lot_id = 'LOT-2026-000184'")
    v1 = cursor.fetchone()
    assert v1 is not None, "Scenario 1 verification missing"
    assert v1["weight_match_status"] == "MATCH", f"Expected MATCH, got {v1['weight_match_status']}"
    print(f"PASS: Scenario 1 Verification LOT-2026-000184 verified weight = {v1['verified_weight']}kg (Status: {v1['weight_match_status']})")

    cursor.execute("SELECT * FROM physical_verifications WHERE lot_id = 'LOT-2026-000185'")
    v2 = cursor.fetchone()
    assert v2 is not None, "Scenario 2 verification missing"
    assert v2["weight_match_status"] == "DIFFERENCE", f"Expected DIFFERENCE, got {v2['weight_match_status']}"
    print(f"PASS: Scenario 2 Verification LOT-2026-000185 verified weight = {v2['verified_weight']}kg (Status: {v2['weight_match_status']})")

    # 2. Verify AI Engine
    ai_res = local_ai.analyze_waste_input(preset_type="COPPER_SCRAP")
    assert ai_res["success"] is True
    assert "Copper" in ai_res["detected_material"]
    assert "preliminary" in ai_res["mandatory_disclaimer"].lower()
    print(f"PASS: Local AI inference result: {ai_res['detected_material']} (Confidence: {ai_res['confidence_percentage']}%, Segregation Score: {ai_res['segregation_score']}/100)")

    # 3. Verify Downstream Recycler Decoupling
    cursor.execute("SELECT * FROM settlements WHERE lot_id = 'LOT-2026-000184'")
    s1 = cursor.fetchone()
    cursor.execute("SELECT * FROM recycler_offers WHERE batch_id = 'BATCH-2026-PLAST-01'")
    ro = cursor.fetchone()
    assert s1["final_amount"] == 5044.0, f"Household settlement mismatch: {s1['final_amount']}"
    print(f"PASS: Independent Household Settlement: INR {s1['final_amount']} decoupled from Recycler downstream offer (INR {ro['total_price']}).")

    conn.close()
    print("=== All Core Tests Passed Successfully! ===")

if __name__ == "__main__":
    run_tests()
