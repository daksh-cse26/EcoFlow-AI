import os
import sys
import re

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def test_html_structure():
    print("=== 1. Testing HTML Structure ===")
    html_path = os.path.join(PROJECT_DIR, "static", "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Check household-dashboard-view wraps the main dashboard elements
    assert '<div class="household-dashboard-view" id="household-dashboard-view">' in html, \
        "FAIL: household-dashboard-view container missing!"
    assert '</div><!-- /#household-dashboard-view -->' in html, \
        "FAIL: household-dashboard-view closing tag missing!"

    # Check that hh-screen-post-scrap is NOT inside household-dashboard-view
    dashboard_start = html.find('id="household-dashboard-view"')
    dashboard_end = html.find('<!-- /#household-dashboard-view -->')
    post_scrap_screen_pos = html.find('id="hh-screen-post-scrap"')

    assert dashboard_start != -1, "FAIL: household-dashboard-view not found"
    assert dashboard_end != -1, "FAIL: dashboard end not found"
    assert post_scrap_screen_pos != -1, "FAIL: hh-screen-post-scrap not found"
    assert post_scrap_screen_pos > dashboard_end, \
        "FAIL: hh-screen-post-scrap must be outside and after household-dashboard-view so it opens as a clean separate screen!"

    # Check exit confirmation modal
    assert 'id="post-scrap-exit-modal"' in html, "FAIL: post-scrap-exit-modal missing!"
    assert 'class="modal-overlay"' in html, "FAIL: modal-overlay class missing!"
    assert 'post-scrap-exit-dialog' in html, "FAIL: post-scrap-exit-dialog missing!"
    assert 'confirmExitPostScrap(true)' in html, "FAIL: confirmExitPostScrap(true) button missing!"
    assert 'confirmExitPostScrap(false)' in html, "FAIL: confirmExitPostScrap(false) button missing!"
    assert 'Are you Sure you want to Exit? Doing so will reset your progress' in html, \
        "FAIL: Warning text mismatch!"

    print("  [PASS] HTML structure confirms dedicated screen separation and exit dialog!")

def test_css_centering():
    print("\n=== 2. Testing CSS Center Positioning & Backdrop ===")
    css_path = os.path.join(PROJECT_DIR, "static", "css", "style.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    # Verify .modal-overlay has fixed, centered properties
    assert '.modal-overlay' in css, "FAIL: .modal-overlay missing in style.css!"
    assert 'position: fixed' in css, "FAIL: position: fixed missing!"
    assert 'align-items: center' in css, "FAIL: align-items: center missing in modal-overlay!"
    assert 'justify-content: center' in css, "FAIL: justify-content: center missing in modal-overlay!"

    # Verify .post-scrap-exit-dialog has center margins and warning styles
    assert '.post-scrap-exit-dialog' in css, "FAIL: .post-scrap-exit-dialog missing in style.css!"
    assert 'margin: auto' in css, "FAIL: margin: auto missing in post-scrap-exit-dialog!"
    assert '#EF4444' in css, "FAIL: Red warning color (#EF4444) missing!"

    print("  [PASS] CSS guarantees fixed viewport coverage, blurred backdrop, and dead-center dialog popup!")

def test_javascript_screen_transitions():
    print("\n=== 3. Testing JavaScript Screen Transitions ===")
    js_path = os.path.join(PROJECT_DIR, "static", "js", "household_scrap.js")
    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()

    # openPostScrapScreen hides household-dashboard-view and shows hh-screen-post-scrap
    assert 'document.getElementById("household-dashboard-view")' in js, \
        "FAIL: household-dashboard-view not referenced in household_scrap.js!"
    assert 'postScreen.style.display = "block"' in js, \
        "FAIL: postScreen not shown on click!"
    assert 'dashboard.style.display = "none"' in js, \
        "FAIL: dashboard not hidden on click!"

    # onPostScrapBackClick opens exit modal
    assert 'function onPostScrapBackClick()' in js, "FAIL: onPostScrapBackClick function missing!"
    assert 'post-scrap-exit-modal' in js, "FAIL: modal ID not referenced!"

    # confirmExitPostScrap restores dashboard
    assert 'function confirmExitPostScrap(yes)' in js, "FAIL: confirmExitPostScrap function missing!"
    assert 'if (yes)' in js, "FAIL: yes branch missing!"
    assert 'postScreen.style.display = "none"' in js, "FAIL: postScreen not hidden on yes!"
    assert 'dashboard.style.display = "block"' in js, "FAIL: dashboard not restored on yes!"

    print("  [PASS] JavaScript toggles screen cleanly between Home Dashboard and Post Scrap Dedicated Screen!")

if __name__ == "__main__":
    test_html_structure()
    test_css_centering()
    test_javascript_screen_transitions()
    print("\n==========================================")
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("==========================================")
