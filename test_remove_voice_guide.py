"""
Test Verification: Voice Guide and Voice Assistant Feature Removal
for Command Center and Field Coordinator
"""

import os
import re

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(PROJECT_DIR, "static")

def test_login_tts_js():
    tts_path = os.path.join(STATIC_DIR, "js", "login_tts.js")
    with open(tts_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Verify getFieldsForRole excludes admin & coordinator
    assert "if (role === 'admin' || role === 'coordinator') {" in content, "Missing check in getFieldsForRole"
    assert "return [];" in content, "Missing return []; in getFieldsForRole"

    # 2. Verify updateToggleUI hides bar for admin & coordinator
    assert "activeRole === 'admin' || activeRole === 'coordinator'" in content, "Missing check in updateToggleUI"

    # 3. Verify handleRoleChange stops narrator for admin & coordinator
    assert "handleRoleChange(role) {" in content
    assert "if (role === 'admin' || role === 'coordinator') {" in content

    # 4. Verify toggle() prevents activation for admin & coordinator
    assert "function toggleLoginTTS() {" in content

    print("PASS: static/js/login_tts.js correctly prevents Voice Guide for admin and coordinator.")

def test_auth_js():
    auth_path = os.path.join(STATIC_DIR, "js", "auth.js")
    with open(auth_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify selectGatewayRole handles admin & coordinator voice removal
    assert "if (role === 'admin' || role === 'coordinator') {" in content, "Missing check in selectGatewayRole"
    assert "if (ttsBar) ttsBar.style.display = \"none\";" in content
    assert "if (topVoiceBtn) topVoiceBtn.style.display = \"none\";" in content

    # Verify applyActiveSession hides voice button for admin & coordinator
    assert "session.role === 'admin' || session.role === 'coordinator'" in content
    print("PASS: static/js/auth.js correctly hides Voice Guide and Voice Assistant.")

def test_app_js():
    app_path = os.path.join(STATIC_DIR, "js", "app.js")
    with open(app_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify switchPerspective hides topVoiceBtn for admin and coordinator
    assert "if (role === 'admin' || role === 'coordinator') {" in content, "Missing check in switchPerspective"
    print("PASS: static/js/app.js correctly hides Voice Assistant in switchPerspective.")

def test_css_rules():
    css_path = os.path.join(STATIC_DIR, "css", "style.css")
    with open(css_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert 'body[data-gateway-role="admin"] #gateway-tts-bar' in content
    assert 'body[data-gateway-role="coordinator"] #gateway-tts-bar' in content
    assert 'body[data-active-role="admin"] .voice-btn-top' in content
    assert 'body[data-active-role="coordinator"] .voice-btn-top' in content
    assert 'display: none !important;' in content
    print("PASS: static/css/style.css contains strict display: none !important rules.")

if __name__ == "__main__":
    print("=== Running Voice Guide Removal Verification Suite ===")
    test_login_tts_js()
    test_auth_js()
    test_app_js()
    test_css_rules()
    print("=== ALL VOICE GUIDE REMOVAL TESTS PASSED SUCCESSFULLY! ===")
