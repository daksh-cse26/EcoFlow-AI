# -*- coding: utf-8 -*-
import json
import os
import re

base_dir = os.path.dirname(os.path.abspath(__file__))
i18n_path = os.path.join(base_dir, 'static', 'js', 'i18n.js')

with open(i18n_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Parse existing translations
existing = {}
lang_matches = re.findall(r'(\n\s{2}([a-z]{2,3}):\s*\{([^\}]+)\})', code)
for full, lang, body in lang_matches:
    pairs = dict(re.findall(r'"([^"]+)":\s*"([^"]+)"', body))
    existing[lang] = pairs

print("Existing languages loaded:", list(existing.keys()))
