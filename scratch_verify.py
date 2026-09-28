import os
import re

index_path = r"C:\Users\LOQ\.gemini\antigravity-ide\scratch\ecoflow-ai\static\index.html"
with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

print("--- Checking Required HTML Elements ---")
checks = [
    ("Voice language button", "btn-lang-voice-detect"),
    ("Voice language modal", "voice-lang-modal"),
    ("Voice mic circle", "lang-voice-mic-circle"),
    ("Gateway TTS bar", "gateway-tts-bar"),
    ("TTS toggle button", "btn-tts-toggle"),
    ("Tutorial guide modal", "tutorial-guide-modal"),
    ("Tutorial video modal", "tutorial-video-modal"),
    ("Tutorial video canvas", "tut-video-canvas"),
    ("voice_lang.js script", "src=\"js/voice_lang.js\""),
    ("login_tts.js script", "src=\"js/login_tts.js\""),
    ("tutorial.js script", "src=\"js/tutorial.js\""),
]

for label, needle in checks:
    print(f"[{'PASS' if needle in html else 'FAIL'}] {label}: {needle}")

print("\n--- Verifying Tutorial Exclusivity (ONLY in household & collector) ---")
views = ["household", "coordinator", "collector", "hub", "recycler", "admin"]
for v in views:
    m = re.search(rf'id="view-{v}"[\s\S]*?</main>', html)
    if m:
        content = m.group(0)
        has_banner = "tutorial-guide-banner" in content
        has_tour_btn = "openStepTutorial" in content
        print(f"View [view-{v}]: Banner={has_banner}, TourBtn={has_tour_btn}")
    else:
        print(f"View [view-{v}]: NOT FOUND")

print("\n--- Checking CSS Rules ---")
css_path = r"C:\Users\LOQ\.gemini\antigravity-ide\scratch\ecoflow-ai\static\css\style.css"
with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

css_checks = [
    ("Voice modal styles", ".voice-lang-modal"),
    ("Mic pulse animation", "@keyframes micPulse"),
    ("TTS highlight", ".tts-field-highlight"),
    ("Tutorial spotlight", ".tut-spotlight-active"),
    ("Tutorial guide modal", ".tutorial-guide-modal"),
    ("Tutorial video modal", ".tutorial-video-modal"),
    ("Video canvas styles", "#tut-video-canvas"),
]

for label, needle in css_checks:
    print(f"[{'PASS' if needle in css else 'FAIL'}] {label}: {needle}")

print("\n--- All Checks Completed ---")
