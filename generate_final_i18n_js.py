# -*- coding: utf-8 -*-
"""
Script to combine all dictionaries and generate static/js/i18n.js
"""

import os
import re
import json

base_dir = os.path.dirname(os.path.abspath(__file__))

# Import the 3 dictionaries
from translations_data import GATEWAY
from translations_operational import OPERATIONAL
from translations_household import HOUSEHOLD

langs = ["en", "hi", "mr", "gu", "mwr", "te", "ta", "kn", "ml", "pa", "as", "bn", "or", "ur", "es", "fr", "de", "ja", "ar"]

LANG_NAMES = {
    "en": "English",
    "hi": "हिन्दी (Hindi)",
    "mr": "मराठी (Marathi)",
    "gu": "ગુજરાતી (Gujarati)",
    "mwr": "मारवाड़ी (Marwari)",
    "te": "తెలుగు (Telugu)",
    "ta": "தமிழ் (Tamil)",
    "kn": "ಕನ್ನಡ (Kannada)",
    "ml": "മലയാളം (Malayalam)",
    "pa": "ਪੰਜਾਬੀ (Punjabi)",
    "as": "অসমীয়া (Assamese)",
    "bn": "বাংলা (Bengali)",
    "or": "ଓଡ଼ିଆ (Odia)",
    "ur": "اردو (Urdu)",
    "es": "Español (Spanish)",
    "fr": "Français (French)",
    "de": "Deutsch (German)",
    "ja": "日本語 (Japanese)",
    "ar": "العربية (Arabic)"
}

# 1. Parse existing i18n.js to retain existing keys
with open(os.path.join(base_dir, 'static', 'js', 'i18n.js'), 'r', encoding='utf-8') as f:
    existing_code = f.read()

existing = {}
lang_matches = re.findall(r'(\n\s{2}([a-z]{2,3}):\s*\{([^\}]+)\})', existing_code)
for full, lang, body in lang_matches:
    pairs = dict(re.findall(r'"([^"]+)":\s*"([^"]+)"', body))
    existing[lang] = pairs

# 2. Merge dictionaries for each language
ALL_DICTS = {}
for lang in langs:
    ALL_DICTS[lang] = {}
    # Load existing keys
    if lang in existing:
        for k, v in existing[lang].items():
            ALL_DICTS[lang][k] = v

# Add HOUSEHOLD
for key, trans in HOUSEHOLD.items():
    for lang in langs:
        if lang in trans:
            ALL_DICTS[lang][key] = trans[lang]
        elif "en" in trans and key not in ALL_DICTS[lang]:
            ALL_DICTS[lang][key] = trans["en"]

# Add GATEWAY
for key, trans in GATEWAY.items():
    for lang in langs:
        if lang in trans:
            ALL_DICTS[lang][key] = trans[lang]
        elif "en" in trans and key not in ALL_DICTS[lang]:
            ALL_DICTS[lang][key] = trans["en"]

# Add OPERATIONAL
for key, trans in OPERATIONAL.items():
    for lang in langs:
        if lang in trans:
            ALL_DICTS[lang][key] = trans[lang]
        elif "en" in trans and key not in ALL_DICTS[lang]:
            ALL_DICTS[lang][key] = trans["en"]

# Ensure every language has ALL keys that English has
en_keys = set(ALL_DICTS['en'].keys())
for lang in langs:
    for k in en_keys:
        if k not in ALL_DICTS[lang]:
            # Fallback to hi or en
            if lang in ["mr", "gu", "mwr", "pa", "or", "ur", "as", "bn"] and k in ALL_DICTS.get("hi", {}):
                ALL_DICTS[lang][k] = ALL_DICTS["hi"][k]
            else:
                ALL_DICTS[lang][k] = ALL_DICTS["en"][k]

print(f"English keys count: {len(en_keys)}")
for lang in langs:
    print(f"  {lang}: {len(ALL_DICTS[lang])} keys")

# Build Phrase Map for direct DOM phrase auto-translation
# Maps English text -> Language text
PHRASE_MAP = {lang: {} for lang in langs}
for key in en_keys:
    en_val = ALL_DICTS['en'].get(key, "").strip()
    if en_val and len(en_val) > 1:
        for lang in langs:
            l_val = ALL_DICTS[lang].get(key, en_val)
            PHRASE_MAP[lang][en_val] = l_val

# Also add special UI phrases directly into PHRASE_MAP
EXTRA_PHRASES = {
    "Select Your Operating Interface": "gw.hero_title",
    "Household App": "gw.role_household_title",
    "Field Coordinator": "gw.role_coordinator_title",
    "Field Collector": "gw.role_collector_title",
    "Storage Hub (Authority)": "gw.role_hub_title",
    "Recycler Portal": "gw.role_recycler_title",
    "Command Center": "gw.role_admin_title",
    "Full Name": "gw.name_label",
    "Mobile Number": "gw.phone_label",
    "Email Address": "gw.email_label",
    "Employee ID": "gw.emp_id_label",
    "Master Password": "gw.password_label",
    "Physical / Operating Address": "gw.address_label",
    "* Mandatory": "gw.mandatory",
    "(Optional / If any)": "gw.optional",
    "🔒 Logout / Switch": "header.switch_portal",
    "Voice Assistant": "voice.tap_to_speak",
    "Close": "common.close",
    "Cancel": "common.cancel",
    "Confirm": "common.confirm",
    "Done": "common.done",
    "Print": "common.print"
}

for phrase, key in EXTRA_PHRASES.items():
    for lang in langs:
        if key in ALL_DICTS[lang]:
            PHRASE_MAP[lang][phrase] = ALL_DICTS[lang][key]

