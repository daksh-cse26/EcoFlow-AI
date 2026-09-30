"""
EcoFlow AI - Single Cohesive Simulation Dataset Seeder
Creates exactly ONE sample entry per operational table and ONE user per role
starting from the login page, linking together a complete end-to-end
dynamic circular economy lifecycle from citizen doorstep to smelter dispatch.
"""

import sqlite3
import json
import os
from crypto_vault import encrypt_field

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ecoflow.db")

def seed_single_simulation():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    c = conn.cursor()

    # 1. Clear operational tables first to guarantee exactly one entry each
    operational_tables = [
        "pickup_requests",
        "waste_lots",
        "assignments",
        "ai_assessments",
        "physical_verifications",
        "lot_materials",
        "settlements",
        "inventory",
        "inventory_batches",
        "recycler_offers",
        "sales_transactions",
        "dispatches",
        "reassessment_requests",
        "ai_feedback_dataset",
        "audit_logs",
        "encrypted_user_registry",
        "employees",
        "users"
    ]
    for tbl in operational_tables:
        c.execute(f"DELETE FROM {tbl}")

    # =========================================================================
    # ROLE ACCOUNTS FOR LOGIN & SIMULATION (1 PER ROLE)
    # =========================================================================

    # 1. Users Table (1 Household Citizen)
    c.execute("""
    INSERT INTO users (id, name, phone, role, language, service_zone)
    VALUES ('USR-HH-101', 'Rahul Sharma', '+91 98640 12345', 'household', 'en', 'ZONE B')
    """)

    # 2. Employees / Collectors Table (1 Field Collector)
    c.execute("""
    INSERT INTO employees (employee_id, name, phone, service_zone, mode, availability, assigned_hub, workload, collection_history_count, current_lat, current_lng)
    VALUES ('COL-2026-00142', 'Rameshwar Boro', '+91 98765 43210', 'ZONE B', 'smartphone', 'AVAILABLE', 'HUB-001', 1, 1, 26.1800, 91.7700)
    """)

    # 3. Encrypted User Registry (AES-256-GCM Vault: Exactly 1 per role category)
    encrypted_users = [
        # Household Citizen
        ("USR-HH-101", "household",
         encrypt_field("Rahul Sharma"),
         encrypt_field("+91 98640 12345"),
         encrypt_field("rahul.sharma@example.com"),
         encrypt_field("House 42, Green Park Avenue, North Zone, Guwahati"),
         encrypt_field("HH-00842")),
        
        # Field Coordinator
        ("USR-COORD-201", "coordinator",
         encrypt_field("Priyanka Baruah"),
         encrypt_field("+91 98640 10001"),
         encrypt_field("priyanka.b@ecoflow.ai"),
         encrypt_field("Zonal Command Office, Sector 4, Panbazar, Guwahati"),
         encrypt_field("EMP-2026-101")),
        
        # Field Collector
        ("USR-COL-301", "collector",
         encrypt_field("Rameshwar Boro"),
         encrypt_field("+91 98765 43210"),
         encrypt_field("rameshwar.boro@field.ecoflow.ai"),
         encrypt_field("North Zone Municipal Shed, Ward 4, Guwahati"),
         encrypt_field("COL-2026-00142")),
        
        # Storage Hub Authority
        ("USR-HUB-401", "hub",
         encrypt_field("HUB-001: Central Sorting Hub"),
         encrypt_field("+91 98640 99887"),
         encrypt_field("hub.central@ecoflow.ai"),
         encrypt_field("EcoFlow Central Sorting Hub, Plot 42, Paltan Road, Guwahati"),
         encrypt_field("HUB-001")),
        
        # Industrial Recycler
        ("USR-REC-501", "hub",
         encrypt_field("Pragati Metal Refiners Ltd."),
         encrypt_field("+91 94350 11223"),
         encrypt_field("procurement@pragatimetal.in"),
         encrypt_field("Brahmaputra Industrial Estate, Narangi, Guwahati"),
         encrypt_field("REC-001"))
    ]
    for u in encrypted_users:
        c.execute("""
        INSERT INTO encrypted_user_registry (user_id, role, name_enc, phone_enc, email_enc, address_enc, custom_id_enc)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, u)

    # =========================================================================
    # DYNAMIC CIRCULAR PROCESS CHAIN (EXACTLY 1 ENTRY PER LIFECYCLE STAGE)
    # =========================================================================

    # Stage 1: Doorstep Pickup Request
    c.execute("""
    INSERT INTO pickup_requests (
        pickup_id, household_name, household_phone, address, landmark, service_zone,
        lat, lng, preferred_date, time_slot, preliminary_material,
        user_estimated_weight, indicative_rate, indicative_value, notes, status
    ) VALUES (
        'PR-2026-001', 'Rahul Sharma', '+91 98640 12345', 'House 42, Green Park Avenue, North Zone, Guwahati',
        'Near Central Park Gate 2', 'ZONE B', 26.1800, 91.7700, '2026-10-01',
        '10:00 AM - 12:00 PM', 'COPPER_SCRAP', 12.5, 580.0, 7250.0,
        'High-purity stripped electrical copper wire bundles from residential renovation.', 'VERIFIED'
    )
    """)

    # Stage 2: Fleet Routing Assignment
    c.execute("""
    INSERT INTO assignments (
        assignment_id, pickup_id, employee_id, assigned_at, mode,
        acknowledged, acknowledged_at, status, notes
    ) VALUES (
        'ASG-2026-001', 'PR-2026-001', 'COL-2026-00142', datetime('now', '-2 hours'), 'smartphone',
        1, datetime('now', '-110 minutes'), 'COMPLETED',
        'AI fleet optimization assigned pickup to Rameshwar Boro (Zone B radius 1.2 km). Acknowledged via smartphone.'
    )
    """)

    # Stage 3 & 4: Waste Lot Creation & Digital QR Token
    c.execute("""
    INSERT INTO waste_lots (
        lot_id, pickup_id, household_name, collector_id, storage_hub_id,
        collection_timestamp, preliminary_material, user_estimated_weight,
        qr_code, verification_status
    ) VALUES (
        'LOT-2026-001', 'PR-2026-001', 'Rahul Sharma', 'COL-2026-00142', 'HUB-001',
        datetime('now', '-90 minutes'), 'COPPER_SCRAP', 12.5,
        'ECOFLOW:LOT:LOT-2026-001:HUB-001:12.5KG', 'VERIFIED'
    )
    """)

    # Stage 5: Edge AI Vision Assessment
    c.execute("""
    INSERT INTO ai_assessments (
        assessment_id, pickup_id, lot_id, model_version, detected_material,
        confidence_score, possible_materials_json, segregation_score,
        recommendation
    ) VALUES (
        'ASM-2026-001', 'PR-2026-001', 'LOT-2026-001', 'v1.0', 'COPPER_SCRAP',
        0.965, ?, 96,
        'High purity bright bare copper wire. Clean surface condition, zero hazardous contamination. Suitable for Grade A pricing.'
    )
    """, (json.dumps([
        {"material": "COPPER_SCRAP", "confidence": 0.965},
        {"material": "BRASS_SCRAP", "confidence": 0.035}
    ]),))

    # Stage 6: Certified Hub Physical Metrology & Verification
    c.execute("""
    INSERT INTO physical_verifications (
        verification_id, lot_id, hub_id, operator_name, verified_weight,
        total_verified_amount, weight_match_status, weight_difference,
        weight_difference_pct, tolerance_used, discrepancy_reason,
        discrepancy_notes, quality_grade
    ) VALUES (
        'PV-2026-001', 'LOT-2026-001', 'HUB-001', 'Manoj Kalita (Chief Inspector)',
        12.2, 7442.0, 'MATCH', -0.3, -2.4, 5.0,
        'Variance (-0.3 kg / -2.4%) within certified legal metrology ±5% tolerance.',
        'Calibrated digital scale weighment at Hub 001. Certified Grade A purity (>99% clean copper).',
        'GRADE A'
    )
    """)

    # Stage 7: Granular Lot Materials Breakdown
    c.execute("""
    INSERT INTO lot_materials (
        lot_id, material_name, grade, verified_weight, rate_per_kg, subtotal
    ) VALUES (
        'LOT-2026-001', 'COPPER_SCRAP', 'GRADE A', 12.2, 610.0, 7442.0
    )
    """)

    # Stage 8: Instant Household Settlement & Digital Receipt
    c.execute("""
    INSERT INTO settlements (
        settlement_id, lot_id, pickup_id, household_name, verified_weight,
        final_amount, calculation_formula, status, receipt_number
    ) VALUES (
        'SET-2026-001', 'LOT-2026-001', 'PR-2026-001', 'Rahul Sharma', 12.2,
        7442.0, '12.2 kg x ₹610.00/kg (Grade A Bare Bright Copper)',
        'COMPLETED', 'RCP-2026-001'
    )
    """)

    # Stage 9: Storage Hub Inventory Intake
    c.execute("""
    INSERT INTO inventory (
        inventory_id, material_name, grade, weight_kg, source_lot_id,
        hub_id, status, batch_id
    ) VALUES (
        'INV-2026-001', 'COPPER_SCRAP', 'GRADE A', 12.2, 'LOT-2026-001',
        'HUB-001', 'AVAILABLE', 'BATCH-2026-001'
    )
    """)

    # Stage 10: Inventory Batch Aggregation
    c.execute("""
    INSERT INTO inventory_batches (
        batch_id, material_name, total_weight_kg, source_lots_json,
        hub_id, status
    ) VALUES (
        'BATCH-2026-001', 'COPPER_SCRAP', 12.2, ?, 'HUB-001', 'DISPATCHED'
    )
    """, (json.dumps(["LOT-2026-001"]),))

    # Stage 11: Authorized Recycler Market Offer
    c.execute("""
    INSERT INTO recycler_offers (
        offer_id, batch_id, recycler_id, recycler_name, material_name,
        quantity_kg, offered_rate_per_kg, total_price, conditions, status
    ) VALUES (
        'OFFER-2026-001', 'BATCH-2026-001', 'REC-001', 'Pragati Metal Refiners Ltd.',
        'COPPER_SCRAP', 12.2, 640.0, 7808.0,
        'Direct secondary smelter intake. Immediate RTGS payment and digital gate pass manifest.', 'ACCEPTED'
    )
    """)

    # Stage 12: Confirmed Sales Transaction
    c.execute("""
    INSERT INTO sales_transactions (
        transaction_id, batch_id, offer_id, recycler_id,
        agreed_rate_per_kg, total_amount, status
    ) VALUES (
        'TXN-2026-001', 'BATCH-2026-001', 'OFFER-2026-001', 'REC-001',
        640.0, 7808.0, 'CONFIRMED'
    )
    """)

    # Stage 13: Recycler Logistics Dispatch & Gate Pass
    c.execute("""
    INSERT INTO dispatches (
        dispatch_id, transaction_id, batch_id, recycler_name, vehicle_no,
        driver_name, gate_pass_qr, status
    ) VALUES (
        'DSP-2026-001', 'TXN-2026-001', 'BATCH-2026-001', 'Pragati Metal Refiners Ltd.',
        'AS-01-GB-4029', 'Nagen Barman',
        'ECOFLOW:GATEPASS:DSP-2026-001:TXN-2026-001:AS01GB4029', 'DELIVERED'
    )
    """)

    # Stage 14: Immutable Audit Log Trace
    c.execute("""
    INSERT INTO audit_logs (
        event_name, previous_value, new_value, user_name, role, reason
    ) VALUES (
        'CLOSED_LOOP_PROVENANCE_COMPLETED',
        'PENDING_VERIFICATION',
        'DELIVERED_TO_SMELTER',
        'Manoj Kalita (Chief Inspector)',
        'hub',
        'Full 10-step digital provenance lifecycle closed-loop verified.'
    )
    """)

    # Stage 15: AI Feedback & Continuous Model Learning
    c.execute("""
    INSERT INTO ai_feedback_dataset (
        feedback_id, lot_id, ai_prediction, ai_confidence, hub_verified_material,
        hub_verified_grade, status, model_version
    ) VALUES (
        'FDB-2026-001', 'LOT-2026-001', 'COPPER_SCRAP', 0.965,
        'COPPER_SCRAP', 'GRADE A', 'VALIDATED', 'v1.0'
    )
    """)

    # Stage 16: Reassessment Request (Resolved Scenario)
    c.execute("""
    INSERT INTO reassessment_requests (
        reassessment_id, lot_id, household_name, reason, status, resolution_notes
    ) VALUES (
        'REA-2026-001', 'LOT-2026-001', 'Rahul Sharma',
        'Requested Grade A verification check on stripped copper wires.',
        'RESOLVED',
        'Chief Inspector re-evaluated lot under digital microscope; confirmed 99.4% bare bright copper purity. Grade A rate ₹610/kg honored.'
    )
    """)

    conn.commit()
    conn.close()
    print("Successfully seeded single cohesive simulation dataset.")

if __name__ == "__main__":
    seed_single_simulation()
