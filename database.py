"""
EcoFlow AI - Database Engine and Seeding Module
"AI-Assisted. Human-Verified. Digitally Traceable."
"""

import os
import sqlite3
import json
import time
from datetime import datetime, timedelta
from crypto_vault import encrypt_field, decrypt_field

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ecoflow.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        service_zone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Service Zones table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS service_zones (
        zone_id TEXT PRIMARY KEY,
        zone_name TEXT NOT NULL,
        description TEXT,
        coordinator_name TEXT,
        center_lat REAL,
        center_lng REAL,
        bounds_json TEXT
    );
    """)

    # 3. Employees / Collectors table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        employee_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        service_zone TEXT NOT NULL,
        mode TEXT DEFAULT 'smartphone', -- smartphone, basic_phone, no_phone
        availability TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, BUSY, OFFLINE
        assigned_hub TEXT NOT NULL,
        workload INTEGER DEFAULT 0,
        collection_history_count INTEGER DEFAULT 0,
        current_lat REAL,
        current_lng REAL
    );
    """)

    # 4. Storage Hubs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS storage_hubs (
        hub_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        service_zone TEXT NOT NULL,
        address TEXT NOT NULL,
        capacity_kg REAL DEFAULT 5000,
        current_load_kg REAL DEFAULT 0,
        lat REAL,
        lng REAL,
        operator_name TEXT
    );
    """)

    # 5. AI Model Versions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_model_versions (
        version_id TEXT PRIMARY KEY,
        version_name TEXT NOT NULL,
        status TEXT DEFAULT 'INACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
        categories_count INTEGER DEFAULT 20,
        accuracy REAL DEFAULT 0.942,
        f1_score REAL DEFAULT 0.920,
        deployment_type TEXT DEFAULT 'Private Organization Cloud Server',
        release_date TEXT,
        description TEXT
    );
    """)

    # 6. Material Taxonomy table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS material_taxonomy (
        material_code TEXT PRIMARY KEY,
        category TEXT NOT NULL, -- PLASTIC, PAPER, METAL, GLASS, E-WASTE, OTHER
        subcategory TEXT NOT NULL,
        default_rate REAL NOT NULL,
        unit TEXT DEFAULT 'kg',
        segregation_guidelines TEXT,
        carbon_offset_per_kg REAL DEFAULT 1.5
    );
    """)

    # 7. Quality Grades table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quality_grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material_code TEXT NOT NULL,
        grade TEXT NOT NULL, -- GRADE A, GRADE B, GRADE C
        rate_multiplier REAL DEFAULT 1.0,
        rate_per_kg REAL NOT NULL,
        criteria TEXT NOT NULL
    );
    """)

    # 8. Pickup Requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pickup_requests (
        pickup_id TEXT PRIMARY KEY,
        household_name TEXT NOT NULL,
        household_phone TEXT,
        address TEXT NOT NULL,
        landmark TEXT,
        service_zone TEXT NOT NULL,
        lat REAL,
        lng REAL,
        preferred_date TEXT,
        time_slot TEXT,
        preliminary_material TEXT,
        user_estimated_weight REAL NOT NULL,
        indicative_rate REAL,
        indicative_value REAL,
        notes TEXT,
        waste_image TEXT,
        status TEXT DEFAULT 'PENDING', -- PENDING, ASSIGNED, COMMUNICATED, COLLECTED, AT_HUB, VERIFIED, SETTLED, CANCELLED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 9. Assignments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assignments (
        assignment_id TEXT PRIMARY KEY,
        pickup_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mode TEXT NOT NULL, -- smartphone, basic_phone, no_phone
        acknowledged INTEGER DEFAULT 0,
        acknowledged_at TIMESTAMP,
        status TEXT DEFAULT 'PENDING_ACK', -- PENDING_ACK, ACKNOWLEDGED, COMMUNICATED, REASSIGNED, COMPLETED
        notes TEXT
    );
    """)

    # 10. Waste Lots table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS waste_lots (
        lot_id TEXT PRIMARY KEY,
        pickup_id TEXT NOT NULL,
        household_name TEXT NOT NULL,
        collector_id TEXT NOT NULL,
        storage_hub_id TEXT NOT NULL,
        collection_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        preliminary_material TEXT,
        user_estimated_weight REAL NOT NULL,
        qr_code TEXT NOT NULL,
        verification_status TEXT DEFAULT 'PENDING_VERIFICATION' -- PENDING_VERIFICATION, VERIFIED, REASSESSMENT_REQUESTED
    );
    """)

    # 11. AI Assessments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_assessments (
        assessment_id TEXT PRIMARY KEY,
        pickup_id TEXT,
        lot_id TEXT,
        model_version TEXT NOT NULL,
        detected_material TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        possible_materials_json TEXT,
        segregation_score INTEGER NOT NULL,
        recommendation TEXT NOT NULL,
        waste_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 12. Physical Verifications table (FINAL AUTHORITY)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS physical_verifications (
        verification_id TEXT PRIMARY KEY,
        lot_id TEXT NOT NULL UNIQUE,
        hub_id TEXT NOT NULL,
        operator_name TEXT NOT NULL,
        verified_weight REAL NOT NULL,
        total_verified_amount REAL NOT NULL,
        weight_match_status TEXT NOT NULL, -- MATCH, DIFFERENCE
        weight_difference REAL NOT NULL,
        weight_difference_pct REAL NOT NULL,
        tolerance_used REAL NOT NULL,
        verification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        discrepancy_reason TEXT,
        discrepancy_notes TEXT,
        quality_grade TEXT DEFAULT 'GRADE B'
    );
    """)

    # 13. Lot Materials breakdown table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lot_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lot_id TEXT NOT NULL,
        material_name TEXT NOT NULL,
        grade TEXT NOT NULL,
        verified_weight REAL NOT NULL,
        rate_per_kg REAL NOT NULL,
        subtotal REAL NOT NULL
    );
    """)

    # 14. Household Settlements table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settlements (
        settlement_id TEXT PRIMARY KEY,
        lot_id TEXT NOT NULL UNIQUE,
        pickup_id TEXT NOT NULL,
        household_name TEXT NOT NULL,
        verified_weight REAL NOT NULL,
        final_amount REAL NOT NULL,
        calculation_formula TEXT NOT NULL,
        settlement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'COMPLETED',
        receipt_number TEXT UNIQUE
    );
    """)

    # 15. Hub Inventory table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        inventory_id TEXT PRIMARY KEY,
        material_name TEXT NOT NULL,
        grade TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        source_lot_id TEXT NOT NULL,
        hub_id TEXT NOT NULL,
        status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, RESERVED, SOLD, DISPATCHED
        batch_id TEXT,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 16. Inventory Batches (Aggregation) table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory_batches (
        batch_id TEXT PRIMARY KEY,
        material_name TEXT NOT NULL,
        total_weight_kg REAL NOT NULL,
        source_lots_json TEXT NOT NULL,
        hub_id TEXT NOT NULL,
        status TEXT DEFAULT 'AGGREGATED', -- AGGREGATED, OFFER_RECEIVED, SOLD, DISPATCHED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 17. Recyclers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recyclers (
        recycler_id TEXT PRIMARY KEY,
        org_name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        location TEXT NOT NULL,
        lat REAL,
        lng REAL,
        accepted_materials TEXT NOT NULL,
        capacity_tonnes_monthly REAL DEFAULT 100,
        authorization_code TEXT NOT NULL,
        active_status TEXT DEFAULT 'AUTHORIZED'
    );
    """)

    # 18. Recycler Offers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recycler_offers (
        offer_id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        recycler_id TEXT NOT NULL,
        recycler_name TEXT NOT NULL,
        material_name TEXT NOT NULL,
        quantity_kg REAL NOT NULL,
        offered_rate_per_kg REAL NOT NULL,
        total_price REAL NOT NULL,
        conditions TEXT,
        offer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'PENDING' -- PENDING, ACCEPTED, REJECTED
    );
    """)

    # 19. Sales Transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales_transactions (
        transaction_id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        offer_id TEXT NOT NULL,
        recycler_id TEXT NOT NULL,
        agreed_rate_per_kg REAL NOT NULL,
        total_amount REAL NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'CONFIRMED'
    );
    """)

    # 20. Dispatches table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispatches (
        dispatch_id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        batch_id TEXT NOT NULL,
        recycler_name TEXT NOT NULL,
        vehicle_no TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        dispatch_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        gate_pass_qr TEXT NOT NULL,
        status TEXT DEFAULT 'DISPATCHED' -- DISPATCHED, IN_TRANSIT, DELIVERED
    );
    """)

    # 21. Reassessment Requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reassessment_requests (
        reassessment_id TEXT PRIMARY KEY,
        lot_id TEXT NOT NULL,
        household_name TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'REQUESTED', -- REQUESTED, UNDER_REVIEW, REVERIFIED, RESOLVED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolution_notes TEXT
    );
    """)

    # 22. AI Feedback Dataset table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_feedback_dataset (
        feedback_id TEXT PRIMARY KEY,
        lot_id TEXT NOT NULL,
        ai_prediction TEXT NOT NULL,
        ai_confidence REAL NOT NULL,
        hub_verified_material TEXT NOT NULL,
        hub_verified_grade TEXT NOT NULL,
        status TEXT DEFAULT 'RAW', -- RAW, REVIEWED, VALIDATED, TRAINING_READY
        model_version TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 23. Audit Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        previous_value TEXT,
        new_value TEXT,
        user_name TEXT NOT NULL,
        role TEXT NOT NULL,
        reason TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 24. System Settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description TEXT
    );
    """)

    # 25. Encrypted User Registry (Section: Military-Grade Encrypted Database Storage)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS encrypted_user_registry (
        user_id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        name_enc TEXT NOT NULL,
        phone_enc TEXT,
        email_enc TEXT,
        address_enc TEXT NOT NULL,
        custom_id_enc TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 26. Admin Whitelist for Command Center Access
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_whitelist (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        is_root INTEGER DEFAULT 0,
        password_hash TEXT,
        password_salt TEXT,
        reset_token TEXT,
        reset_token_expiry REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );
    """)

    # Ensure dakssinghi@gmail.com is seeded as Root Owner with NULL password for first-time setup
    cursor.execute("""
    INSERT OR IGNORE INTO admin_whitelist (email, name, is_root, password_hash, password_salt)
    VALUES ('dakssinghi@gmail.com', 'Daksh Singhi (Owner)', 1, NULL, NULL);
    """)

    # 27. Authorized Field Coordinators Directory (Command Center Verified)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS authorized_coordinators (
        employee_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        service_zone TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    coordinators_seed = [
        ('EMP-2026-101', 'Priyanka Baruah', 'ZONE B', 'priyanka.b@ecoflow.ai', '+91 98640 10001'),
        ('EMP-2026-102', 'Vikram Goswami', 'ZONE A', 'vikram.g@ecoflow.ai', '+91 98640 10002'),
        ('EMP-2026-103', 'Ramen Das', 'ZONE C', 'ramen.d@ecoflow.ai', '+91 98640 10003'),
        ('EMP-2026-104', 'Ananya Sharma', 'ZONE D', 'ananya.s@ecoflow.ai', '+91 98640 10004'),
        ('EMP-2026-904', 'Kavita Deka', 'ZONE C', 'kavita.deka@ecoflow.ai', '+91 98640 44556'),
        ('COORD-01', 'Vikram Goswami', 'ZONE A', 'vikram.g@ecoflow.ai', '+91 98640 10002'),
        ('COORD-02', 'Priyanka Baruah', 'ZONE B', 'priyanka.b@ecoflow.ai', '+91 98640 10001')
    ]
    for c in coordinators_seed:
        cursor.execute("""
        INSERT OR IGNORE INTO authorized_coordinators (employee_id, name, service_zone, email, phone, status)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        """, c)

    conn.commit()
    conn.close()

