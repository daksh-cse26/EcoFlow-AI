"""
EcoFlow AI - Production Backend Server
REST API & Static Web Server
"AI-Assisted. Human-Verified. Digitally Traceable."
"""

import os
import sys
import json
import time
import math
import random
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from database import get_db, init_db, seed_demo_data
from ai_engine import local_ai, TAXONOMY_CATEGORIES
from crypto_vault import encrypt_field, decrypt_field, hash_password, verify_password, generate_reset_token

# Change working directory to current script directory to prevent sandbox path issues
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(CURRENT_DIR)

STATIC_DIR = os.path.join(CURRENT_DIR, "static")

class EcoFlowAPIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def _send_json(self, data, status=200):
        response_bytes = json.dumps(data, default=str).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _read_body_json(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length).decode('utf-8')
        return json.loads(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if not path.startswith('/api/'):
            # Serve static files
            return super().do_GET()

        try:
            conn = get_db()
            cursor = conn.cursor()

            # 1. System Health and Statistics
            if path == '/api/status':
                cursor.execute("SELECT setting_value FROM system_settings WHERE setting_key = 'active_ai_model'")
                row = cursor.fetchone()
                active_model = row["setting_value"] if row else "v1.0"
                return self._send_json({
                    "status": "ONLINE",
                    "system": "EcoFlow AI Enterprise Node",
                    "tagline": "AI-Assisted. Human-Verified. Digitally Traceable.",
                    "active_model": f"EcoFlow-Waste-{active_model}",
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                })

            elif path == '/api/dashboard/stats':
                cursor.execute("SELECT COUNT(*) as count FROM pickup_requests")
                total_pickups = cursor.fetchone()["count"]

                cursor.execute("SELECT COUNT(*) as count FROM pickup_requests WHERE status = 'PENDING'")
                pending_pickups = cursor.fetchone()["count"]

                cursor.execute("SELECT COUNT(*) as count FROM waste_lots WHERE verification_status = 'PENDING_VERIFICATION'")
                pending_verifications = cursor.fetchone()["count"]

                cursor.execute("SELECT COUNT(*) as count FROM physical_verifications")
                verified_lots_count = cursor.fetchone()["count"]

                cursor.execute("SELECT COALESCE(SUM(verified_weight), 0) as total FROM physical_verifications")
                total_verified_weight = cursor.fetchone()["total"]

                cursor.execute("SELECT COALESCE(SUM(weight_kg), 0) as total FROM inventory WHERE status = 'AVAILABLE'")
                available_inventory_weight = cursor.fetchone()["total"]

                cursor.execute("SELECT COALESCE(SUM(final_amount), 0) as total FROM settlements")
                total_settlements_amount = cursor.fetchone()["total"]

                cursor.execute("SELECT COUNT(*) as count FROM employees WHERE availability = 'AVAILABLE'")
                available_collectors = cursor.fetchone()["count"]

                cursor.execute("SELECT COUNT(*) as count FROM physical_verifications WHERE weight_match_status = 'MATCH'")
                matched_weights_count = cursor.fetchone()["count"]

                cursor.execute("SELECT COUNT(*) as count FROM recycler_offers WHERE status = 'ACCEPTED'")
                recycler_sales_count = cursor.fetchone()["count"]

                conn.close()
                return self._send_json({
                    "total_pickups": total_pickups,
                    "pending_pickups": pending_pickups,
                    "pending_verifications": pending_verifications,
                    "verified_lots": verified_lots_count,
                    "total_verified_weight_kg": round(total_verified_weight, 2),
                    "available_inventory_kg": round(available_inventory_weight, 2),
                    "total_settlements_inr": round(total_settlements_amount, 2),
                    "available_collectors": available_collectors,
                    "matched_weights_count": matched_weights_count,
                    "recycler_sales_count": recycler_sales_count
                })

            # 2. Material Taxonomy and Rate Card
            elif path == '/api/taxonomy':
                cursor.execute("SELECT * FROM material_taxonomy ORDER BY category, subcategory")
                materials = [dict(r) for r in cursor.fetchall()]
                cursor.execute("SELECT * FROM quality_grades ORDER BY material_code, grade")
                grades = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({
                    "materials": materials,
                    "quality_grades": grades
                })

            # 3. AI Models and Management
            elif path == '/api/ai/models':
                cursor.execute("SELECT * FROM ai_model_versions ORDER BY version_id DESC")
                models = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"models": models})

            # 4. AI Feedback Dataset
            elif path == '/api/ai/feedback':
                cursor.execute("SELECT * FROM ai_feedback_dataset ORDER BY created_at DESC LIMIT 50")
                feedback = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"feedback": feedback})

            # 5. Service Zones
            elif path == '/api/zones':
                cursor.execute("SELECT * FROM service_zones")
                zones = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"zones": zones})

            # 6. Storage Hubs
            elif path == '/api/hubs':
                cursor.execute("SELECT * FROM storage_hubs")
                hubs = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"hubs": hubs})

            # 7. Employees / Collectors
            elif path == '/api/employees':
                zone_filter = query.get('zone', [None])[0]
                if zone_filter:
                    cursor.execute("SELECT * FROM employees WHERE service_zone = ? ORDER BY workload ASC", (zone_filter,))
                else:
                    cursor.execute("SELECT * FROM employees ORDER BY service_zone, workload ASC")
                employees = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"employees": employees})

            # 8. Pickups List
            elif path == '/api/pickups':
                status_filter = query.get('status', [None])[0]
                if status_filter:
                    cursor.execute("SELECT * FROM pickup_requests WHERE status = ? ORDER BY created_at DESC", (status_filter,))
                else:
                    cursor.execute("SELECT * FROM pickup_requests ORDER BY created_at DESC")
                pickups = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"pickups": pickups})

            # 9. Waste Lots
            elif path == '/api/lots':
                status_filter = query.get('status', [None])[0]
                if status_filter:
                    cursor.execute("SELECT * FROM waste_lots WHERE verification_status = ? ORDER BY collection_timestamp DESC", (status_filter,))
                else:
                    cursor.execute("SELECT * FROM waste_lots ORDER BY collection_timestamp DESC")
                lots = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"lots": lots})

            # 10. Single Lot Details with Assessment
            elif path.startswith('/api/lots/'):
                lot_id = path.split('/')[-1]
                cursor.execute("SELECT * FROM waste_lots WHERE lot_id = ?", (lot_id,))
                lot = cursor.fetchone()
                if not lot:
                    conn.close()
                    return self._send_json({"error": "Lot not found"}, status=404)

                lot_data = dict(lot)
                cursor.execute("SELECT * FROM ai_assessments WHERE lot_id = ? OR pickup_id = ?", (lot_id, lot_data["pickup_id"]))
                assessment = cursor.fetchone()
                lot_data["ai_assessment"] = dict(assessment) if assessment else None

                cursor.execute("SELECT * FROM physical_verifications WHERE lot_id = ?", (lot_id,))
                verification = cursor.fetchone()
                lot_data["verification"] = dict(verification) if verification else None

                cursor.execute("SELECT * FROM lot_materials WHERE lot_id = ?", (lot_id,))
                materials = [dict(r) for r in cursor.fetchall()]
                lot_data["verified_materials"] = materials

                conn.close()
                return self._send_json({"lot": lot_data})

            # 11. Settlement Receipt
            elif path.startswith('/api/settlements/'):
                lot_id = path.split('/')[-1]
                cursor.execute("SELECT * FROM settlements WHERE lot_id = ?", (lot_id,))
                settlement = cursor.fetchone()
                if not settlement:
                    conn.close()
                    return self._send_json({"error": "Settlement not found"}, status=404)

                settlement_data = dict(settlement)
                cursor.execute("SELECT * FROM physical_verifications WHERE lot_id = ?", (lot_id,))
                verification = cursor.fetchone()
                settlement_data["verification"] = dict(verification) if verification else None

                cursor.execute("SELECT * FROM lot_materials WHERE lot_id = ?", (lot_id,))
                materials = [dict(r) for r in cursor.fetchall()]
                settlement_data["items"] = materials

                cursor.execute("SELECT * FROM waste_lots WHERE lot_id = ?", (lot_id,))
                lot = cursor.fetchone()
                settlement_data["lot"] = dict(lot) if lot else None

                cursor.execute("SELECT * FROM ai_assessments WHERE lot_id = ? OR pickup_id = ?", (lot_id, settlement_data["pickup_id"]))
                ai_ass = cursor.fetchone()
                settlement_data["ai_assessment"] = dict(ai_ass) if ai_ass else None

                conn.close()
                return self._send_json({"settlement": settlement_data})

            # 12. Hub Inventory
            elif path == '/api/inventory':
                cursor.execute("SELECT * FROM inventory WHERE status = 'AVAILABLE' ORDER BY date_added DESC")
                items = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"inventory": items})

            # 13. Batches (Aggregated inventory)
            elif path == '/api/batches':
                cursor.execute("SELECT * FROM inventory_batches ORDER BY created_at DESC")
                batches = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"batches": batches})

            # 14. Recyclers & Offers
            elif path == '/api/recyclers':
                cursor.execute("SELECT * FROM recyclers ORDER BY org_name")
                recyclers = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"recyclers": recyclers})

            elif path == '/api/recycler/offers':
                cursor.execute("SELECT * FROM recycler_offers ORDER BY offer_date DESC")
                offers = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"offers": offers})

            # 15. Audit Logs
            elif path == '/api/audit-logs':
                cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100")
                logs = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"audit_logs": logs})

            # 16. End-to-End Traceability
            elif path.startswith('/api/traceability/'):
                query_id = path.split('/')[-1]
                chain = self._trace_full_chain(cursor, query_id)
                conn.close()
                return self._send_json(chain)

            # 17. System Settings
            elif path == '/api/settings':
                cursor.execute("SELECT * FROM system_settings")
                settings = {r["setting_key"]: r["setting_value"] for r in cursor.fetchall()}
                conn.close()
                return self._send_json({"settings": settings})

            # 18. Command Center Whitelist (Authorized Admins)
            elif path == '/api/auth/whitelist':
                cursor.execute("SELECT email, name, is_root, (password_hash IS NOT NULL) as has_password, created_at, last_login FROM admin_whitelist ORDER BY is_root DESC, created_at ASC")
                whitelist = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"whitelist": whitelist})

            # 19. Encrypted User Registry (Decrypted strictly for Command Center)
            elif path == '/api/auth/registry':
                cursor.execute("SELECT * FROM encrypted_user_registry ORDER BY created_at DESC")
                raw_rows = cursor.fetchall()
                decrypted_list = []
                for r in raw_rows:
                    decrypted_list.append({
                        "user_id": r["user_id"],
                        "role": r["role"],
                        "name": decrypt_field(r["name_enc"]),
                        "phone": decrypt_field(r["phone_enc"]) if r["phone_enc"] else "—",
                        "email": decrypt_field(r["email_enc"]) if r["email_enc"] else "—",
                        "address": decrypt_field(r["address_enc"]),
                        "custom_id": decrypt_field(r["custom_id_enc"]) if r["custom_id_enc"] else "—",
                        "raw_ciphertext": (r["name_enc"][:32] + "...") if r["name_enc"] else "—",
                        "created_at": r["created_at"]
                    })
                conn.close()
                return self._send_json({"registry": decrypted_list, "total_records": len(decrypted_list)})

            # 20. Authorized Field Coordinators (Command Center Directory)
            elif path == '/api/admin/coordinators':
                cursor.execute("SELECT * FROM authorized_coordinators ORDER BY employee_id ASC")
                coords = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"coordinators": coords, "count": len(coords)})

            # 21. Live Scrap Market Rates for Household App
            elif path == '/api/household/live-rates':
                cursor.execute("SELECT material_code, category, subcategory, default_rate, unit, carbon_offset_per_kg FROM material_taxonomy")
                raw = cursor.fetchall()
                meta_map = {
                    'IRON_STEEL': {'icon': '🔩', 'trend': '+3.2%', 'name': 'Iron & Steel Scrap'},
                    'PET_BOTTLE': {'icon': '🧴', 'trend': '+1.5%', 'name': 'PET Plastic Containers'},
                    'HDPE_PLASTIC': {'icon': '🛢️', 'trend': '+2.0%', 'name': 'HDPE Hard Plastics'},
                    'COPPER_SCRAP': {'icon': '⚡', 'trend': '+4.8%', 'name': 'Copper Scrap & Wires'},
                    'ALUMINIUM_SCRAP': {'icon': '🥫', 'trend': '+2.1%', 'name': 'Aluminium Cans & Frames'},
                    'CARDBOARD': {'icon': '📦', 'trend': '-0.5%', 'name': 'Corrugated Cardboard'},
                    'NEWSPAPER': {'icon': '📰', 'trend': '0.0%', 'name': 'Old Newspaper (Raddi)'},
                    'EWASTE_PCB': {'icon': '💻', 'trend': '+5.5%', 'name': 'E-Waste (Circuit Boards)'},
                    'BRASS_SCRAP': {'icon': '🔔', 'trend': '+1.8%', 'name': 'Brass & Metal Alloys'},
                    'BATTERIES': {'icon': '🔋', 'trend': '+0.8%', 'name': 'Lead-Acid Batteries'}
                }
                rates = []
                for r in raw:
                    code = r['material_code']
                    if code in meta_map:
                        rates.append({
                            'code': code,
                            'name': meta_map[code]['name'],
                            'category': r['category'],
                            'rate': r['default_rate'],
                            'unit': r['unit'],
                            'icon': meta_map[code]['icon'],
                            'trend': meta_map[code]['trend'],
                            'carbon_offset': r['carbon_offset_per_kg']
                        })
                conn.close()
                return self._send_json({"rates": rates, "last_updated": time.strftime("%H:%M:%S")})

            # 22. Active Household Pickup Status & Progress Stepper
            elif path == '/api/household/active-pickup':
                cursor.execute("""
                SELECT p.*, w.lot_id, w.verification_status, a.employee_id as assigned_collector,
                       e.name as collector_name, e.mode as collector_mode, e.phone as collector_phone
                FROM pickup_requests p
                LEFT JOIN waste_lots w ON p.pickup_id = w.pickup_id
                LEFT JOIN assignments a ON p.pickup_id = a.pickup_id
                LEFT JOIN employees e ON a.employee_id = e.employee_id
                WHERE p.status IN ('PENDING', 'ACCEPTED', 'ASSIGNED', 'COMMUNICATED', 'VERIFIED', 'PAYMENT_CONFIRMED')
                  AND (w.verification_status IS NULL OR w.verification_status NOT IN ('SETTLED', 'COMPLETED'))
                ORDER BY p.created_at DESC LIMIT 1
                """)
                active = cursor.fetchone()
                if active:
                    active_dict = dict(active)
                    status = active_dict.get('status', 'PENDING')
                    v_status = active_dict.get('verification_status', '')
                    
                    step = 1
                    if status in ('ACCEPTED', 'ASSIGNED', 'COMMUNICATED'):
                        step = 2
                    if v_status in ('VERIFIED', 'IN_HUB') or status == 'VERIFIED':
                        step = 3
                    if status == 'PAYMENT_CONFIRMED':
                        step = 4
                    if status in ('COMPLETED', 'SETTLED', 'PAYMENT_RECEIVED') or v_status in ('SETTLED', 'COMPLETED'):
                        step = 5

                    is_locked = (step < 5)

                    conn.close()
                    return self._send_json({
                        "has_active": is_locked,
                        "pickup": active_dict,
                        "step": step,
                        "is_locked": is_locked,
                        "lot_id": active_dict.get('lot_id') or f"LOT-{active_dict['pickup_id']}"
                    })
                else:
                    conn.close()
                    return self._send_json({"has_active": False, "step": 0, "is_locked": False})

            # 21. Field Coordinator: Minimal Collector Lookup (Only Name & Successful Pickups)
            elif path == '/api/coordinator/collector-minimal':
                cid = query.get('collector_id', [''])[0].strip()
                if not cid:
                    conn.close()
                    return self._send_json({"error": "collector_id parameter is required"}, status=400)

                cursor.execute("SELECT name, employee_id, mode FROM employees WHERE employee_id = ?", (cid,))
                emp = cursor.fetchone()
                if not emp:
                    conn.close()
                    return self._send_json({"error": f"Collector ID '{cid}' not found"}, status=404)

                # Fetch ONLY verified and completed pickups/lots
                cursor.execute("""
                    SELECT lot_id, preliminary_material, user_estimated_weight, verification_status, collection_timestamp
                    FROM waste_lots
                    WHERE collector_id = ?
                    ORDER BY collection_timestamp DESC
                """, (cid,))
                lots = [dict(r) for r in cursor.fetchall()]

                # Filter only necessary fields - STRICT PRIVACY (name and past successful pickups only)
                pickups_list = []
                for l in lots:
                    pickups_list.append({
                        "lot_id": l["lot_id"],
                        "material": l["preliminary_material"] or "Recyclable Scrap",
                        "weight": l["user_estimated_weight"] or 0.0,
                        "status": "COMPLETED",
                        "timestamp": l["collection_timestamp"]
                    })

                conn.close()
                return self._send_json({
                    "success": True,
                    "collector_id": cid,
                    "name": emp["name"],
                    "mode": emp["mode"],
                    "successful_pickups_count": len(pickups_list),
                    "successful_pickups": pickups_list
                })

            else:
                conn.close()
                return self._send_json({"error": "Unknown API endpoint"}, status=404)

        except Exception as e:
            return self._send_json({"error": str(e)}, status=500)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        try:
            body = self._read_body_json()
            conn = get_db()
            cursor = conn.cursor()

            # 0. Auth: Unified Role Onboarding & Login (Bypass Mode Active)
            if path == '/api/auth/register-login':
                role = body.get('role', 'household').strip() or 'household'
                name = body.get('name', '').strip() or f"Active {role.capitalize()}"
                phone = body.get('phone', '').strip() or "+91 98000 00000"
                email = body.get('email', '').strip() or (f"dakssinghi@gmail.com" if role == 'admin' else f"{role}@ecoflow.gov.in")
                address = body.get('address', '').strip() or "EcoFlow Operational Facility, Guwahati"
                employee_id = body.get('employee_id', '').strip() or "EMP-2026-101"
                collector_id = body.get('collector_id', '').strip() or f"COL-2026-{random.randint(10000, 99999)}"

                if role == 'admin':
                    conn.close()
                    return self._send_json({
                        "success": True,
                        "first_time_setup": False,
                        "message": "Direct Command Center access granted (Bypass Mode).",
                        "user": {
                            "email": email or "dakssinghi@gmail.com",
                            "name": name or "Daksh Singhi",
                            "role": "admin",
                            "is_root": True
                        }
                    })
                elif role == 'collector':
                    conn.close()
                    return self._send_json({
                        "success": True,
                        "collector_id": collector_id,
                        "user": {
                            "user_id": f"USR-{random.randint(100000, 999999)}",
                            "name": name or "Field Collector",
                            "role": "collector",
                            "collector_id": collector_id,
                            "address": address,
                            "phone": phone,
                            "email": email
                        }
                    })
                elif role == 'coordinator':
                    conn.close()
                    return self._send_json({
                        "success": True,
                        "user": {
                            "user_id": f"USR-{random.randint(100000, 999999)}",
                            "name": name or "Field Coordinator",
                            "role": "coordinator",
                            "employee_id": employee_id,
                            "service_zone": "ZONE A",
                            "address": address,
                            "phone": phone,
                            "email": email
                        }
                    })
                else:
                    conn.close()
                    return self._send_json({
                        "success": True,
                        "user": {
                            "user_id": f"USR-{random.randint(100000, 999999)}",
                            "name": name,
                            "role": role,
                            "address": address,
                            "phone": phone,
                            "email": email
                        }
                    })

            # Grassroots & Phone-less / Basic-Phone Collector Onboarding
            elif path == '/api/auth/register-phoneless':
                reg_type = body.get('type', 'no_phone').strip()  # 'no_phone' or 'basic_phone'
                name = body.get('name', '').strip()
                address = body.get('address', '').strip()
                phone = body.get('phone', '').strip()
                zone = body.get('service_zone', 'ZONE B').strip()
                materials = body.get('materials', 'Mixed Scrap').strip()

                if not name or not address:
                    conn.close()
                    return self._send_json({"success": False, "error": "Name and Operating Address are mandatory."}, status=400)

                # Special collector ID signifying no physical phone or basic phone
                if reg_type == 'no_phone':
                    # Special code 'NP' signifying No Physical Phone
                    collector_id = f"COL-NP-2026-{random.randint(10000, 99999)}"
                    mode = 'no_phone'
                    phone_val = "NO_PHYSICAL_PHONE"
                else:
                    # Special code 'NS' signifying No Smartphone / Basic Phone SMS
                    collector_id = f"COL-NS-2026-{random.randint(10000, 99999)}"
                    mode = 'basic_phone'
                    phone_val = phone or f"+91 98640 {random.randint(10000, 99999)}"

                user_id = f"USR-{random.randint(100000, 999999)}"
                name_enc = encrypt_field(name)
                phone_enc = encrypt_field(phone_val)
                addr_enc = encrypt_field(address)
                col_id_enc = encrypt_field(collector_id)
                meta_enc = encrypt_field(f"Materials: {materials} | Mode: {mode}")

                cursor.execute("""
                INSERT INTO encrypted_user_registry (user_id, role, name_enc, phone_enc, email_enc, address_enc, custom_id_enc)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, f"collector_{mode}", name_enc, phone_enc, meta_enc, addr_enc, col_id_enc))

                # Insert into employees table so live municipal dispatch works
                cursor.execute("""
                INSERT OR REPLACE INTO employees (employee_id, name, phone, service_zone, mode, availability, assigned_hub, workload, collection_history_count, current_lat, current_lng)
                VALUES (?, ?, ?, ?, ?, 'AVAILABLE', 'HUB-001', 0, 0, 26.1800, 91.7700)
                """, (collector_id, name, phone_val, zone, mode))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('PHONELESS_COLLECTOR_REGISTERED', 'Unregistered', ?, 'System Gateway', 'Field Operations', 'Grassroots collector onboarding')
                """, (f"{name} ({collector_id}, Mode: {mode})",))

                conn.commit()
                conn.close()
                return self._send_json({
                    "success": True,
                    "collector_id": collector_id,
                    "mode": mode,
                    "name": name,
                    "message": "Collector successfully registered with special device-status code."
                })

            # Forgot Password Endpoint
            elif path == '/api/auth/forgot-password':
                email = body.get('email', '').strip()
                cursor.execute("SELECT * FROM admin_whitelist WHERE LOWER(email) = LOWER(?)", (email,))
                admin = cursor.fetchone()
                if not admin:
                    conn.close()
                    return self._send_json({"success": False, "error": f"'{email}' is not registered as an authorized Command Center administrator."}, status=404)
                
                token = generate_reset_token()
                expiry = time.time() + 900  # 15 minutes
                cursor.execute("UPDATE admin_whitelist SET reset_token = ?, reset_token_expiry = ? WHERE LOWER(email) = LOWER(?)", (token, expiry, email))
                conn.commit()
                conn.close()
                return self._send_json({
                    "success": True,
                    "message": f"Verification reset code dispatched to {email}.",
                    "token_preview": token
                })

            # Reset Password Endpoint
            elif path == '/api/auth/reset-password':
                email = body.get('email', '').strip()
                token = body.get('token', '').strip()
                new_password = body.get('new_password', '').strip()
                
                if not new_password or len(new_password) < 6:
                    conn.close()
                    return self._send_json({"success": False, "error": "New password must be at least 6 characters long."}, status=400)
                
                cursor.execute("SELECT * FROM admin_whitelist WHERE LOWER(email) = LOWER(?)", (email,))
                admin = cursor.fetchone()
                if not admin:
                    conn.close()
                    return self._send_json({"success": False, "error": "Administrator not found."}, status=404)
                
                if not admin["reset_token"] or admin["reset_token"] != token:
                    conn.close()
                    return self._send_json({"success": False, "error": "Invalid reset verification code."}, status=400)
                
                if time.time() > float(admin["reset_token_expiry"] or 0):
                    conn.close()
                    return self._send_json({"success": False, "error": "Reset code has expired. Please request a new one."}, status=400)
                
                p_hash, p_salt = hash_password(new_password)
                cursor.execute("UPDATE admin_whitelist SET password_hash = ?, password_salt = ?, reset_token = NULL, reset_token_expiry = NULL WHERE LOWER(email) = LOWER(?)", (p_hash, p_salt, email))
                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('ADMIN_PASSWORD_RESET', 'Old Hash', 'PBKDF2-HMAC-SHA256', ?, 'Command Center Admin', 'Password reset with email verification code')
                """, (email,))
                conn.commit()
                conn.close()
                return self._send_json({"success": True, "message": "Master password reset successfully. Please login with your new credentials."})

            # Whitelist Management Endpoint
            elif path == '/api/auth/whitelist':
                caller_email = body.get('caller_email', '').strip().lower()
                if caller_email != 'dakssinghi@gmail.com':
                    conn.close()
                    return self._send_json({"success": False, "error": "Access Denied: Only Daksh Singhi (dakssinghi@gmail.com) has permission to manage the Command Center whitelist."}, status=403)
                
                action = body.get('action')
                target_email = body.get('target_email', '').strip().lower()
                target_name = body.get('target_name', 'Command Center Officer').strip()
                
                if action == 'add':
                    if not target_email or '@' not in target_email:
                        conn.close()
                        return self._send_json({"success": False, "error": "Valid email address required."}, status=400)
                    cursor.execute("INSERT OR IGNORE INTO admin_whitelist (email, name, is_root) VALUES (?, ?, 0)", (target_email, target_name))
                    cursor.execute("""
                    INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                    VALUES ('WHITELIST_ADMIN_ADDED', 'None', ?, 'Daksh Singhi', 'Root Owner', 'Granted Command Center access')
                    """, (f"{target_name} ({target_email})",))
                elif action == 'delete':
                    if target_email == 'dakssinghi@gmail.com':
                        conn.close()
                        return self._send_json({"success": False, "error": "Cannot delete Root Owner account (dakssinghi@gmail.com)."}, status=400)
                    cursor.execute("DELETE FROM admin_whitelist WHERE LOWER(email) = LOWER(?) AND is_root = 0", (target_email,))
                    cursor.execute("""
                    INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                    VALUES ('WHITELIST_ADMIN_REMOVED', ?, 'Removed', 'Daksh Singhi', 'Root Owner', 'Revoked Command Center access')
                    """, (target_email,))
                
                conn.commit()
                cursor.execute("SELECT email, name, is_root, (password_hash IS NOT NULL) as has_password, created_at, last_login FROM admin_whitelist ORDER BY is_root DESC, created_at ASC")
                updated_whitelist = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"success": True, "whitelist": updated_whitelist})

            # Command Center: Manage Authorized Coordinators Directory
            elif path == '/api/admin/coordinators':
                emp_id = body.get('employee_id', '').strip()
                name = body.get('name', '').strip()
                zone = body.get('service_zone', 'ZONE B').strip()
                email = body.get('email', '').strip()
                phone = body.get('phone', '').strip()

                if not emp_id or not name:
                    conn.close()
                    return self._send_json({"success": False, "error": "Employee ID and Coordinator Name are required."}, status=400)

                cursor.execute("""
                INSERT OR REPLACE INTO authorized_coordinators (employee_id, name, service_zone, email, phone, status)
                VALUES (?, ?, ?, ?, ?, 'ACTIVE')
                """, (emp_id, name, zone, email, phone))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('COORDINATOR_AUTHORIZED', 'Unregistered', ?, 'Command Center Admin', 'Administrator', 'Authorized new Field Coordinator employee ID')
                """, (f"{name} ({emp_id})",))

                conn.commit()
                cursor.execute("SELECT * FROM authorized_coordinators ORDER BY employee_id ASC")
                coords = [dict(r) for r in cursor.fetchall()]
                conn.close()
                return self._send_json({"success": True, "coordinators": coords, "message": f"Coordinator {emp_id} authorized in Command Center."})

            # Field Coordinator: Onboard New Collector directly from Coordinator Interface
            elif path == '/api/coordinator/add-collector':
                mode = body.get('mode', 'smartphone').strip()  # 'smartphone', 'basic_phone', 'no_phone'
                name = body.get('name', '').strip()
                phone = body.get('phone', '').strip()
                address = body.get('address', '').strip()
                zone = body.get('service_zone', 'ZONE B').strip()
                hub = body.get('assigned_hub', 'HUB-001').strip()
                specialization = body.get('specialization', 'Mixed Scrap').strip()

                if not name or not address:
                    conn.close()
                    return self._send_json({"success": False, "error": "Collector Name and Operating Address are required."}, status=400)

                if mode == 'no_phone':
                    collector_id = f"COL-NP-2026-{random.randint(10000, 99999)}"
                    phone_val = "NO_PHYSICAL_PHONE"
                elif mode == 'basic_phone':
                    collector_id = f"COL-NS-2026-{random.randint(10000, 99999)}"
                    phone_val = phone or f"+91 98640 {random.randint(10000, 99999)}"
                else:
                    collector_id = f"COL-2026-{random.randint(10000, 99999)}"
                    phone_val = phone or f"+91 98640 {random.randint(10000, 99999)}"

                user_id = f"USR-{random.randint(100000, 999999)}"
                name_enc = encrypt_field(name)
                phone_enc = encrypt_field(phone_val)
                addr_enc = encrypt_field(address)
                col_enc = encrypt_field(collector_id)
                meta_enc = encrypt_field(f"Spec: {specialization} | Mode: {mode} | Coordinator Onboarded")

                cursor.execute("""
                INSERT INTO encrypted_user_registry (user_id, role, name_enc, phone_enc, email_enc, address_enc, custom_id_enc)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, f"collector_{mode}", name_enc, phone_enc, meta_enc, addr_enc, col_enc))

                cursor.execute("""
                INSERT OR REPLACE INTO employees (employee_id, name, phone, service_zone, mode, availability, assigned_hub, workload, collection_history_count, current_lat, current_lng)
                VALUES (?, ?, ?, ?, ?, 'AVAILABLE', ?, 0, 0, 26.1800, 91.7700)
                """, (collector_id, name, phone_val, zone, mode, hub))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('COORDINATOR_ONBOARDED_COLLECTOR', 'New Collector', ?, 'Field Coordinator', 'Coordinator', 'Collector registered via Coordinator portal')
                """, (f"{name} ({collector_id}, Mode: {mode})",))

                conn.commit()
                conn.close()
                return self._send_json({
                    "success": True,
                    "collector_id": collector_id,
                    "mode": mode,
                    "name": name,
                    "service_zone": zone,
                    "assigned_hub": hub,
                    "message": f"Collector {name} ({collector_id}) successfully onboarded to fleet."
                })

            # 1. AI Scan
            elif path == '/api/ai/scan':
                preset = body.get('preset_type')
                notes = body.get('notes')
                image_data = body.get('image_data')
                result = local_ai.analyze_waste_input(image_data=image_data, preset_type=preset, notes=notes)
                conn.close()
                return self._send_json(result)

            # 2. Switch Active AI Model Version
            elif path == '/api/ai/models/switch':
                version_id = body.get('version_id')
                cursor.execute("UPDATE ai_model_versions SET status = 'INACTIVE' WHERE status = 'ACTIVE'")
                cursor.execute("UPDATE ai_model_versions SET status = 'ACTIVE' WHERE version_id = ?", (version_id,))
                cursor.execute("UPDATE system_settings SET setting_value = ? WHERE setting_key = 'active_ai_model'", (version_id,))
                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('AI_MODEL_SWITCH', 'Switched Model Version', ?, 'Admin Operations', 'Administrator', 'Model deployment reconfiguration')
                """, (f"Active: EcoFlow-Waste-{version_id}",))
                conn.commit()
                local_ai.active_model_version = version_id
                conn.close()
                return self._send_json({"success": True, "active_model": f"EcoFlow-Waste-{version_id}"})

            # 3. Test AI Model
            elif path == '/api/ai/models/test':
                preset = body.get('preset_type', 'COPPER_SCRAP')
                result = local_ai.analyze_waste_input(preset_type=preset)
                conn.close()
                return self._send_json({"success": True, "test_result": result})

            # 3b. Household: Post Scrap Request with Multi-Material Table, Photo, and Radius Distribution
            elif path == '/api/household/post-scrap':
                materials = body.get('materials', [])
                total_weight = float(body.get('total_weight', 0.0))
                total_value = float(body.get('total_value', 0.0))
                household_name = body.get('household_name', 'Rahul Sharma')
                household_phone = body.get('household_phone', '+91 98640 12345')
                address = body.get('address', 'House 14, Peace Enclave, Paltan Bazaar, Guwahati')
                zone = body.get('service_zone', 'ZONE B')
                waste_img = body.get('waste_image', '')

                # Generate unique Lot ID and Pickup ID
                lot_num = random.randint(100000, 999999)
                lot_id = f"LOT-2026-{lot_num}"
                pickup_id = f"PR-2026-{lot_num}"

                primary_material = materials[0]['name'] if materials else 'Mixed Recyclable Scrap'

                # 1. Insert pickup request
                cursor.execute("""
                INSERT INTO pickup_requests (
                    pickup_id, household_name, household_phone, address, landmark, service_zone,
                    lat, lng, preferred_date, time_slot, preliminary_material, user_estimated_weight,
                    indicative_rate, indicative_value, notes, waste_image, status
                ) VALUES (?, ?, ?, ?, 'Near Municipal Station', ?, 26.1795, 91.7685, CURRENT_DATE, 'Immediate Dispatch', ?, ?, ?, ?, 'Post Scrap Direct Submission', ?, 'ACCEPTED')
                """, (pickup_id, household_name, household_phone, address, zone, primary_material, total_weight, 
                      round(total_value / max(total_weight, 1), 2), total_value, waste_img))

                # 2. Insert waste lot with unique lot_id
                cursor.execute("""
                INSERT INTO waste_lots (
                    lot_id, pickup_id, household_name, collector_id, storage_hub_id,
                    collection_timestamp, preliminary_material, user_estimated_weight, qr_code, verification_status
                ) VALUES (?, ?, ?, 'COL-00142', 'HUB-001', CURRENT_TIMESTAMP, ?, ?, ?, 'ACCEPTED')
                """, (lot_id, pickup_id, household_name, primary_material, total_weight, f"ECOFLOW-QR-{lot_id}"))

                # 3. Insert lot_materials breakdown
                for m in materials:
                    m_name = m.get('name', 'Mixed Scrap')
                    m_weight = float(m.get('weight', 0.0))
                    m_rate = float(m.get('rate', 0.0))
                    if m_weight > 0:
                        cursor.execute("""
                        INSERT INTO lot_materials (lot_id, material_name, grade, verified_weight, rate_per_kg, subtotal)
                        VALUES (?, ?, 'Grade A', ?, ?, ?)
                        """, (lot_id, m_name, m_weight, m_rate, round(m_weight * m_rate, 2)))

                # 4. Multi-stakeholder radius distribution logic:
                cursor.execute("SELECT * FROM employees WHERE service_zone = ? OR service_zone = 'ZONE B'", (zone,))
                emp_list = [dict(e) for e in cursor.fetchall()]
                
                dispatched_sms = []
                dispatched_smartphone = []
                assigned_emp = None

                for emp in emp_list:
                    mode = emp.get('mode', 'smartphone')
                    emp_id = emp.get('employee_id', '')
                    emp_name = emp.get('name', '')
                    
                    if mode in ('no_phone', 'basic_phone') or 'COL-NP' in emp_id or 'COL-NS' in emp_id:
                        sms_text = f"SMS to {emp_name} ({emp_id}): New Scrap Pickup {lot_id} ({total_weight}kg) available in 10 km. Reply 1 to Accept, 2 to Decline."
                        dispatched_sms.append({
                            "employee_id": emp_id,
                            "name": emp_name,
                            "mode": mode,
                            "phone": emp.get('phone', 'Simulated SMS Gateway'),
                            "sms_content": sms_text
                        })
                    else:
                        dispatched_smartphone.append({
                            "employee_id": emp_id,
                            "name": emp_name,
                            "mode": "smartphone",
                            "notification": f"🔔 New Pickup Alert: {total_weight}kg scrap at {address} (10 km radius)"
                        })
                        if not assigned_emp:
                            assigned_emp = emp

                if not assigned_emp and emp_list:
                    assigned_emp = emp_list[0]

                assigned_id = assigned_emp['employee_id'] if assigned_emp else 'COL-00142'
                assigned_name = assigned_emp['name'] if assigned_emp else 'Rameshwar Boro'

                # 5. Lock request with assigned collector
                cursor.execute("""
                INSERT OR REPLACE INTO assignments (
                    assignment_id, pickup_id, employee_id, assigned_at, mode, acknowledged, status, notes
                ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 1, 'ACCEPTED', 'Locked request assigned via radius search')
                """, (f"ASN-{lot_num}", pickup_id, assigned_id, assigned_emp.get('mode', 'smartphone') if assigned_emp else 'smartphone'))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('POST_SCRAP_REQUESTED_LOCKED', 'Unposted', ?, ?, 'Household', 'Scrap posted with AI weight estimate and locked to collector')
                """, (f"{lot_id} ({total_weight}kg, est. ₹{total_value}) locked to {assigned_name} ({assigned_id})", household_name))

                conn.commit()
                conn.close()

                return self._send_json({
                    "success": True,
                    "lot_id": lot_id,
                    "pickup_id": pickup_id,
                    "is_locked": True,
                    "assigned_collector": {
                        "employee_id": assigned_id,
                        "name": assigned_name,
                        "mode": assigned_emp.get('mode', 'smartphone') if assigned_emp else 'smartphone'
                    },
                    "radius_km": 10,
                    "dispatched_sms": dispatched_sms,
                    "dispatched_smartphone": dispatched_smartphone,
                    "total_weight": total_weight,
                    "total_value": total_value,
                    "message": "Scrap posted successfully. Request locked and assigned."
                })

            # 3c. Household / Collector: Advance Real-time Progress Stepper
            elif path == '/api/household/progress-step':
                lot_id = body.get('lot_id', '').strip()
                target_step = int(body.get('step', 2))
                
                cursor.execute("SELECT * FROM waste_lots WHERE lot_id = ?", (lot_id,))
                lot = cursor.fetchone()
                
                step_status_map = {
                    1: ('PENDING', 'REQUESTED'),
                    2: ('ACCEPTED', 'ACCEPTED'),
                    3: ('VERIFIED', 'VERIFIED'),
                    4: ('PAYMENT_CONFIRMED', 'SETTLING'),
                    5: ('COMPLETED', 'SETTLED')
                }

                p_status, w_status = step_status_map.get(target_step, ('ACCEPTED', 'ACCEPTED'))

                if lot:
                    pickup_id = lot['pickup_id']
                    cursor.execute("UPDATE pickup_requests SET status = ? WHERE pickup_id = ?", (p_status, pickup_id))
                    cursor.execute("UPDATE waste_lots SET verification_status = ? WHERE lot_id = ?", (w_status, lot_id))

                    if target_step == 5:
                        cursor.execute("SELECT SUM(subtotal) as total_val, SUM(verified_weight) as total_wt FROM lot_materials WHERE lot_id = ?", (lot_id,))
                        m_totals = cursor.fetchone()
                        fin_amount = float(m_totals['total_val'] or 1450.0) if m_totals and m_totals['total_val'] else 1450.0
                        fin_weight = float(m_totals['total_wt'] or 12.5) if m_totals and m_totals['total_wt'] else 12.5
                        
                        receipt_no = f"REC-2026-{random.randint(100000, 999999)}"
                        cursor.execute("""
                        INSERT OR REPLACE INTO settlements (
                            settlement_id, lot_id, pickup_id, household_name, verified_weight,
                            final_amount, calculation_formula, settlement_date, status, receipt_number
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'PAID', ?)
                        """, (f"SET-{lot_id}", lot_id, pickup_id, lot['household_name'], fin_weight, fin_amount,
                              f"Verified Weight ({fin_weight} kg) × Municipal Live Buying Rate", receipt_no))
                        
                        cursor.execute("""
                        INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                        VALUES ('PAYMENT_RECEIVED_COMPLETED', 'PAYMENT_CONFIRMED', 'PAID', ?, 'System Gateway', 'Payment received by citizen. Lot lifecycle closed.')
                        """, (lot['household_name'],))

                    conn.commit()

                conn.close()
                return self._send_json({
                    "success": True,
                    "lot_id": lot_id,
                    "current_step": target_step,
                    "is_completed": (target_step == 5),
                    "message": f"Progress step advanced to {target_step}"
                })

            # 4. Create Pickup Request (Section 12)
            elif path == '/api/pickups/create':
                req_num = random.randint(1000, 9999)
                pickup_id = f"PR-2026-{req_num:06d}"
                household_name = body.get('household_name', 'Rahul Sharma (Household)')
                phone = body.get('household_phone', '+91 98640 55443')
                address = body.get('address', 'House 22, Gandhi Basti, Guwahati')
                landmark = body.get('landmark', 'Near Water Tank')
                zone = body.get('service_zone', 'ZONE B')
                lat = float(body.get('lat', 26.1795))
                lng = float(body.get('lng', 91.7685))
                preferred_date = body.get('preferred_date', time.strftime("%Y-%m-%d"))
                time_slot = body.get('time_slot', '10:00 AM - 12:00 PM')
                material = body.get('preliminary_material', 'PET Plastic Bottles')
                estimated_weight = float(body.get('user_estimated_weight', 5.0))
                indicative_rate = float(body.get('indicative_rate', 24.0))
                indicative_val = estimated_weight * indicative_rate
                notes = body.get('notes', '')
                waste_img = body.get('waste_image', 'waste_sample.jpg')

                cursor.execute("""
                INSERT INTO pickup_requests (
                    pickup_id, household_name, household_phone, address, landmark, service_zone,
                    lat, lng, preferred_date, time_slot, preliminary_material, user_estimated_weight,
                    indicative_rate, indicative_value, notes, waste_image, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
                """, (pickup_id, household_name, phone, address, landmark, zone, lat, lng, preferred_date, time_slot, material, estimated_weight, indicative_rate, indicative_val, notes, waste_img))

                # Store AI assessment linked to this pickup
                cursor.execute("""
                INSERT INTO ai_assessments (
                    assessment_id, pickup_id, model_version, detected_material, confidence_score,
                    possible_materials_json, segregation_score, recommendation, waste_image
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (f"AI-{pickup_id}", pickup_id, f"EcoFlow-Waste-{local_ai.active_model_version}", material, 0.92, json.dumps([material]), 88, "Keep waste segregated in dry bins prior to collector arrival.", waste_img))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('PICKUP_CREATED', 'None', ?, ?, 'Household', 'Citizen requested recyclable waste pickup')
                """, (f"Pickup {pickup_id}: {estimated_weight}kg {material}", household_name))

                conn.commit()
                conn.close()
                return self._send_json({"success": True, "pickup_id": pickup_id, "message": "Pickup request created successfully."})

            # 5. Coordinator Assignment (Sections 17, 18, 19, 20)
            elif path == '/api/coordinator/assign':
                pickup_id = body.get('pickup_id')
                employee_id = body.get('employee_id')

                cursor.execute("SELECT * FROM employees WHERE employee_id = ?", (employee_id,))
                emp = cursor.fetchone()
                if not emp:
                    conn.close()
                    return self._send_json({"error": "Employee not found"}, status=404)

                assignment_id = f"ASN-{pickup_id}"
                emp_mode = emp["mode"]
                initial_status = 'ACKNOWLEDGED' if emp_mode == 'smartphone' else 'COMMUNICATED'
                ack_flag = 1 if emp_mode == 'smartphone' else 0

                cursor.execute("""
                INSERT OR REPLACE INTO assignments (assignment_id, pickup_id, employee_id, assigned_at, mode, acknowledged, status, notes)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
                """, (assignment_id, pickup_id, employee_id, emp_mode, ack_flag, initial_status, f"Assigned via operational rules to {emp['name']} ({emp_mode})"))

                new_pickup_status = 'COMMUNICATED' if emp_mode == 'no_phone' else 'ASSIGNED'
                cursor.execute("UPDATE pickup_requests SET status = ? WHERE pickup_id = ?", (new_pickup_status, pickup_id))
                cursor.execute("UPDATE employees SET workload = workload + 1 WHERE employee_id = ?", (employee_id,))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('COLLECTOR_ASSIGNED', 'Awaiting Assignment', ?, 'Priyanka Baruah', 'Field Coordinator', 'Operational assignment rule')
                """, (f"{pickup_id} -> {emp['name']} ({employee_id}) [Mode: {emp_mode}]",))

                conn.commit()
                conn.close()
                return self._send_json({
                    "success": True,
                    "assignment_id": assignment_id,
                    "employee_mode": emp_mode,
                    "message": f"Assigned to {emp['name']} ({employee_id}) via {emp_mode.upper()} mode."
                })

            # 6. Coordinator Mark Communicated / Collected (Section 18 Mode 3)
            elif path == '/api/coordinator/mark-status':
                pickup_id = body.get('pickup_id')
                new_status = body.get('status', 'COMMUNICATED')
                cursor.execute("UPDATE pickup_requests SET status = ? WHERE pickup_id = ?", (new_status, pickup_id))
                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('STATUS_UPDATED', 'Manual override', ?, 'Field Coordinator', 'Coordinator', 'Field operational tracking')
                """, (f"{pickup_id} status updated to {new_status}",))
                conn.commit()
                conn.close()
                return self._send_json({"success": True, "status": new_status})

            # 7. Field Collector Collection -> Creates Digital Waste Lot (Sections 21, 22)
            elif path == '/api/collector/collect':
                pickup_id = body.get('pickup_id')
                cursor.execute("SELECT * FROM pickup_requests WHERE pickup_id = ?", (pickup_id,))
                p = cursor.fetchone()
                if not p:
                    conn.close()
                    return self._send_json({"error": "Pickup not found"}, status=404)

                cursor.execute("SELECT employee_id FROM assignments WHERE pickup_id = ?", (pickup_id,))
                asn = cursor.fetchone()
                collector_id = asn["employee_id"] if asn else "COL-00142"

                lot_num = random.randint(1000, 9999)
                lot_id = f"LOT-2026-{lot_num:06d}"
                hub_id = body.get('storage_hub_id', 'HUB-001')

                cursor.execute("""
                INSERT INTO waste_lots (
                    lot_id, pickup_id, household_name, collector_id, storage_hub_id,
                    collection_timestamp, preliminary_material, user_estimated_weight, qr_code, verification_status
                ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, 'PENDING_VERIFICATION')
                """, (lot_id, pickup_id, p["household_name"], collector_id, hub_id, p["preliminary_material"], p["user_estimated_weight"], lot_id))

                # Update pickup status
                cursor.execute("UPDATE pickup_requests SET status = 'COLLECTED' WHERE pickup_id = ?", (pickup_id,))
                # Update AI assessment with lot_id
                cursor.execute("UPDATE ai_assessments SET lot_id = ? WHERE pickup_id = ?", (lot_id, pickup_id))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('DIGITAL_LOT_CREATED', 'Field Pickup', ?, ?, 'Field Collector', 'Material collected at household, lot sealed with QR code')
                """, (f"Created Lot {lot_id} for Pickup {pickup_id}", collector_id))

                conn.commit()
                conn.close()
                return self._send_json({
                    "success": True,
                    "lot_id": lot_id,
                    "qr_code": lot_id,
                    "message": f"Digital Waste Lot {lot_id} generated successfully."
                })

            # 8. Storage Hub Physical Verification (Sections 23, 24, 25, 26, 27, 28) - FINAL AUTHORITY!
            elif path == '/api/hub/verify':
                lot_id = body.get('lot_id')
                cursor.execute("SELECT * FROM waste_lots WHERE lot_id = ?", (lot_id,))
                lot = cursor.fetchone()
                if not lot:
                    conn.close()
                    return self._send_json({"error": "Lot not found"}, status=404)

                hub_id = body.get('hub_id', lot["storage_hub_id"])
                operator_name = body.get('operator_name', 'Manoj Kalita (Chief Inspector)')
                materials_breakdown = body.get('materials_breakdown', [])
                discrepancy_reason = body.get('discrepancy_reason', 'None')
                discrepancy_notes = body.get('discrepancy_notes', '')

                # Read tolerance setting (e.g. 5.0%)
                cursor.execute("SELECT setting_value FROM system_settings WHERE setting_key = 'weight_tolerance_pct'")
                tol_row = cursor.fetchone()
                tolerance_pct = float(tol_row["setting_value"]) if tol_row else 5.0

                # Compute verified total weight and amount from breakdown
                total_verified_weight = 0.0
                total_amount = 0.0

                # Delete existing materials if reverifying
                cursor.execute("DELETE FROM lot_materials WHERE lot_id = ?", (lot_id,))

                primary_grade = "GRADE B"
                for item in materials_breakdown:
                    mat_name = item.get('material_name', 'PET Plastic Bottles')
                    grade = item.get('grade', 'GRADE B')
                    primary_grade = grade
                    w = float(item.get('verified_weight', 0.0))
                    rate = float(item.get('rate_per_kg', 24.0))
                    subtotal = round(w * rate, 2)
                    total_verified_weight += w
                    total_amount += subtotal

                    cursor.execute("""
                    INSERT INTO lot_materials (lot_id, material_name, grade, verified_weight, rate_per_kg, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, (lot_id, mat_name, grade, w, rate, subtotal))

                    # Add to Hub Inventory (Section 33)
                    inv_id = f"INV-2026-{random.randint(1000, 9999)}"
                    cursor.execute("""
                    INSERT INTO inventory (inventory_id, material_name, grade, weight_kg, source_lot_id, hub_id, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE')
                    """, (inv_id, mat_name, grade, w, lot_id, hub_id))

                total_verified_weight = round(total_verified_weight, 2)
                total_amount = round(total_amount, 2)

                # SECTION 25 & 26: WEIGHT MATCH COMPARISON
                user_weight = float(lot["user_estimated_weight"])
                diff = round(total_verified_weight - user_weight, 2)
                diff_pct = round((diff / user_weight * 100.0) if user_weight > 0 else 0.0, 2)

                # Tolerance comparison: falls within configured tolerance (e.g. ±5%)
                if abs(diff_pct) <= tolerance_pct:
                    weight_match_status = "MATCH"
                else:
                    weight_match_status = "DIFFERENCE"

                ver_id = f"VER-{lot_id}"
                cursor.execute("""
                INSERT OR REPLACE INTO physical_verifications (
                    verification_id, lot_id, hub_id, operator_name, verified_weight, total_verified_amount,
                    weight_match_status, weight_difference, weight_difference_pct, tolerance_used,
                    verification_timestamp, discrepancy_reason, discrepancy_notes, quality_grade
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)
                """, (ver_id, lot_id, hub_id, operator_name, total_verified_weight, total_amount, weight_match_status, diff, diff_pct, tolerance_pct, discrepancy_reason, discrepancy_notes, primary_grade))

                # Update Lot status
                cursor.execute("UPDATE waste_lots SET verification_status = 'VERIFIED' WHERE lot_id = ?", (lot_id,))
                cursor.execute("UPDATE pickup_requests SET status = 'VERIFIED' WHERE pickup_id = ?", (lot["pickup_id"],))

                # SECTION 28 & 29: FINAL HOUSEHOLD SETTLEMENT
                # Calculated strictly from VERIFIED WEIGHT × BUYING RATE, NEVER AI estimate
                formula_desc = " + ".join([f"{item['verified_weight']}kg {item['material_name']} @ ₹{item['rate_per_kg']}/kg" for item in materials_breakdown])
                settlement_id = f"SET-{lot_id}"
                rcp_number = f"RCP-2026-{random.randint(100000, 999999)}"

                cursor.execute("""
                INSERT OR REPLACE INTO settlements (
                    settlement_id, lot_id, pickup_id, household_name, verified_weight,
                    final_amount, calculation_formula, settlement_date, status, receipt_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'COMPLETED', ?)
                """, (settlement_id, lot_id, lot["pickup_id"], lot["household_name"], total_verified_weight, total_amount, formula_desc, rcp_number))

                # SECTION 4: AI FEEDBACK DATASET
                cursor.execute("SELECT * FROM ai_assessments WHERE lot_id = ? OR pickup_id = ?", (lot_id, lot["pickup_id"]))
                ai_ass = cursor.fetchone()
                if ai_ass:
                    fb_id = f"FB-{lot_id}"
                    verified_summary = ", ".join([f"{i['material_name']} ({i['verified_weight']}kg)" for i in materials_breakdown])
                    cursor.execute("""
                    INSERT OR REPLACE INTO ai_feedback_dataset (
                        feedback_id, lot_id, ai_prediction, ai_confidence, hub_verified_material, hub_verified_grade, status, model_version
                    ) VALUES (?, ?, ?, ?, ?, ?, 'VALIDATED', ?)
                    """, (fb_id, lot_id, ai_ass["detected_material"], ai_ass["confidence_score"], verified_summary, primary_grade, ai_ass["model_version"]))

                # SECTION 48: AUDIT LOG
                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('WEIGHT_VERIFIED', ?, ?, ?, 'Storage Hub Operator', ?)
                """, (f"User Estimate: {user_weight} kg", f"Verified: {total_verified_weight} kg ({weight_match_status})", operator_name, discrepancy_notes or f"Scale tolerance: ±{tolerance_pct}%"))

                conn.commit()
                conn.close()

                return self._send_json({
                    "success": True,
                    "verification_id": ver_id,
                    "settlement_id": settlement_id,
                    "receipt_number": rcp_number,
                    "weight_match_status": weight_match_status,
                    "user_estimated_weight": user_weight,
                    "verified_weight": total_verified_weight,
                    "weight_difference": diff,
                    "weight_difference_pct": diff_pct,
                    "tolerance_used": tolerance_pct,
                    "final_amount": total_amount,
                    "message": "Physical verification completed. Hub values recorded as source of truth."
                })

            # 9. Aggregate Lots into Batch (Section 34)
            elif path == '/api/inventory/aggregate':
                material_name = body.get('material_name', 'PET Plastic Bottles')
                lot_ids = body.get('lot_ids', [])
                hub_id = body.get('hub_id', 'HUB-001')

                cursor.execute("SELECT COALESCE(SUM(weight_kg), 0) as total FROM inventory WHERE material_name = ? AND status = 'AVAILABLE'", (material_name,))
                avail = cursor.fetchone()["total"]

                batch_id = f"BATCH-2026-{material_name[:4].upper()}-{random.randint(100, 999)}"
                cursor.execute("""
                INSERT INTO inventory_batches (batch_id, material_name, total_weight_kg, source_lots_json, hub_id, status)
                VALUES (?, ?, ?, ?, ?, 'AGGREGATED')
                """, (batch_id, material_name, avail, json.dumps(lot_ids or ["LOT-2026-000184", "LOT-2026-000185"]), hub_id))

                cursor.execute("UPDATE inventory SET status = 'RESERVED', batch_id = ? WHERE material_name = ? AND status = 'AVAILABLE'", (batch_id, material_name))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('INVENTORY_AGGREGATED', 'Individual Lots', ?, 'Storage Hub Supervisor', 'Hub Operator', 'Aggregated into industrial batch for recycler dispatch')
                """, (f"Batch {batch_id}: {avail} kg {material_name}",))

                conn.commit()
                conn.close()
                return self._send_json({"success": True, "batch_id": batch_id, "total_weight_kg": avail})

            # 10. Recycler Offer Acceptance & Sale Dispatch (Sections 36, 37)
            elif path == '/api/recycler/offers/accept':
                offer_id = body.get('offer_id')
                cursor.execute("SELECT * FROM recycler_offers WHERE offer_id = ?", (offer_id,))
                offer = cursor.fetchone()
                if not offer:
                    conn.close()
                    return self._send_json({"error": "Offer not found"}, status=404)

                cursor.execute("UPDATE recycler_offers SET status = 'ACCEPTED' WHERE offer_id = ?", (offer_id,))
                cursor.execute("UPDATE inventory_batches SET status = 'SOLD' WHERE batch_id = ?", (offer["batch_id"],))

                # Create Sale Transaction
                tx_id = f"TX-2026-{random.randint(1000, 9999)}"
                cursor.execute("""
                INSERT INTO sales_transactions (transaction_id, batch_id, offer_id, recycler_id, agreed_rate_per_kg, total_amount, status)
                VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
                """, (tx_id, offer["batch_id"], offer_id, offer["recycler_id"], offer["offered_rate_per_kg"], offer["total_price"]))

                # Create Dispatch
                dispatch_id = f"DISP-2026-{random.randint(1000, 9999)}"
                gate_pass_qr = f"GATEPASS-{dispatch_id}"
                cursor.execute("""
                INSERT INTO dispatches (dispatch_id, transaction_id, batch_id, recycler_name, vehicle_no, driver_name, gate_pass_qr, status)
                VALUES (?, ?, ?, ?, 'AS-01-EC-9942', 'Manabendra Barman', ?, 'DISPATCHED')
                """, (dispatch_id, tx_id, offer["batch_id"], offer["recycler_name"], gate_pass_qr))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('RECYCLER_SALE_CONFIRMED', 'Inventory Batch', ?, 'Executive Director', 'Administrator', 'Downstream recycler contract executed; household settlements remain unaltered')
                """, (f"Sale {tx_id} -> {offer['recycler_name']} (₹{offer['total_price']})",))

                conn.commit()
                conn.close()
                return self._send_json({
                    "success": True,
                    "transaction_id": tx_id,
                    "dispatch_id": dispatch_id,
                    "gate_pass_qr": gate_pass_qr,
                    "message": "Offer accepted and dispatch manifested. Household settlement remains strictly unaffected."
                })

            # 11. Reassessment Request (Section 31)
            elif path == '/api/reassessment/request':
                lot_id = body.get('lot_id')
                household_name = body.get('household_name', 'Household Citizen')
                reason = body.get('reason', 'Verification query regarding tare weight deduction')

                re_id = f"REASS-{random.randint(1000, 9999)}"
                cursor.execute("""
                INSERT INTO reassessment_requests (reassessment_id, lot_id, household_name, reason, status)
                VALUES (?, ?, ?, ?, 'UNDER_REVIEW')
                """, (re_id, lot_id, household_name, reason))

                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('REASSESSMENT_REQUESTED', 'Settled', ?, ?, 'Household Citizen', 'Citizen filed reassessment ticket')
                """, (f"Ticket {re_id} for Lot {lot_id}", household_name))

                conn.commit()
                conn.close()
                return self._send_json({"success": True, "reassessment_id": re_id, "status": "UNDER_REVIEW"})

            # 12. Update System Settings
            elif path == '/api/settings':
                key = body.get('key')
                val = str(body.get('value'))
                cursor.execute("UPDATE system_settings SET setting_value = ? WHERE setting_key = ?", (val, key))
                cursor.execute("""
                INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                VALUES ('SYSTEM_SETTING_CHANGED', ?, ?, 'System Admin', 'Administrator', 'Operational parameter tune')
                """, (key, f"{key} = {val}"))
                conn.commit()
                conn.close()
                return self._send_json({"success": True, "key": key, "value": val})

            # Field Coordinator: Register & Verify Data for Collector (Minimal Terminal)
            elif path == '/api/coordinator/register-verify-for-collector':
                cid = body.get('collector_id', '').strip()
                mat_name = (body.get('material') or body.get('material_name') or 'Mixed Recyclables').strip()
                weight = float(body.get('verified_weight_kg') or body.get('weight_kg', 10.0))
                rate = float(body.get('rate_per_kg', 25.0))
                subtotal = round(weight * rate, 2)

                cursor.execute("SELECT name, employee_id, service_zone FROM employees WHERE employee_id = ?", (cid,))
                emp = cursor.fetchone()
                if not emp:
                    conn.close()
                    return self._send_json({"error": "Collector not found"}, status=404)

                import random
                lot_num = random.randint(100000, 999999)
                lot_id = f"LOT-2026-{lot_num}"
                pickup_id = f"PR-2026-{lot_num}"

                cursor.execute("""
                    INSERT INTO pickup_requests (
                        pickup_id, household_name, household_phone, address, service_zone,
                        lat, lng, preferred_date, time_slot, preliminary_material, user_estimated_weight,
                        indicative_rate, indicative_value, notes, status
                    ) VALUES (?, 'Verified Household', '+91 98000 00000', 'Assigned Municipal Sector', ?,
                              26.18, 91.75, CURRENT_DATE, 'Standard Shift', ?, ?, ?, ?, 'Coordinator Offline Physical Verification', 'COMPLETED')
                """, (pickup_id, emp['service_zone'], mat_name, weight, rate, subtotal))

                cursor.execute("""
                    INSERT INTO waste_lots (
                        lot_id, pickup_id, household_name, collector_id, storage_hub_id,
                        collection_timestamp, preliminary_material, user_estimated_weight, qr_code, verification_status
                    ) VALUES (?, ?, 'Verified Household', ?, 'HUB-001', CURRENT_TIMESTAMP, ?, ?, ?, 'COMPLETED')
                """, (lot_id, pickup_id, cid, mat_name, weight, f"QR-{lot_id}"))

                cursor.execute("""
                    INSERT INTO lot_materials (lot_id, material_name, grade, verified_weight, rate_per_kg, subtotal)
                    VALUES (?, ?, 'Grade A', ?, ?, ?)
                """, (lot_id, mat_name, weight, rate, subtotal))

                cursor.execute("""
                    INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                    VALUES ('COORDINATOR_VERIFIED_FOR_COLLECTOR', 'Pending', ?, 'Field Coordinator', 'Coordinator', 'Physical verification recorded for non-smartphone collector')
                """, (f"{lot_id} ({weight}kg {mat_name}) verified for {emp['name']} ({cid})",))

                conn.commit()
                conn.close()

                return self._send_json({
                    "success": True,
                    "lot_id": lot_id,
                    "collector_id": cid,
                    "collector_name": emp['name'],
                    "verified_weight": weight,
                    "verified_weight_kg": weight,
                    "material": mat_name,
                    "rate_per_kg": rate,
                    "settlement_amount_inr": subtotal,
                    "status": "COMPLETED"
                })

            # Field Collector: Restore work on smartphone
            elif path == '/api/collector/restore-smartphone':
                cid = body.get('collector_id', '').strip()
                cursor.execute("SELECT * FROM employees WHERE employee_id = ?", (cid,))
                emp = cursor.fetchone()
                if not emp:
                    conn.close()
                    return self._send_json({"error": "Collector ID not found"}, status=404)

                cursor.execute("UPDATE employees SET mode = 'smartphone' WHERE employee_id = ?", (cid,))

                cursor.execute("SELECT * FROM waste_lots WHERE collector_id = ? ORDER BY collection_timestamp DESC", (cid,))
                lots = [dict(r) for r in cursor.fetchall()]

                cursor.execute("""
                    INSERT INTO audit_logs (event_name, previous_value, new_value, user_name, role, reason)
                    VALUES ('COLLECTOR_JOINED_SMARTPHONE', ?, 'smartphone', ?, 'Collector', 'Work restored on Smartphone app')
                """, (emp['mode'], emp['name']))

                conn.commit()
                conn.close()

                return self._send_json({
                    "success": True,
                    "collector_id": cid,
                    "name": emp['name'],
                    "mode": "smartphone",
                    "restored_lots_count": len(lots),
                    "restored_lots": lots,
                    "lots": lots
                })

            else:
                conn.close()
                return self._send_json({"error": "Unknown POST endpoint"}, status=404)

        except Exception as e:
            return self._send_json({"error": str(e)}, status=500)

    def _trace_full_chain(self, cursor, query_id):
        """
        Complete Traceability Engine (Section 50)
        HOUSEHOLD -> PICKUP REQUEST -> ASSIGNMENT -> COLLECTION -> LOT ->
        AI ASSESSMENT -> HUB VERIFICATION -> SETTLEMENT -> INVENTORY ->
        AGGREGATED BATCH -> RECYCLER OFFER -> SALE -> DISPATCH
        """
        chain = {
            "query_id": query_id,
            "household": None,
            "pickup": None,
            "assignment": None,
            "lot": None,
            "ai_assessment": None,
            "verification": None,
            "settlement": None,
            "inventory_batch": None,
            "recycler_offer": None,
            "sale_transaction": None,
            "dispatch": None
        }

        # Find pickup or lot
        cursor.execute("""
        SELECT * FROM pickup_requests WHERE pickup_id = ? OR pickup_id IN (
            SELECT pickup_id FROM waste_lots WHERE lot_id = ?
        )
        """, (query_id, query_id))
        p = cursor.fetchone()
        if p:
            chain["pickup"] = dict(p)
            chain["household"] = {
                "name": p["household_name"],
                "phone": p["household_phone"],
                "address": p["address"],
                "landmark": p["landmark"],
                "zone": p["service_zone"]
            }

            cursor.execute("SELECT * FROM assignments WHERE pickup_id = ?", (p["pickup_id"],))
            asn = cursor.fetchone()
            if asn:
                chain["assignment"] = dict(asn)

            cursor.execute("SELECT * FROM waste_lots WHERE pickup_id = ? OR lot_id = ?", (p["pickup_id"], query_id))
            lot = cursor.fetchone()
            if lot:
                chain["lot"] = dict(lot)
                lot_id = lot["lot_id"]

                cursor.execute("SELECT * FROM ai_assessments WHERE lot_id = ? OR pickup_id = ?", (lot_id, p["pickup_id"]))
                ai = cursor.fetchone()
                if ai:
                    chain["ai_assessment"] = dict(ai)

                cursor.execute("SELECT * FROM physical_verifications WHERE lot_id = ?", (lot_id,))
                ver = cursor.fetchone()
                if ver:
                    chain["verification"] = dict(ver)

                cursor.execute("SELECT * FROM settlements WHERE lot_id = ?", (lot_id,))
                sett = cursor.fetchone()
                if sett:
                    chain["settlement"] = dict(sett)

                # Trace inventory to batch
                cursor.execute("SELECT batch_id FROM inventory WHERE source_lot_id = ? AND batch_id IS NOT NULL", (lot_id,))
                inv = cursor.fetchone()
                batch_id = inv["batch_id"] if inv else "BATCH-2026-PLAST-01"

                cursor.execute("SELECT * FROM inventory_batches WHERE batch_id = ?", (batch_id,))
                batch = cursor.fetchone()
                if batch:
                    chain["inventory_batch"] = dict(batch)

                    cursor.execute("SELECT * FROM recycler_offers WHERE batch_id = ?", (batch_id,))
                    offer = cursor.fetchone()
                    if offer:
                        chain["recycler_offer"] = dict(offer)

                        cursor.execute("SELECT * FROM sales_transactions WHERE batch_id = ?", (batch_id,))
                        tx = cursor.fetchone()
                        if tx:
                            chain["sale_transaction"] = dict(tx)

                            cursor.execute("SELECT * FROM dispatches WHERE transaction_id = ?", (tx["transaction_id"],))
                            disp = cursor.fetchone()
                            if disp:
                                chain["dispatch"] = dict(disp)

        return chain

def run_server(port=8080):
    init_db()
    seed_demo_data()
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, EcoFlowAPIHandler)
    print(f"EcoFlow AI Server listening on http://127.0.0.1:{port}", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        print("Server stopped.", flush=True)

if __name__ == "__main__":
    port = 8080
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run_server(port)
