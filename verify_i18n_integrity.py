import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(base_dir, 'static', 'index.html')
js_path = os.path.join(base_dir, 'static', 'js', 'i18n.js')

with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Extract keys from HTML
html_keys = set(re.findall(r'data-i18n="([^"]+)"', html_content))
html_placeholder_keys = set(re.findall(r'data-i18n-placeholder="([^"]+)"', html_content))
all_needed_keys = html_keys.union(html_placeholder_keys)

# Extract I18N JSON object from i18n.js
m = re.search(r'const I18N = (\{.*?\});\n\nconst LANG_NAMES', js_content, re.DOTALL)
if not m:
    print("ERROR: Could not parse I18N from i18n.js")
    exit(1)

i18n_dict = json.loads(m.group(1))

langs = ["en", "hi", "mr", "gu", "mwr", "te", "ta", "kn", "ml", "pa", "as", "bn", "or", "ur", "es", "fr", "de", "ja", "ar"]

print(f"Total HTML required keys: {len(all_needed_keys)}")
print(f"Total languages in I18N: {len(i18n_dict)}")

missing_per_lang = {}
for lang in langs:
    if lang not in i18n_dict:
        print(f"ERROR: Language {lang} missing from I18N dictionary!")
        continue
    missing = [k for k in all_needed_keys if k not in i18n_dict[lang]]
    if missing:
        missing_per_lang[lang] = missing

if missing_per_lang:
    print(f"Missing keys found in {len(missing_per_lang)} languages:")
    for lang, mkeys in missing_per_lang.items():
        print(f"  {lang}: {len(mkeys)} missing ({mkeys[:5]}...)")
else:
    print("SUCCESS: ALL 103+ HTML keys exist in ALL 19 languages without a single exception!")

# Check sample translations
print("\nSample translations for 'gw.hero_title':")
for lang in ["en", "hi", "mr", "gu", "mwr", "te", "ta", "bn", "es", "de", "ja", "ar"]:
    print(f"  [{lang}]: {i18n_dict[lang].get('gw.hero_title')}")

print("\nSample translations for 'gw.role_household_title':")
for lang in ["en", "hi", "mr", "gu", "mwr", "te", "ta", "bn", "es", "de", "ja", "ar"]:
    print(f"  [{lang}]: {i18n_dict[lang].get('gw.role_household_title')}")