def seed_demo_data():
    conn = get_db()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as cnt FROM service_zones")
    if cursor.fetchone()["cnt"] > 0:
        conn.close()
        return

    # Seed Service Zones
    zones = [
        ("ZONE A", "North Zone - Kamrup Metro", "Commercial & Residential High-Density", "Vikram Goswami", 26.1850, 91.7500, json.dumps([[26.195, 91.735], [26.195, 91.765], [26.175, 91.765], [26.175, 91.735]])),
        ("ZONE B", "Central Zone - Paltan Bazaar & Panbazar", "Mixed Scrap & High-Volume Hub", "Priyanka Baruah", 26.1800, 91.7700, json.dumps([[26.190, 91.755], [26.190, 91.785], [26.170, 91.785], [26.170, 91.755]])),
        ("ZONE C", "South Zone - Dispur Capital Complex", "Institutional & Government Offices", "Ramen Das", 26.1400, 91.7900, json.dumps([[26.155, 91.775], [26.155, 91.805], [26.125, 91.805], [26.125, 91.775]])),
        ("ZONE D", "East Zone - Narangi & Industrial Belt", "Industrial Aggregation & Recycler Route", "Ananya Sharma", 26.1600, 91.8200, json.dumps([[26.175, 91.805], [26.175, 91.835], [26.145, 91.835], [26.145, 91.805]]))
    ]
    cursor.executemany("INSERT INTO service_zones VALUES (?, ?, ?, ?, ?, ?, ?)", zones)

    # Seed Storage Hubs
    hubs = [
        ("HUB-001", "EcoFlow Central Sorting Hub", "ZONE B", "Plot 42, Paltan Road, Guwahati", 10000.0, 3420.0, 26.1780, 91.7650, "Manoj Kalita (Chief Inspector)"),
        ("HUB-002", "North Kamrup Storage Station", "ZONE A", "Shed 12, Amingaon Logistics Park", 8000.0, 1850.0, 26.1920, 91.7420, "Bhaskar Nath"),
        ("HUB-003", "Dispur Eco Depot", "ZONE C", "Sector 4, Dispur Supermarket Area", 6000.0, 1200.0, 26.1420, 91.7880, "Sangeeta Roy")
    ]
    cursor.executemany("INSERT INTO storage_hubs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", hubs)

    # Seed Collectors / Employees
    employees = [
        ("COL-00142", "Rameshwar Boro", "+91 98765 43210", "ZONE B", "smartphone", "AVAILABLE", "HUB-001", 1, 148, 26.1795, 91.7680),
        ("COL-00156", "Abdul Karim (Basic SMS)", "+91 98765 43211", "ZONE B", "basic_phone", "AVAILABLE", "HUB-001", 0, 92, 26.1820, 91.7620),
        ("COL-00173", "Dhaniram Deka (No Phone)", "+91 00000 00000", "ZONE B", "no_phone", "AVAILABLE", "HUB-001", 0, 65, 26.1760, 91.7720),
        ("COL-00201", "Sunil Chetri", "+91 98765 43213", "ZONE A", "smartphone", "AVAILABLE", "HUB-002", 2, 110, 26.1890, 91.7480),
        ("COL-00205", "Pranab Talukdar", "+91 98765 43214", "ZONE C", "smartphone", "AVAILABLE", "HUB-003", 1, 85, 26.1440, 91.7840)
    ]
    cursor.executemany("INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", employees)

    # Seed AI Models
    models = [
        ("v1.0", "EcoFlow-Waste-v1.0", "ACTIVE", 20, 0.942, 0.920, "Private Organization Cloud Server", "2026-09-01", "Fine-tuned on 14,500 regional Indian scrap samples with segregated plastic, copper wire, and e-waste classification."),
        ("v0.9", "EcoFlow-Waste-v0.9-Beta", "INACTIVE", 16, 0.887, 0.865, "Local On-Prem Edge Node", "2026-06-15", "Baseline pilot model evaluated on municipal residential waste."),
        ("v1.1", "EcoFlow-Waste-v1.1-RC", "INACTIVE", 24, 0.961, 0.945, "Staging Cluster", "2026-09-20", "Candidate release with enhanced distinction between brass and bronze alloys.")
    ]
    cursor.executemany("INSERT INTO ai_model_versions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", models)

    # Seed Material Taxonomy
    materials = [
        ("PET_BOTTLE", "PLASTIC", "PET Plastic Bottles", 24.0, "kg", "Clean, rinsed, empty beverage and water bottles. Remove non-PET caps.", 2.1),
        ("HDPE_PLASTIC", "PLASTIC", "HDPE Hard Plastic", 28.0, "kg", "Detergent bottles, shampoo containers, plastic drums.", 2.3),
        ("LDPE_PLASTIC", "PLASTIC", "LDPE Film & Packaging", 18.0, "kg", "Packaging wraps, clean polythene, grocery bags.", 1.8),
        ("NEWSPAPER", "PAPER", "Old Newspaper (Raddi)", 14.0, "kg", "Dry, unfolded newspaper bundles tied securely.", 1.2),
        ("CARDBOARD", "PAPER", "Corrugated Cardboard", 12.0, "kg", "Flattened carton boxes, clean packaging sheets.", 1.1),
        ("OFFICE_PAPER", "PAPER", "White Office / School Paper", 16.0, "kg", "Printouts, copy paper, unbound notebook paper.", 1.3),
        ("COPPER_SCRAP", "METAL", "Copper Wires & Utensils", 580.0, "kg", "Stripped copper cables, copper water vessels, pipe offcuts.", 4.8),
        ("BRASS_SCRAP", "METAL", "Brass Fixtures & Fittings", 390.0, "kg", "Valves, brass hardware, decorative utensils.", 4.2),
        ("ALUMINIUM_SCRAP", "METAL", "Aluminium Cans & Frames", 145.0, "kg", "Beverage cans, window channels, cooking pots.", 3.9),
        ("IRON_STEEL", "METAL", "Iron & Mild Steel Scrap", 32.0, "kg", "Rods, sheets, rusted iron structures, nails.", 2.5),
        ("GLASS_BOTTLES", "GLASS", "Glass Bottles & Jars", 5.0, "kg", "Intact glass beverage bottles, food jars. Not broken.", 0.8),
        ("EWASTE_PCB", "E-WASTE", "Circuit Boards (PCB)", 220.0, "kg", "Motherboards, appliance control cards, electronic components.", 5.6),
        ("EWASTE_CABLES", "E-WASTE", "Insulated Wires & Cables", 110.0, "kg", "Computer cables, copper wiring cords, adapters.", 3.4),
        ("BATTERIES", "OTHER", "Lead-Acid & Inverter Batteries", 95.0, "kg", "Sealed lead-acid batteries, UPS batteries, intact cells.", 3.0)
    ]
    cursor.executemany("INSERT INTO material_taxonomy VALUES (?, ?, ?, ?, ?, ?, ?)", materials)

    # Seed Quality Grades
    grades = [
        ("COPPER_SCRAP", "GRADE A", 1.05, 610.0, "Bare bright shiny copper wire (>99% purity), zero insulation."),
        ("COPPER_SCRAP", "GRADE B", 1.00, 580.0, "Clean burnt or oxidized copper wire, light tinning, heavy scrap."),
        ("COPPER_SCRAP", "GRADE C", 0.85, 495.0, "Mixed copper offcuts with light solder residue or minor attachments."),
        ("PET_BOTTLE", "GRADE A", 1.00, 24.0, "Clear transparent, completely dry, labels intact or neatly separated."),
        ("PET_BOTTLE", "GRADE B", 0.88, 21.0, "Colored PET bottles (green/blue), rinsed, flattened."),
        ("NEWSPAPER", "GRADE A", 1.00, 14.0, "Dry, crisp newsprint, completely unsoiled."),
        ("NEWSPAPER", "GRADE B", 0.85, 12.0, "Lightly aged or mixed inserts, completely dry."),
        ("ALUMINIUM_SCRAP", "GRADE A", 1.00, 145.0, "Clean extruded aluminium profiles, unpainted."),
        ("ALUMINIUM_SCRAP", "GRADE B", 0.85, 123.0, "Pressed cans, cooking utensils, painted sheets."),
        ("EWASTE_PCB", "GRADE A", 1.15, 255.0, "High-grade telecom and server motherboards with gold pins."),
        ("EWASTE_PCB", "GRADE B", 1.00, 220.0, "Standard desktop/laptop motherboards, green board."),
        ("EWASTE_PCB", "GRADE C", 0.75, 165.0, "Low-grade single-sided power supply & CRT boards.")
    ]
    for g in grades:
        cursor.execute("INSERT INTO quality_grades (material_code, grade, rate_multiplier, rate_per_kg, criteria) VALUES (?, ?, ?, ?, ?)", g)

    # Seed Recyclers
    recyclers = [
        ("REC-001", "Pragati Metal Refiners Ltd.", "Rajeev Singhania", "+91 94350 11223", "Brahmaputra Industrial Estate, Narangi", 26.1620, 91.8240, "COPPER_SCRAP, BRASS_SCRAP, ALUMINIUM_SCRAP", 250.0, "PCB-AS-AUTH-2024-8891", "AUTHORIZED"),
        ("REC-002", "GreenPlast Circular Solutions", "Tanvi Sengupta", "+91 94350 22334", "Logistics Hub, Amingaon", 26.1980, 91.7380, "PET_BOTTLE, HDPE_PLASTIC, LDPE_PLASTIC", 400.0, "PCB-AS-AUTH-2025-4102", "AUTHORIZED"),
        ("REC-003", "IndoTech E-Waste Recyclers", "Kalyan Bora", "+91 94350 33445", "Tech Park Sector 2, Guwahati", 26.1550, 91.8100, "EWASTE_PCB, EWASTE_CABLES, BATTERIES", 150.0, "CPCB-EWASTE-R-2024-099", "AUTHORIZED")
    ]
    cursor.executemany("INSERT INTO recyclers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", recyclers)

    # Seed Settings
    settings = [
        ("weight_tolerance_pct", "5.0", "Acceptable percentage tolerance for weight matching (e.g. ±5%)"),
        ("reassignment_timeout_mins", "15", "Minutes before an unacknowledged assignment reallocates"),
        ("active_ai_model", "v1.0", "Current production AI inference model version"),
        ("currency_symbol", "₹", "Currency symbol for financial settlements"),
        ("organization_name", "EcoFlow AI Operations India", "Official legal recycling management body")
    ]
    for s in settings:
        cursor.execute("INSERT INTO system_settings VALUES (?, ?, ?)", s)

    # Seed SCENARIO 1 (Prompt Section 52 Requirements):
    # Household: Demo Household
    # Pickup: PR-2026-000842
    # Collector: COL-00142
    # Lot: LOT-2026-000184
    # AI: Copper + PCB
    # User estimate: 10 kg
    # Hub verification: 10 kg -> MATCH -> "Congratulations! You are making a Leaner and Greener Environment."
    p1 = (
        "PR-2026-000842", "Demo Household (Rahul Sharma)", "+91 98640 12345",
        "House 14, Peace Enclave, Paltan Bazaar, Guwahati", "Opposite State Library",
        "ZONE B", 26.1792, 91.7695, "2026-09-27", "10:00 AM - 12:00 PM",
        "Copper Wires & Circuit Boards", 10.0, 580.0, 5800.0,
        "Bundle of old stripped motor copper cables and desktop motherboards from study overhaul.",
        "copper_pcb_bundle.jpg", "VERIFIED"
    )
    cursor.execute("""
    INSERT INTO pickup_requests (
        pickup_id, household_name, household_phone, address, landmark, service_zone,
        lat, lng, preferred_date, time_slot, preliminary_material, user_estimated_weight,
        indicative_rate, indicative_value, notes, waste_image, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, p1)

    # Assignment for PR-2026-000842
    cursor.execute("""
    INSERT INTO assignments (assignment_id, pickup_id, employee_id, assigned_at, mode, acknowledged, acknowledged_at, status, notes)
    VALUES ('ASN-2026-000842', 'PR-2026-000842', 'COL-00142', '2026-09-27 09:15:00', 'smartphone', 1, '2026-09-27 09:17:30', 'COMPLETED', 'Assigned via automated zone workload rule')
    """)

    # AI Assessment for PR-2026-000842
    cursor.execute("""
    INSERT INTO ai_assessments (
        assessment_id, pickup_id, lot_id, model_version, detected_material, confidence_score,
        possible_materials_json, segregation_score, recommendation, waste_image
    ) VALUES (
        'AI-2026-000842', 'PR-2026-000842', 'LOT-2026-000184', 'EcoFlow-Waste-v1.0',
        'Copper Scrap & PCB Board', 0.912,
        '["Copper Wires (91.2%)", "Printed Circuit Board (84.6%)", "Mixed Insulated Cable (12.3%)"]',
        88, 'Separate high-purity copper scrap from circuit boards before physical weighment.',
        'copper_pcb_bundle.jpg'
    )
    """)

    # Lot LOT-2026-000184
    cursor.execute("""
    INSERT INTO waste_lots (
        lot_id, pickup_id, household_name, collector_id, storage_hub_id,
        collection_timestamp, preliminary_material, user_estimated_weight, qr_code, verification_status
    ) VALUES (
        'LOT-2026-000184', 'PR-2026-000842', 'Demo Household (Rahul Sharma)', 'COL-00142', 'HUB-001',
        '2026-09-27 10:45:00', 'Copper Wires & Circuit Boards', 10.0, 'LOT-2026-000184', 'VERIFIED'
    )
    """)

    # Physical Verification for LOT-2026-000184 (10 kg -> MATCH)
    # Segregation breakdown: Copper 7.9 kg @ 580 = 4,582, PCB 2.1 kg @ 220 = 462. Total = 10.0 kg, ₹5,044
    cursor.execute("""
    INSERT INTO physical_verifications (
        verification_id, lot_id, hub_id, operator_name, verified_weight, total_verified_amount,
        weight_match_status, weight_difference, weight_difference_pct, tolerance_used,
        verification_timestamp, discrepancy_reason, discrepancy_notes, quality_grade
    ) VALUES (
        'VER-2026-000184', 'LOT-2026-000184', 'HUB-001', 'Manoj Kalita (Chief Inspector)',
        10.0, 5044.0, 'MATCH', 0.0, 0.0, 5.0,
        '2026-09-27 11:30:00', 'None', 'Segregated cleanly. Grade B burnt copper and intact green desktop PCB.', 'GRADE B'
    )
    """)

    # Lot materials breakdown
    cursor.execute("""
    INSERT INTO lot_materials (lot_id, material_name, grade, verified_weight, rate_per_kg, subtotal)
    VALUES ('LOT-2026-000184', 'Copper Scrap', 'GRADE B', 7.9, 580.0, 4582.0)
    """)
    cursor.execute("""
    INSERT INTO lot_materials (lot_id, material_name, grade, verified_weight, rate_per_kg, subtotal)
    VALUES ('LOT-2026-000184', 'Circuit Boards (PCB)', 'GRADE B', 2.1, 220.0, 462.0)
    """)

    # Settlement for LOT-2026-000184
    cursor.execute("""
    INSERT INTO settlements (
        settlement_id, lot_id, pickup_id, household_name, verified_weight,
        final_amount, calculation_formula, settlement_date, status, receipt_number
    ) VALUES (
        'SET-2026-000184', 'LOT-2026-000184', 'PR-2026-000842', 'Demo Household (Rahul Sharma)',
        10.0, 5044.0, '(7.9 kg Copper × ₹580/kg) + (2.1 kg PCB × ₹220/kg) = ₹5,044.00',
        '2026-09-27 11:35:00', 'COMPLETED', 'RCP-2026-990142'
    )
    """)

    # Inventory entries from LOT-2026-000184
    cursor.execute("""
    INSERT INTO inventory (inventory_id, material_name, grade, weight_kg, source_lot_id, hub_id, status)
    VALUES ('INV-2026-001', 'Copper Scrap', 'GRADE B', 7.9, 'LOT-2026-000184', 'HUB-001', 'AVAILABLE')
    """)
    cursor.execute("""
    INSERT INTO inventory (inventory_id, material_name, grade, weight_kg, source_lot_id, hub_id, status)
    VALUES ('INV-2026-002', 'Circuit Boards (PCB)', 'GRADE B', 2.1, 'LOT-2026-000184', 'HUB-001', 'AVAILABLE')
    """)

    # AI Feedback entry for LOT-2026-000184
    cursor.execute("""
    INSERT INTO ai_feedback_dataset (
        feedback_id, lot_id, ai_prediction, ai_confidence, hub_verified_material, hub_verified_grade, status, model_version
    ) VALUES (
        'FB-2026-001', 'LOT-2026-000184', 'Copper Scrap & PCB Board', 0.912, 'Copper Scrap (7.9kg) + PCB (2.1kg)', 'GRADE B', 'VALIDATED', 'EcoFlow-Waste-v1.0'
    )
    """)

    # Audit log for scenario 1
    cursor.execute("""
    INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
    VALUES ('WEIGHT_VERIFIED', 'User Estimate: 10.0 kg', 'Verified: 10.0 kg (Tolerance: ±5.0%)', 'Manoj Kalita', 'Storage Hub Operator', 'Physical digital scale calibration check passed. Exact weight match.')
    """)
    cursor.execute("""
    INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
    VALUES ('SETTLEMENT_PROCESSED', 'Indicative: ₹5,800.00', 'Verified: ₹5,044.00', 'EcoFlow Settlement Engine', 'System', 'Computed using verified 7.9kg Copper @ ₹580 + 2.1kg PCB @ ₹220.')
    """)

    # SCENARIO 2 (Prompt Section 52 Requirements):
    # User estimate: 10 kg, Hub verification: 7.8 kg -> DIFFERENCE -> Informative notice, NO celebration popup
    p2 = (
        "PR-2026-000843", "Ananya Baruah (Resident)", "+91 98640 23456",
        "Flat 3B, Brahmaputra Heights, Panbazar, Guwahati", "Near Don Bosco School",
        "ZONE B", 26.1825, 91.7660, "2026-09-27", "02:00 PM - 04:00 PM",
        "Copper Cables & Scrap", 10.0, 580.0, 5800.0,
        "Heavy coils of telephone and earthing wire.",
        "copper_coils.jpg", "VERIFIED"
    )
    cursor.execute("""
    INSERT INTO pickup_requests (
        pickup_id, household_name, household_phone, address, landmark, service_zone,
        lat, lng, preferred_date, time_slot, preliminary_material, user_estimated_weight,
        indicative_rate, indicative_value, notes, waste_image, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, p2)

    cursor.execute("""
    INSERT INTO assignments (assignment_id, pickup_id, employee_id, assigned_at, mode, acknowledged, acknowledged_at, status, notes)
    VALUES ('ASN-2026-000843', 'PR-2026-000843', 'COL-00142', '2026-09-27 13:10:00', 'smartphone', 1, '2026-09-27 13:12:00', 'COMPLETED', 'Regular afternoon pickup run')
    """)

    cursor.execute("""
    INSERT INTO waste_lots (
        lot_id, pickup_id, household_name, collector_id, storage_hub_id,
        collection_timestamp, preliminary_material, user_estimated_weight, qr_code, verification_status
    ) VALUES (
        'LOT-2026-000185', 'PR-2026-000843', 'Ananya Baruah (Resident)', 'COL-00142', 'HUB-001',
        '2026-09-27 14:30:00', 'Copper Cables & Scrap', 10.0, 'LOT-2026-000185', 'VERIFIED'
    )
    """)

    # Verification LOT-2026-000185: 7.8 kg verified -> DIFFERENCE (Diff: -2.2 kg, -22.0%)
    cursor.execute("""
    INSERT INTO physical_verifications (
        verification_id, lot_id, hub_id, operator_name, verified_weight, total_verified_amount,
        weight_match_status, weight_difference, weight_difference_pct, tolerance_used,
        verification_timestamp, discrepancy_reason, discrepancy_notes, quality_grade
    ) VALUES (
        'VER-2026-000185', 'LOT-2026-000185', 'HUB-001', 'Manoj Kalita (Chief Inspector)',
        7.8, 4524.0, 'DIFFERENCE', -2.2, -22.0, 5.0,
        '2026-09-27 15:10:00', 'Insulation and plastic spool removed',
        'Household estimated total bundle including packaging spool and thick rubber sheathing. Only stripped pure copper weighed.',
        'GRADE B'
    )
    """)

    cursor.execute("""
    INSERT INTO lot_materials (lot_id, material_name, grade, verified_weight, rate_per_kg, subtotal)
    VALUES ('LOT-2026-000185', 'Copper Scrap', 'GRADE B', 7.8, 580.0, 4524.0)
    """)

    cursor.execute("""
    INSERT INTO settlements (
        settlement_id, lot_id, pickup_id, household_name, verified_weight,
        final_amount, calculation_formula, settlement_date, status, receipt_number
    ) VALUES (
        'SET-2026-000185', 'LOT-2026-000185', 'PR-2026-000843', 'Ananya Baruah (Resident)',
        7.8, 4524.0, '7.8 kg Copper × ₹580/kg = ₹4,524.00',
        '2026-09-27 15:15:00', 'COMPLETED', 'RCP-2026-990143'
    )
    """)

    cursor.execute("""
    INSERT INTO inventory (inventory_id, material_name, grade, weight_kg, source_lot_id, hub_id, status)
    VALUES ('INV-2026-003', 'Copper Scrap', 'GRADE B', 7.8, 'LOT-2026-000185', 'HUB-001', 'AVAILABLE')
    """)

    cursor.execute("""
    INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
    VALUES ('WEIGHT_VERIFIED', 'User Estimate: 10.0 kg', 'Verified: 7.8 kg (Difference: -2.2 kg, -22.0%)', 'Manoj Kalita', 'Storage Hub Operator', 'Rubber jacket tare weight deducted per standard hub protocol.')
    """)

    # Seed an AGGREGATED BATCH & RECYCLER OFFER demonstrating full downstream chain:
    # Aggregated batch of 500 kg PET Plastic Bottles
    cursor.execute("""
    INSERT INTO inventory_batches (batch_id, material_name, total_weight_kg, source_lots_json, hub_id, status)
    VALUES ('BATCH-2026-PLAST-01', 'PET Plastic Bottles', 500.0, '["LOT-2026-000170", "LOT-2026-000174", "LOT-2026-000178", "LOT-2026-000181"]', 'HUB-001', 'OFFER_RECEIVED')
    """)

    # Recycler Offer for BATCH-2026-PLAST-01
    cursor.execute("""
    INSERT INTO recycler_offers (
        offer_id, batch_id, recycler_id, recycler_name, material_name, quantity_kg,
        offered_rate_per_kg, total_price, conditions, status
    ) VALUES (
        'OFFER-2026-042', 'BATCH-2026-PLAST-01', 'REC-002', 'GreenPlast Circular Solutions',
        'PET Plastic Bottles', 500.0, 31.50, 15750.0,
        'Grade A clear flake certified; FOB Hub 01 pickup within 48 hours.', 'PENDING'
    )
    """)

    # Additional pending pickup for live demonstration
    p3 = (
        "PR-2026-000844", "Meenakshi Devi", "+91 98640 34567",
        "House 8, Zoo Road Tiniali, Guwahati", "Beside SBI ATM",
        "ZONE B", 26.1740, 91.7760, "2026-09-28", "11:00 AM - 01:00 PM",
        "Old Newspapers & Cardboard", 25.0, 14.0, 350.0,
        "Bundle of 3 months Indian Express raddi and amazon cartons.",
        "newspaper_cardboard.jpg", "PENDING"
    )
    cursor.execute("""
    INSERT INTO pickup_requests (
        pickup_id, household_name, household_phone, address, landmark, service_zone,
        lat, lng, preferred_date, time_slot, preliminary_material, user_estimated_weight,
        indicative_rate, indicative_value, notes, waste_image, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, p3)

    # Seed initial encrypted user records if registry is empty
    cursor.execute("SELECT COUNT(*) as count FROM encrypted_user_registry")
    if cursor.fetchone()["count"] == 0:
        demo_encrypted = [
            ("USR-DEMO-01", "household", encrypt_field("Rahul Sharma"), encrypt_field("+91 98640 12345"), encrypt_field("rahul.sharma@example.com"), encrypt_field("House 42, Green Park Avenue, North Zone, Guwahati"), encrypt_field("HH-00842")),
            ("USR-DEMO-02", "coordinator", encrypt_field("Vikram Goswami"), encrypt_field("+91 98640 22334"), encrypt_field("vikram.goswami@ecoflow.ai"), encrypt_field("EcoFlow Field Ops Hub 1, Paltan Bazaar, Guwahati"), encrypt_field("EMP-COORD-104")),
            ("USR-DEMO-03", "collector", encrypt_field("Raju Ahmed (Kabadiwala)"), encrypt_field("+91 98640 55667"), encrypt_field("raju.ahmed@field.ecoflow.ai"), encrypt_field("Ward 9, Panbazar Scrap Depot, Guwahati"), encrypt_field("COL-2026-0042")),
            ("USR-DEMO-04", "hub", encrypt_field("Subhash Chandra Barman"), encrypt_field("+91 98640 99887"), encrypt_field("hub.manager@ecoflow.ai"), encrypt_field("EcoFlow Storage Hub 01, Narangi Industrial Estate, Guwahati"), encrypt_field("HUB-AUTH-01")),
            ("USR-DEMO-05", "recycler", encrypt_field("GreenPlast Industrial Solutions"), encrypt_field("+91 98640 77112"), encrypt_field("procurement@greenplast.in"), encrypt_field("Industrial Growth Centre, Matia, Goalpara"), encrypt_field("REC-OFFTAKE-09"))
        ]
        cursor.executemany("""
        INSERT INTO encrypted_user_registry (user_id, role, name_enc, phone_enc, email_enc, address_enc, custom_id_enc)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, demo_encrypted)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    seed_demo_data()
    print("Database initialized and demo scenarios seeded successfully.")
