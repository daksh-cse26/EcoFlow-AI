import json
import urllib.request

def verify_all():
    base = "http://127.0.0.1:8088"
    
    print("--- 1. Testing HTML and Bypass Navigation ---", flush=True)
    with urllib.request.urlopen(f"{base}/", timeout=5) as resp:
        html = resp.read().decode('utf-8')
        assert "bypass-interface-nav" in html, "Missing bypass-interface-nav"
        assert "portal-gateway-screen" in html, "Missing portal-gateway-screen"
        assert "btn-cmd-center" in html, "Missing Command Center button"
        print(f"  ✓ HTML loaded successfully ({len(html)} bytes)")
        print("  ✓ Bypass navigation bar present in DOM")

    print("\n--- 2. Testing Static JS Assets ---", flush=True)
    for js_file in ['auth.js', 'app.js', 'i18n.js']:
        with urllib.request.urlopen(f"{base}/js/{js_file}", timeout=5) as resp:
            content = resp.read().decode('utf-8')
            print(f"  ✓ /js/{js_file} loaded ({len(content)} bytes)")

    print("\n--- 3. Testing Auth API Bypass (All 6 Roles) ---", flush=True)
    roles = ['household', 'coordinator', 'collector', 'hub', 'recycler', 'admin']
    for role in roles:
        req = urllib.request.Request(
            f"{base}/api/auth/register-login",
            data=json.dumps({"role": role, "name": f"Direct {role.capitalize()}"}).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            assert data.get("success") is True, f"Failed for {role}"
            print(f"  ✓ Role '{role}': Direct Login Successful (User: {data['user']['name']}, Role: {data['user']['role']})")

    print("\n--- 4. Testing Command Center Data APIs (No Auth Barrier) ---", flush=True)
    for endpoint in ['/api/auth/whitelist', '/api/auth/registry', '/api/admin/coordinators']:
        with urllib.request.urlopen(f"{base}{endpoint}", timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"  ✓ Endpoint '{endpoint}' accessible: HTTP {resp.status}")

    print("\n🎉 ALL VERIFICATION CHECKS PASSED: Full bypass active across all 6 portals!", flush=True)

if __name__ == '__main__':
    verify_all()
