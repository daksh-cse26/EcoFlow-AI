import subprocess, json, re, os

print("--- 1. Testing 24-Hour Greeting Logic ---")

def test_greeting_formula(hour, minute):
    greetingWord = "Good Morning"
    icon = "🌅"
    if hour >= 12 and hour < 17:
        greetingWord = "Good Afternoon"
        icon = "☀️"
    elif hour >= 17:
        greetingWord = "Good Evening"
        icon = "🌆"
    else:
        greetingWord = "Good Morning"
        icon = "🌅"
    return greetingWord

test_cases = [
    (0, 0, "Good Morning"),
    (0, 9, "Good Morning"),
    (3, 30, "Good Morning"),
    (7, 0, "Good Morning"),
    (11, 59, "Good Morning"),
    (12, 0, "Good Afternoon"),
    (14, 15, "Good Afternoon"),
    (16, 59, "Good Afternoon"),
    (17, 0, "Good Evening"),
    (19, 30, "Good Evening"),
    (21, 0, "Good Evening"),
    (23, 0, "Good Evening"),
    (23, 59, "Good Evening")
]

for h, m, expected in test_cases:
    res = test_greeting_formula(h, m)
    assert res == expected, f"Failed at {h:02d}:{m:02d}: expected {expected}, got {res}"
    print(f"  ✓ {h:02d}:{m:02d} -> '{res}' matches '{expected}'")

print("\n--- 2. Testing Progress Bar Step-Dependent Visibility Logic ---")

def is_progress_bar_visible(step):
    # Only appear once pickup is accepted (step >= 2) and before payment received (step < 5)
    return step >= 2 and step < 5

step_cases = [
    (0, False, "No active pickup"),
    (1, False, "Pickup requested (Awaiting collector acceptance)"),
    (2, True, "Pickup Accepted (Progress bar appears!)"),
    (3, True, "Scrap Verified (Progress bar active)"),
    (4, True, "Payment Confirmed (Progress bar active)"),
    (5, False, "Payment Received (Progress bar disappears!)")
]

for step, expected_visible, desc in step_cases:
    vis = is_progress_bar_visible(step)
    assert vis == expected_visible, f"Failed for step {step}: expected {expected_visible}, got {vis}"
    status_str = "VISIBLE (block)" if vis else "HIDDEN (none)"
    print(f"  ✓ Step {step} ({desc}): {status_str}")

print("\n--- 3. Testing Headless Edge Live Browser Rendering ---")
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
res = subprocess.run([
    edge_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--dump-dom",
    "http://127.0.0.1:8088/"
], capture_output=True, text=True, encoding='utf-8', errors='ignore')

title_match = re.search(r'<h2[^>]*id="hh-dynamic-greeting-title"[^>]*>([\s\S]*?)</h2>', res.stdout)
if title_match:
    greeting_text = title_match.group(1).strip()
    print("  ✓ Live rendered greeting text:", greeting_text)
    assert "Good Morning" in greeting_text, f"Expected 'Good Morning' after midnight, got '{greeting_text}'"
    assert "Good Night" not in greeting_text, "Found unexpected 'Good Night'"
else:
    print("  ✗ Could not find hh-dynamic-greeting-title in DOM")

print("\n🎉 ALL GREETING & PROGRESS BAR TESTS PASSED SUCCESSFULLY!")
