import sqlite3

DB_PATH = "ecoflow.db"

def clean_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    tables_to_empty = [
        "pickup_requests",
        "assignments",
        "waste_lots",
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

    for table in tables_to_empty:
        try:
            cursor.execute(f"DELETE FROM {table}")
            print(f"Cleared table: {table}")
        except Exception as e:
            print(f"Error clearing {table}: {e}")

    # Remove any test admins, keep only dakssinghi@gmail.com with Badminton1#
    cursor.execute("DELETE FROM admin_whitelist WHERE email != 'dakssinghi@gmail.com'")
    
    p_hash = "61cbbcac3af141579ed8b833e2b177807a54a863e92c02a5b1bc5d15585e4b3c"
    p_salt = "1430c54781a1e7a767311188f1c1932666993c54ae63415e419f60d28e8d444f"

    cursor.execute("""
    INSERT INTO admin_whitelist (email, name, is_root, password_hash, password_salt, reset_token, reset_token_expiry, last_login)
    VALUES ('dakssinghi@gmail.com', 'Daksh Singhi (Owner)', 1, ?, ?, NULL, NULL, NULL)
    ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash,
        password_salt = excluded.password_salt,
        reset_token = NULL,
        reset_token_expiry = NULL,
        last_login = NULL;
    """, (p_hash, p_salt))

    # Seed clean zero-workload / zero-history municipal staff collectors so assignments can occur
    default_employees = [
        ('COL-00142', 'Rameshwar Boro', '+91 98765 43210', 'ZONE B', 'smartphone', 'AVAILABLE', 'HUB-001', 0, 0, 26.1800, 91.7700),
        ('COL-00156', 'Biren Das', '+91 98540 11223', 'ZONE B', 'basic_phone', 'AVAILABLE', 'HUB-001', 0, 0, 26.1850, 91.7750),
        ('COL-00173', 'Tarun Kalita', None, 'ZONE B', 'no_phone', 'AVAILABLE', 'HUB-001', 0, 0, 26.1750, 91.7650)
    ]
    cursor.executemany("""
    INSERT INTO employees (employee_id, name, phone, service_zone, mode, availability, assigned_hub, workload, collection_history_count, current_lat, current_lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, default_employees)

    conn.commit()
    cursor.execute("VACUUM")
    conn.commit()
    conn.close()
    print("Database vacuumed and cleaned. Null initial history configured for actual version.")

if __name__ == "__main__":
    clean_database()