# Generate JavaScript
js_output = []
js_output.append("/**\n * EcoFlow AI - Multilingual Localization Engine (Dual-Engine I18N)\n * Supported Languages: 19 Languages (Indian Regional & Global)\n */\n")

js_output.append("const I18N = " + json.dumps(ALL_DICTS, ensure_ascii=False, indent=2) + ";\n\n")

js_output.append("const LANG_NAMES = " + json.dumps(LANG_NAMES, ensure_ascii=False, indent=2) + ";\n\n")

js_output.append("const PHRASE_MAP = " + json.dumps(PHRASE_MAP, ensure_ascii=False, indent=2) + ";\n\n")

js_output.append("""
let currentLang = 'en';

function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem('ecoflow_lang', lang);

  // Synchronize select dropdown
  const selectEl = document.getElementById("lang-select");
  if (selectEl && selectEl.value !== lang) {
    selectEl.value = lang;
  }

  // Update document direction for RTL languages (Arabic, Urdu)
  if (lang === 'ar' || lang === 'ur') {
    document.documentElement.dir = 'rtl';
    document.body.classList.add('rtl-mode');
  } else {
    document.documentElement.dir = 'ltr';
    document.body.classList.remove('rtl-mode');
  }

  // Apply translations across all elements
  applyTranslations();

  // Update dynamic gateway titles and labels if auth module is loaded
  if (typeof updateGatewayRoleTitle === 'function') {
    updateGatewayRoleTitle();
  }
}

function onLanguageSelectChange(val) {
  setLanguage(val);
}

function t(key, fallback = '') {
  if (I18N[currentLang] && I18N[currentLang][key]) {
    return I18N[currentLang][key];
  }
  if (I18N['en'] && I18N['en'][key]) {
    return I18N['en'][key];
  }
  return fallback || key;
}

function translateDOMPhrases() {
  const phraseDict = PHRASE_MAP[currentLang] || {};
  
  // Select all candidate UI text containers
  const selectors = [
    '.portal-card-title',
    '.portal-card-desc',
    '.gateway-badge',
    '.gateway-hero h2',
    '.gateway-hero p',
    '.gateway-form-header span',
    '.gateway-field label > span:first-child',
    '.field-tag',
    '.btn-gateway-submit',
    '.btn-portal-switch span',
    '.voice-btn-top span',
    '.sub-interface-title',
    '.sub-interface-desc',
    '.impact-lbl',
    '.action-btn-title',
    '.action-btn-sub',
    '.subnav-btn',
    '.filter-btn',
    '.perspective-nav-item',
    '.metric-label',
    '.gateway-security-notice span'
  ];

  document.querySelectorAll(selectors.join(', ')).forEach(el => {
    // If element has direct data-i18n, let data-i18n handler take precedence
    if (el.hasAttribute('data-i18n')) return;

    if (currentLang === 'en') {
      if (el.dataset.i18nOrig) {
        el.textContent = el.dataset.i18nOrig;
      }
      return;
    }

    // Non-English: save original English text if not saved yet
    const text = el.textContent.trim();
    if (!el.dataset.i18nOrig && text) {
      el.dataset.i18nOrig = text;
    }

    const orig = el.dataset.i18nOrig || text;
    if (phraseDict[orig]) {
      el.textContent = phraseDict[orig];
    }
  });
}

function applyTranslations() {
  // 1. Direct data-i18n tags
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated) {
      el.textContent = translated;
    }
  });

  // 2. Direct data-i18n-placeholder tags
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated) {
      el.placeholder = translated;
    }
  });

  // 3. Dynamic tags like * Mandatory and (Optional / If any)
  document.querySelectorAll('.field-tag-req').forEach(el => {
    el.textContent = t('gw.mandatory', '* Mandatory');
  });
  document.querySelectorAll('.field-tag-opt').forEach(el => {
    el.textContent = t('gw.optional', '(Optional / If any)');
  });

  // 4. Update Gateway form placeholders dynamically
  const nameInput = document.getElementById("gw-name");
  if (nameInput) nameInput.placeholder = t("gw.name_placeholder", "e.g. Rahul Sharma");
  const phoneInput = document.getElementById("gw-phone");
  if (phoneInput) phoneInput.placeholder = t("gw.phone_placeholder", "e.g. +91 98640 12345");
  const emailInput = document.getElementById("gw-email");
  if (emailInput && !emailInput.value) {
    if (typeof activeGatewayRole !== 'undefined' && activeGatewayRole === 'admin') {
      emailInput.placeholder = t("gw.admin_email_placeholder", "e.g. officer@ecoflow.ai");
    } else {
      emailInput.placeholder = t("gw.email_placeholder", "e.g. user@example.com");
    }
  }
  const empInput = document.getElementById("gw-emp-id");
  if (empInput) empInput.placeholder = t("gw.emp_id_placeholder", "e.g. EMP-2026-101");
  const passInput = document.getElementById("gw-password");
  if (passInput) passInput.placeholder = t("gw.password_placeholder", "Enter secure password");
  const addrInput = document.getElementById("gw-address");
  if (addrInput) addrInput.placeholder = t("gw.address_placeholder", "e.g. House 42, Green Park Avenue, North Zone, Guwahati");

  // 5. DOM Phrase Auto-Translator for rich coverage
  translateDOMPhrases();
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("ecoflow_lang") || "en";
  const selectEl = document.getElementById("lang-select");
  if (selectEl && I18N[savedLang]) {
    selectEl.value = savedLang;
  }
  if (I18N[savedLang]) {
    setLanguage(savedLang);
  }
});
""")

target_path = os.path.join(base_dir, 'static', 'js', 'i18n.js')
with open(target_path, 'w', encoding='utf-8') as f:
    f.write("".join(js_output))

print(f"Successfully generated static/js/i18n.js! Size: {os.path.getsize(target_path)} bytes")
