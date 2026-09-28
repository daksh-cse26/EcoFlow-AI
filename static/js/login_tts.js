/**
 * EcoFlow AI - Login Page Sequential Text-To-Speech (TTS) Narrator
 * Automatically reads out each login field aloud line-by-line in the active language,
 * and advances to the next field as the user completes entering data.
 * Fully supports all 19 regional Indian and global languages, with instant auto-switching
 * when the language of the application changes.
 */

class LoginTTSNarrator {
  constructor() {
    this.isEnabled = false;
    this.currentStepIndex = 0;
    this.speechSynthesis = window.speechSynthesis;
    this.activeRole = 'household';
    this.fieldsSequence = [];
    this.debounceTimer = null;
    this.isSpeaking = false;
  }

  init() {
    // Listen for role selection changes
    const roleCards = document.querySelectorAll(".portal-role-card");
    roleCards.forEach(card => {
      card.addEventListener("click", () => {
        if (this.isEnabled) {
          setTimeout(() => {
            this.handleRoleChange(card.dataset.role);
          }, 250);
        }
      });
    });

    // Listen for inputs to auto-advance
    this.attachInputListeners();
    this.updateToggleUI();
  }

  attachInputListeners() {
    const inputIds = ["gw-name", "gw-phone", "gw-email", "gw-emp-id", "gw-password", "gw-address"];
    inputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this.onFieldInput(id));
        el.addEventListener("blur", () => this.onFieldBlur(id));
      }
    });
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.updateToggleUI();

    if (this.isEnabled) {
      this.startNarrator();
    } else {
      this.stopNarrator();
    }
  }

  /**
   * Called automatically whenever UI language changes (via voice speech or dropdown)
   */
  onLanguageChange(lang) {
    this.updateToggleUI();

    if (this.isEnabled) {
      if (this.speechSynthesis) {
        try { this.speechSynthesis.cancel(); } catch (e) {}
      }
      // Re-narrate current field immediately in the newly chosen language
      setTimeout(() => {
        this.narrateCurrentStep();
      }, 180);
    }
  }

  updateToggleUI() {
    const btn = document.getElementById("btn-tts-toggle");
    const label = document.getElementById("tts-toggle-text");
    const repeatBtn = document.getElementById("btn-tts-speak-again");
    const bar = document.getElementById("gateway-tts-bar");
    const statusPill = document.getElementById("tts-narrator-status");
    const repeatText = document.getElementById("tts-repeat-text");

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

    const onLabels = {
      en: "Voice Guide: ON 🔊", hi: "वॉइस गाइड: चालू 🔊", mr: "व्हॉइस गाइड: सुरू 🔊",
      gu: "વોઇસ ગાઇડ: ચાલુ 🔊", mwr: "आवाज गाइड: चालू 🔊", te: "వాయిస్ గైడ్: ఆన్ 🔊",
      ta: "குரல் வழிகாட்டி: ஆன் 🔊", kn: "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ: ಆನ್ 🔊", ml: "വോയ്സ് ഗൈഡ്: ഓൺ 🔊",
      pa: "ਆਵਾਜ਼ ਗਾਈਡ: ਚਾਲੂ 🔊", as: "ভইচ গাইড: সক্ৰিয় 🔊", bn: "ভয়েস গাইড: চালু 🔊",
      or: "ଭଏସ୍ ଗାଇଡ୍: ଚାଲୁ 🔊", ur: "وائس گائیڈ: آن 🔊", es: "Guía de voz: ACTIVADA 🔊",
      fr: "Guide vocal : ACTIVÉ 🔊", de: "Sprachführung: EIN 🔊", ja: "音声ガイド: 有効 🔊",
      ar: "الدليل الصوتي: قيد التشغيل 🔊"
    };

    const offLabels = {
      en: "Voice Guide: Read Out Aloud (Line by Line)",
      hi: "वॉइस गाइड: बोलकर सुनाएं (पंक्ति-दर-पंक्ति)",
      mr: "व्हॉइस गाइड: मोठ्याने वाचून दाखवा (ओळ दर ओळ)",
      gu: "વોઇસ ગાઇડ: મોટેથી બોલીને સંભળાવો",
      mwr: "आवाज गाइड: बोल'र सुणावो सा",
      te: "వాయిస్ గైడ్: బిగ్గరగా చదవండి (వరుసగా)",
      ta: "குரல் வழிகாட்டி: உரக்கப் படியுங்கள் (வரிசையாக)",
      kn: "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ: ಗಟ್ಟಿಯಾಗಿ ಓದಿ",
      ml: "വോയ്സ് ഗൈഡ്: ഉച്ചത്തിൽ വായിക്കുക",
      pa: "ਆਵਾਜ਼ ਗਾਈਡ: ਬੋਲ ਕੇ ਸੁਣਾਓ",
      as: "ভইচ গাইড: ডাঙৰকৈ পঢ়ি শুনক",
      bn: "ভয়েস গাইড: জোরে পড়ে শোনান",
      or: "ଭଏସ୍ ଗାଇଡ୍: ବଡ଼ ପାଟିରେ ପଢ଼ନ୍ତୁ",
      ur: "وائس گائیڈ: اونچی آواز میں پڑھیں",
      es: "Guía de voz: Leer en voz alta (línea por línea)",
      fr: "Guide vocal : Lire à haute voix (ligne par ligne)",
      de: "Sprachführung: Laut vorlesen (Zeile für Zeile)",
      ja: "音声ガイド: 1行ずつ読み上げ",
      ar: "الدليل الصوتي: القراءة بصوت عالٍ (سطراً بسطر)"
    };

    const activeStatuses = {
      en: "🔊 Voice guidance active: Speaking line by line",
      hi: "🔊 वॉइस गाइड चालू: पंक्ति-दर-पंक्ति बोल रहा है",
      mr: "🔊 व्हॉइस गाइड सुरू: ओळ दर ओळ मार्गदर्शन सुरू",
      gu: "🔊 વોઇસ ગાઇડ ચાલુ: એક પછી એક માર્ગદર્શન આપી રહ્યું છે",
      mwr: "🔊 आवाज गाइड चालू है सा: एक-एक बात बोल'र बतावे",
      te: "🔊 వాయిస్ గైడ్ యాక్టివ్: వరుసగా మార్గదర్శనం",
      ta: "🔊 குரல் வழிகாட்டி செயலில் உள்ளது: வரிசையாக பேசுகிறது",
      kn: "🔊 ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಸಕ್ರಿಯವಾಗಿದೆ: ಹಂತ ಹಂತವಾಗಿ",
      ml: "🔊 വോയ്സ് ഗൈഡ് സജീവം: ഓരോ വരിയായി പറയുന്നു",
      pa: "🔊 ਆਵਾਜ਼ੀ ਮਾਰਗਦਰਸ਼ਨ ਸਰਗਰਮ: ਇਕ-ਇਕ ਕਰਕੇ ਬੋਲ ਰਿਹਾ ਹੈ",
      as: "🔊 ভইচ গাইড সক্ৰিয়: এটা এটাকৈ নিৰ্দেশনা",
      bn: "🔊 ভয়েস গাইড সক্রিয়: ধাপে ধাপে নির্দেশনা",
      or: "🔊 ଭଏସ୍ ଗାଇଡ୍ ସକ୍ରିୟ: ପଦକ୍ଷେପ ଅନୁଯାୟୀ ବୋଲିବା",
      ur: "🔊 وائس گائیڈ فعال: سطر بہ سطر رہنمائی جاری",
      es: "🔊 Guía por voz activa: Hablando paso a paso",
      fr: "🔊 Guide vocal actif : Lecture ligne par ligne",
      de: "🔊 Sprachführung aktiv: Zeile für Zeile vorlesen",
      ja: "🔊 音声ガイド有効: 1行ずつ読み上げ中",
      ar: "🔊 الدليل الصوتي نشط: يتحدث سطراً بسطر"
    };

    const idleStatuses = {
      en: "Tap to activate automatic voice guidance for illiterate users",
      hi: "बोलकर सहायता प्राप्त करने के लिए यहां टैप करें",
      mr: "आवाजाद्वारे मार्गदर्शन मिळवण्यासाठी येथे टॅप करा",
      gu: "બોલીને માર્ગદર્શન મેળવવા માટે અહીં ટેપ કરો",
      mwr: "बोल'र मदद लेवण खातर अठे दबावो सा",
      te: "వాయిస్ మార్గదర్శకత్వం కోసం ఇక్కడ నొక్కండి",
      ta: "குரல் வழிகாட்டலைப் பெற இங்கே தட்டவும்",
      kn: "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಇಲ್ಲಿ ಸ್ಪರ್ಶಿಸಿ",
      ml: "വോയ്സ് മാർഗ്ഗനിർദ്ദേശത്തിനായി ഇവിടെ ടാപ്പ് ചെയ്യുക",
      pa: "ਆਵਾਜ਼ੀ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਇੱਥੇ ਟੈਪ ਕਰੋ",
      as: "ভইচ নিৰ্দেশনা পাবলৈ ইয়াত টিপক",
      bn: "ভয়েস নির্দেশনার জন্য এখানে ট্যাপ করুন",
      or: "ଭଏସ୍ ମାର୍ଗଦର୍ଶନ ପାଇଁ ଏଠାରେ ଟ୍ୟାପ୍ କରନ୍ତୁ",
      ur: "صوتی رہنمائی کے لیے یہاں ٹیپ کریں",
      es: "Toque para activar la guía por voz paso a paso",
      fr: "Appuyez pour activer le guide vocal pas à pas",
      de: "Tippen Sie, um die Sprachführung zu aktivieren",
      ja: "タップして自動音声ガイダンスを開始",
      ar: "اضغط لتفعيل الإرشاد الصوتي خطوة بخطوة"
    };

    const repeatLabels = {
      en: "🔄 Repeat", hi: "🔄 दोहराएं", mr: "🔄 पुन्हा ऐका", gu: "🔄 ફરી સાંભળો",
      mwr: "🔄 पाछो सुणो सा", te: "🔄 పునరావృతం", ta: "🔄 மீண்டும்", kn: "🔄 ಪುನರಾವರ್ತಿಸಿ",
      ml: "🔄 ആവർത്തിക്കുക", pa: "🔄 ਦੁਹਰਾਓ", as: "🔄 পুনৰ শুনক", bn: "🔄 পুনরায় শুনুন",
      or: "🔄 ପୁନରାବୃତ୍ତି", ur: "🔄 دوبارہ سنیں", es: "🔄 Repetir", fr: "🔄 Répéter",
      de: "🔄 Wiederholen", ja: "🔄 もう一度", ar: "🔄 تكرار"
    };

    if (repeatText) {
      repeatText.textContent = repeatLabels[lang] || repeatLabels.en;
    }

    if (this.isEnabled) {
      if (btn) btn.classList.add("active");
      if (label) label.textContent = onLabels[lang] || onLabels.en;
      if (repeatBtn) repeatBtn.style.display = "inline-flex";
      if (bar) bar.classList.add("active-narration");
      if (statusPill) statusPill.textContent = activeStatuses[lang] || activeStatuses.en;
    } else {
      if (btn) btn.classList.remove("active");
      if (label) label.textContent = offLabels[lang] || offLabels.en;
      if (repeatBtn) repeatBtn.style.display = "none";
      if (bar) bar.classList.remove("active-narration");
      if (statusPill) statusPill.textContent = idleStatuses[lang] || idleStatuses.en;
      this.clearAllHighlights();
    }
  }

  getFieldsForRole(role) {
    if (role === 'admin') {
      return [
        { id: "gw-email", container: "gf-email-container", label: "Email Address", step: 1, req: true },
        { id: "gw-password", container: "gf-password-container", label: "Master Password", step: 2, req: true },
        { id: "btn-gateway-submit", container: "gateway-submit-container", label: "Submit Button", step: 3, isSubmit: true }
      ];
    } else if (role === 'collector') {
      return [
        { id: "gw-name", container: "gf-name-container", label: "Full Name", step: 1, req: true },
        { id: "gw-phone", container: "gf-phone-container", label: "Mobile Number", step: 2, req: false },
        { id: "gw-email", container: "gf-email-container", label: "Email Address", step: 3, req: false },
        { id: "gw-address", container: "gf-address-container", label: "Operating Address", step: 4, req: true },
        { id: "btn-gateway-submit", container: "gateway-submit-container", label: "Submit Button", step: 5, isSubmit: true }
      ];
    } else if (role === 'coordinator') {
      return [
        { id: "gw-name", container: "gf-name-container", label: "Full Name", step: 1, req: true },
        { id: "gw-phone", container: "gf-phone-container", label: "Mobile Number", step: 2, req: true },
        { id: "gw-email", container: "gf-email-container", label: "Email Address", step: 3, req: true },
        { id: "gw-emp-id", container: "gf-employee-id-container", label: "Employee ID", step: 4, req: true },
        { id: "gw-address", container: "gf-address-container", label: "Physical Address", step: 5, req: true },
        { id: "btn-gateway-submit", container: "gateway-submit-container", label: "Submit Button", step: 6, isSubmit: true }
      ];
    } else {
      // household, hub, recycler
      return [
        { id: "gw-name", container: "gf-name-container", label: "Full Name", step: 1, req: true },
        { id: "gw-phone", container: "gf-phone-container", label: "Mobile Number", step: 2, req: true },
        { id: "gw-email", container: "gf-email-container", label: "Email Address", step: 3, req: true },
        { id: "gw-address", container: "gf-address-container", label: "Physical Address", step: 4, req: true },
        { id: "btn-gateway-submit", container: "gateway-submit-container", label: "Submit Button", step: 5, isSubmit: true }
      ];
    }
  }

  startNarrator() {
    this.activeRole = (typeof activeGatewayRole !== 'undefined') ? activeGatewayRole : 'household';
    this.fieldsSequence = this.getFieldsForRole(this.activeRole);
    this.currentStepIndex = 0;

    const roleTitleEl = document.getElementById("gateway-role-title");
    const roleName = roleTitleEl ? roleTitleEl.textContent : "EcoFlow AI";

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

    const welcomePrompts = {
      en: `Welcome to EcoFlow AI. Active portal: ${roleName}. I will now guide you line by line.`,
      hi: `इकोफ्लो एआई में आपका स्वागत है। सक्रिय पोर्टल: ${roleName}। अब मैं आपको एक-एक करके जानकारी भरने में सहायता करूंगा।`,
      mr: `इकोफ्लो एआय मध्ये आपले स्वागत आहे. सक्रिय पोर्टल: ${roleName}. आता मी आपल्याला एकामागून एक माहिती भरण्यास मदत करेन.`,
      gu: `ઇકોફ્લો એઆઇમાં આપનું સ્વાગત છે. સક્રિય પોર્ટલ: ${roleName}. હવે હું તમને એક પછી એક માહિતી ભરવામાં મદદ કરીશ.`,
      mwr: `इकोफ्लो एआई में आपरो घणो स्वागत है सा। एक्टिव पोर्टल: ${roleName}। अब मैं थाने एक-एक कदम समझाऊंला सा।`,
      te: `ఎకోఫ్లో AI కి స్వాగతం. యాక్టివ్ పోర్టల్: ${roleName}. ఇప్పుడు నేను మీకు దశలవారీగా మార్గనిర్దేశం చేస్తాను.`,
      ta: `எக்கோஃப்ளோ AI க்கு வருக. செயலில் உள்ள போர்டல்: ${roleName}. இப்போது நான் உங்களுக்கு ஒவ்வொரு படியாக வழிகாட்டுகிறேன்.`,
      kn: `ಇಕೋಫ್ಲೋ AI ಗೆ ಸುಸ್ವಾಗತ. ಸಕ್ರಿಯ ಪೋರ್ಟಲ್: ${roleName}. ಈಗ ನಾನು ನಿಮಗೆ ಹಂತ ಹಂತವಾಗಿ ಮಾರ್ಗದರ್ಶನ ಮಾಡುತ್ತೇನೆ.`,
      ml: `എക്കോഫ്ലോ AI ലേക്ക് സ്വാഗതം. സജീവ പോർട്ടൽ: ${roleName}. ഇനി ഞാൻ നിങ്ങളെ ഓരോ ഘട്ടമായി നയിക്കാം.`,
      pa: `ਈਕੋਫਲੋ AI ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ। ਐਕਟਿਵ ਪੋਰਟਲ: ${roleName}। ਹੁਣ ਮੈਂ ਤੁਹਾਨੂੰ ਇਕ-ਇਕ ਕਰਕੇ ਜਾਣਕਾਰੀ ਭਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ।`,
      as: `ইক'ফ্ল' এআইলৈ স্বাগতম। সক্ৰিয় পৰ্টেল: ${roleName}। এতিয়া মই আপোনাক এটা এটাকৈ তথ্য দিয়াত সহায় কৰিম।` ,
      bn: `ইকোফ্লো এআই-তে স্বাগতম। সক্রিয় পোর্টাল: ${roleName}। এবার আমি আপনাকে ধাপে ধাপে তথ্য পূরণে সহায়তা করব।`,
      or: `ଇକୋଫ୍ଲୋ ଏଆଇ କୁ ସ୍ୱାଗତ। ସକ୍ରିୟ ପୋର୍ଟାଲ: ${roleName}। ଏବେ ମୁଁ ଆପଣଙ୍କୁ ଗୋଟି ଗୋଟି କରି ତଥ୍ୟ ପୂରଣ କରିବାରେ ସାହାଯ୍ୟ କରିବି।`,
      ur: `ایکوفلو اے آئی میں خوش آمدید۔ فعال پورٹل: ${roleName}۔ اب میں آپ کو قدم بہ قدم رہنمائی فراہم کروں گا۔`,
      es: `Bienvenido a EcoFlow AI. Portal activo: ${roleName}. Le guiaré paso a paso.`,
      fr: `Bienvenue sur EcoFlow AI. Portail actif : ${roleName}. Je vais maintenant vous guider pas à pas.`,
      de: `Willkommen bei EcoFlow AI. Aktives Portal: ${roleName}. Ich führe Sie Schritt für Schritt.`,
      ja: `EcoFlow AIへようこそ。アクティブなポータル: ${roleName}。1項目ずつ音声でご案内します。`,
      ar: `مرحباً بك في إيكوفلو للذكاء الاصطناعي. البوابة النشطة: ${roleName}. سأرشدك الآن خطوة بخطوة.`
    };

    const promptText = welcomePrompts[lang] || welcomePrompts.en;

    this.speakPrompt(promptText, () => {
      this.narrateCurrentStep();
    });
  }

  stopNarrator() {
    if (this.speechSynthesis) {
      try { this.speechSynthesis.cancel(); } catch (e) {}
    }
    this.clearAllHighlights();
  }

  handleRoleChange(role) {
    if (!this.isEnabled) return;
    this.activeRole = role;
    this.fieldsSequence = this.getFieldsForRole(role);
    this.currentStepIndex = 0;

    const roleTitleEl = document.getElementById("gateway-role-title");
    const roleName = roleTitleEl ? roleTitleEl.textContent : role;

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

    const switchPrompts = {
      en: `Switched interface to ${roleName}. Let's fill your credentials.`,
      hi: `इंटरफेस बदलकर ${roleName} किया गया। आइए अपना विवरण भरें।`,
      mr: `इंटरफेस बदलून ${roleName} केला. चला आपले तपशील भरूया.`,
      gu: `ઇન્ટરફેસ બદલીને ${roleName} કરવામાં આવ્યું. ચાલો તમારી વિગતો ભરીએ.`,
      mwr: `पोर्टल बदलग्यो सा: ${roleName}। अब आपरी जानकारी लगावो सा।`,
      te: `ఇంటర్‌ఫేస్ ${roleName} కి మార్చబడింది. మీ వివరాలను పూరించండి.`,
      ta: `இடைமுகம் ${roleName} ஆக மாற்றப்பட்டது. உங்கள் விவரங்களை உள்ளிடவும்.`,
      kn: `ಇಂಟರ್ಫೇಸ್ ${roleName} ಗೆ ಬದಲಾಗಿದೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.`,
      ml: `ഇന്റർഫേസ് ${roleName} ലേക്ക് മാറ്റി. നിങ്ങളുടെ വിവരങ്ങൾ പൂരിപ്പിക്കുക.`,
      pa: `ਇੰਟਰਫੇਸ ਬਦਲ ਕੇ ${roleName} ਕੀਤਾ ਗਿਆ। ਆਓ ਆਪਣੇ ਵੇਰਵੇ ਭਰੀਏ।`,
      as: `ইণ্টাৰফেচ সলনি হৈ ${roleName} হ'ল। আপোনাৰ তথ্য দিয়ক।`,
      bn: `ইন্টারফেস পরিবর্তন করে ${roleName} করা হয়েছে। আসুন আপনার বিবরণ পূরণ করি।`,
      or: `ଇଣ୍ଟରଫେସ୍ ବଦଳି ${roleName} ହୋଇଗଲା। ଆସନ୍ତୁ ଆପଣଙ୍କ ତଥ୍ୟ ପୂରଣ କରିବା।`,
      ur: `انٹرفیس تبدیل کر کے ${roleName} کیا گیا۔ آئیے اپنے کوائف درج کریں۔`,
      es: `Interfaz cambiada a ${roleName}. Ingresemos sus datos.`,
      fr: `Interface changée pour ${roleName}. Renseignons vos identifiants.`,
      de: `Schnittstelle gewechselt zu ${roleName}. Bitte Daten eingeben.`,
      ja: `インターフェースを ${roleName} に切り替えました。情報を入力してください。`,
      ar: `تم تبديل الواجهة إلى ${roleName}. لنقم بإدخال بياناتك.`
    };

    const promptText = switchPrompts[lang] || switchPrompts.en;

    this.speakPrompt(promptText, () => {
      this.narrateCurrentStep();
    });
  }

  clearAllHighlights() {
    document.querySelectorAll(".tts-field-highlight").forEach(el => {
      el.classList.remove("tts-field-highlight");
    });
    document.querySelectorAll(".tts-field-done").forEach(el => {
      el.classList.remove("tts-field-done");
    });
  }

  narrateCurrentStep() {
    if (!this.isEnabled) return;
    if (this.currentStepIndex >= this.fieldsSequence.length) {
      return;
    }

    const item = this.fieldsSequence[this.currentStepIndex];
    this.clearAllHighlights();

    const containerEl = document.getElementById(item.container);
    if (containerEl) {
      containerEl.classList.add("tts-field-highlight");
      containerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const inputEl = document.getElementById(item.id);
    if (inputEl && !item.isSubmit) {
      inputEl.focus();
    }

    // Build multilingual prompt for current field
    const prompt = this.getFieldPrompt(item);
    this.speakPrompt(prompt);
  }

  getFieldPrompt(item) {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

    if (item.isSubmit) {
      const prompts = {
        en: "All details have been entered successfully. Please press the Authenticate and Enter button to proceed into your portal.",
        hi: "सभी विवरण दर्ज हो चुके हैं। कृपया पोर्टल में प्रवेश करने के लिए 'प्रमाणीकृत करें' बटन दबाएं।",
        mr: "सर्व तपशील भरले गेले आहेत. पोर्टलमध्ये जाण्यासाठी कृपया 'प्रमाणीकृत करा' बटण दाबा.",
        gu: "બધી વિગતો દાખલ થઈ ગઈ છે. પોર્ટલમાં પ્રવેશવા માટે કૃપા કરીને 'પ્રમાણિત કરો' બટન દબાવો.",
        mwr: "सगळी जानकारी भर दी गई है सा। पोर्टल माथे जाण खातर बटन दबावो सा।",
        te: "అన్ని వివరాలు నమోదు చేయబడ్డాయి. పోర్టల్‌లోకి ప్రవేశించడానికి దయచేసి ప్రామాణీకరించండి బటన్‌ను నొక్కండి.",
        ta: "அனைத்து விவரங்களும் பூர்த்தி செய்யப்பட்டன. போர்ட்டலில் நுழைய அங்கீகரிக்கும் பொத்தானை அழுத்தவும்.",
        kn: "ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ನಮೂದಿಸಲಾಗಿದೆ. ಪೋರ್ಟಲ್‌ಗೆ ಪ್ರವೇಶಿಸಲು ದಯವಿಟ್ಟು ಪ್ರಮಾಣೀಕರಿಸಿ ಬಟನ್ ಒತ್ತಿರಿ.",
        ml: "എല്ലാ വിവരങ്ങളും നൽകി കഴിഞ്ഞു. പോർട്ടലിലേക്ക് പ്രവേശിക്കാൻ ദയവായി പ്രാമാണീകരിക്കുക ബട്ടൺ അമർത്തുക.",
        pa: "ਸਾਰੇ ਵੇਰਵੇ ਦਰਜ ਹੋ ਚੁੱਕੇ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਪੋਰਟਲ ਵਿੱਚ ਜਾਣ ਲਈ ਪ੍ਰਮਾਣਿਤ ਕਰੋ ਬਟਨ ਦਬਾਓ।",
        as: "সকলো তথ্য প্ৰবিষ্টি কৰা হ'ল। পৰ্টেলত প্ৰৱেশ কৰিবলৈ প্ৰমাণীকৰণ বুটাম টিপক।",
        bn: "সমস্ত বিবরণ সম্পন্ন হয়েছে। পোর্টালে প্রবেশ করতে প্রমাণীকরণ বোতাম টিপুন।",
        or: "ସମସ୍ତ ବିବରଣୀ ପ୍ରବେଶ କରାଯାଇଛି। ପୋର୍ଟାଲ୍‌ରେ ପ୍ରବେଶ କରିବାକୁ ପ୍ରମାଣୀକରଣ ବଟନ୍ ଦବାନ୍ତୁ।",
        ur: "تمام تفصیلات درج ہو چکی ہیں۔ پورٹل میں داخل ہونے کے لیے تصدیق کریں کا بٹن دبائیں۔",
        es: "¡Todos los campos completos! Presione el botón Autenticar para ingresar.",
        fr: "Tous les champs sont remplis ! Appuyez sur Authentifier pour entrer.",
        de: "Alle Angaben vollständig! Drücken Sie auf Authentifizieren, um fortzufahren.",
        ja: "すべての入力が完了しました。認証ボタンを押してポータルに入ってください。",
        ar: "تم إدخال جميع البيانات بنجاح! اضغط على زر المصادقة للدخول إلى البوابة."
      };
      return prompts[lang] || prompts["en"];
    }

    // Prompts by Field ID
    const promptsByField = {
      "gw-name": {
        en: `Step ${item.step}: Please enter your Full Name.`,
        hi: `चरण ${item.step}: कृपया अपना पूरा नाम दर्ज करें।`,
        mr: `पायरी ${item.step}: कृपया आपले पूर्ण नाव प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.`,
        mwr: `कदम ${item.step}: आपरो पूरो नाम लगावो सा।`,
        te: `దశ ${item.step}: దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.`,
        ta: `படி ${item.step}: தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்.`,
        kn: `ಹಂತ ${item.step}: ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.`,
        ml: `ഘട്ടം ${item.step}: ദയവായി നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക.`,
        pa: `ਕਦਮ ${item.step}: ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ।`,
        as: `পদক্ষেপ ${item.step}: অনুগ্ৰহ কৰি আপোনাৰ সম্পূৰ্ণ নাম দিয়ক।`,
        bn: `ধাপ ${item.step}: দয়া করে আপনার পুরো নাম লিখুন।`,
        or: `ପଦକ୍ଷେପ ${item.step}: ଦୟାକରି ଆପଣଙ୍କ ପୂରା ନାମ ପ୍ରବେଶ କରନ୍ତୁ।`,
        ur: `مرحلہ ${item.step}: براہ کرم اپنا مکمل نام درج کریں۔`,
        es: `Paso ${item.step}: Por favor ingrese su nombre completo.`,
        fr: `Étape ${item.step} : Veuillez entrer votre nom complet.`,
        de: `Schritt ${item.step}: Bitte geben Sie Ihren vollständigen Namen ein.`,
        ja: `ステップ ${item.step}: 氏名を入力してください。`,
        ar: `الخطوة ${item.step}: يرجى إدخال اسمك الكامل.`
      },
      "gw-phone": {
        en: item.req ? `Step ${item.step}: Now enter your Mobile Number.` : `Step ${item.step}: Mobile number is optional. You may enter it or leave it blank.`,
        hi: item.req ? `चरण ${item.step}: अब अपना मोबाइल नंबर दर्ज करें।` : `चरण ${item.step}: मोबाइल नंबर वैकल्पिक है, यदि है तो दर्ज करें।`,
        mr: item.req ? `पायरी ${item.step}: आता आपला मोबाईल नंबर प्रविष्ट करा.` : `पायरी ${item.step}: मोबाईल नंबर पर्यायी आहे, असल्यास टाका.`,
        gu: item.req ? `પગલું ${item.step}: હવે તમારો મોબાઇલ નંબર દાખલ કરો.` : `પગલું ${item.step}: મોબાઇલ નંબર વૈકલ્પિક છે.`,
        mwr: item.req ? `कदम ${item.step}: अब आपरो मोबाइल नंबर लगावो सा।` : `कदम ${item.step}: मोबाइल नंबर मर्जी होवे तो लगावो सा।`,
        te: item.req ? `దశ ${item.step}: ఇప్పుడు మీ మొబైల్ సంఖ్యను నమోదు చేయండి.` : `దశ ${item.step}: మొబైల్ సంఖ్య ఐచ్ఛికం.`,
        ta: item.req ? `படி ${item.step}: இப்போது உங்கள் மொபைல் எண்ணை உள்ளிடவும்.` : `படி ${item.step}: மொபைல் எண் விருப்பமானது.`,
        kn: item.req ? `ಹಂತ ${item.step}: ಈಗ ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.` : `ಹಂತ ${item.step}: ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಐಚ್ಛಿಕ.`,
        ml: item.req ? `ഘട്ടം ${item.step}: ഇനി നിങ്ങളുടെ മൊബൈൽ നമ്പർ നൽകുക.` : `ഘട്ടം ${item.step}: മൊബൈൽ നമ്പർ നിർബന്ധമല്ല.`,
        pa: item.req ? `ਕਦਮ ${item.step}: ਹੁਣ ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।` : `ਕਦਮ ${item.step}: ਮੋਬਾਈਲ ਨੰਬਰ ਵਿਕਲਪਿਕ ਹੈ।`,
        as: item.req ? `পদক্ষেপ ${item.step}: এতিয়া আপোনাৰ মোবাইল নম্বৰ দিয়ক।` : `পদক্ষেপ ${item.step}: মোবাইল নম্বৰ ঐচ্ছিক।`,
        bn: item.req ? `ধাপ ${item.step}: এবার আপনার মোবাইল নম্বর লিখুন।` : `ধাপ ${item.step}: মোবাইল নম্বর ঐচ্ছিক।`,
        or: item.req ? `ପଦକ୍ଷେପ ${item.step}: ଏବେ ଆପଣଙ୍କ ମୋବାଇଲ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ।` : `ପଦକ୍ଷେପ ${item.step}: ମୋବାଇଲ୍ ନମ୍ବର ଇଚ୍ଛାଧୀନ ଅଟେ।`,
        ur: item.req ? `مرحلہ ${item.step}: اب اپنا موبائل نمبر درج کریں۔` : `مرحلہ ${item.step}: موبائل نمبر اختیاری ہے۔`,
        es: item.req ? `Paso ${item.step}: Ahora ingrese su número de teléfono móvil.` : `Paso ${item.step}: El número de móvil es opcional.`,
        fr: item.req ? `Étape ${item.step} : Maintenant, entrez votre numéro de mobile.` : `Étape ${item.step} : Le numéro de mobile est facultatif.`,
        de: item.req ? `Schritt ${item.step}: Geben Sie nun Ihre Handynummer ein.` : `Schritt ${item.step}: Handynummer ist optional.`,
        ja: item.req ? `ステップ ${item.step}: 携帯電話番号を入力してください。` : `ステップ ${item.step}: 携帯電話番号は任意です。`,
        ar: item.req ? `الخطوة ${item.step}: الآن يرجى إدخال رقم هاتفك المحمول.` : `الخطوة ${item.step}: رقم الهاتف اختياري.`
      },
      "gw-email": {
        en: `Step ${item.step}: Please enter your Email Address.`,
        hi: `चरण ${item.step}: कृपया अपना ईमेल पता दर्ज करें।`,
        mr: `पायरी ${item.step}: कृपया आपला ईमेल पत्ता प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: કૃપા કરીને તમારું ઇમેઇલ સરનામું દાખલ કરો.`,
        mwr: `कदम ${item.step}: आपरो ईमेल पत्तो लगावो सा।`,
        te: `దశ ${item.step}: దయచేసి మీ ఇమెయిల్ చిరునామాను నమోదు చేయండి.`,
        ta: `படி ${item.step}: உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்.`,
        kn: `ಹಂತ ${item.step}: ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.`,
        ml: `ഘട്ടം ${item.step}: ദയവായി നിങ്ങളുടെ ഇമെയിൽ വിലാസം നൽകുക.`,
        pa: `ਕਦਮ ${item.step}: ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ।`,
        as: `পদক্ষেপ ${item.step}: আপোনাৰ ইমেইল ঠিকনা দিয়ক।`,
        bn: `ধাপ ${item.step}: আপনার ইমেল ঠিকানা লিখুন।`,
        or: `ପଦକ୍ଷେପ ${item.step}: ଦୟାକରି ଆପଣଙ୍କ ଇମେଲ୍ ଠିକଣା ପ୍ରବେଶ କରନ୍ତୁ।`,
        ur: `مرحلہ ${item.step}: براہ کرم اپنا ای میل ایڈریس درج کریں۔`,
        es: `Paso ${item.step}: Ingrese su dirección de correo electrónico.`,
        fr: `Étape ${item.step} : Entrez votre adresse e-mail.`,
        de: `Schritt ${item.step}: Geben Sie Ihre E-Mail-Adresse ein.`,
        ja: `ステップ ${item.step}: メールアドレスを入力してください。`,
        ar: `الخطوة ${item.step}: يرجى إدخال عنوان بريدك الإلكتروني.`
      },
      "gw-emp-id": {
        en: `Step ${item.step}: Please enter your verified Coordinator Employee ID, for example EMP-2026-101.`,
        hi: `चरण ${item.step}: अपना आधिकारिक कर्मचारी आईडी दर्ज करें, जैसे ईएमपी-2026-101।`,
        mr: `पायरी ${item.step}: आपला अधिकृत कर्मचारी आयडी प्रविष्ट करा, जसे ईएमपी-2026-101.`,
        gu: `પગલું ${item.step}: તમારું સત્તાવાર કર્મચારી ID દાખલ કરો, જેમ કે EMP-2026-101.`,
        mwr: `कदम ${item.step}: आपरी सरकारी कर्मचारी आईडी लगावो सा, जियां EMP-2026-101.`,
        te: `దశ ${item.step}: మీ ఉద్యోగి ఐడిని నమోదు చేయండి, ఉదాహరణకు EMP-2026-101.`,
        ta: `படி ${item.step}: உங்கள் பணியாளர் ஐடியை உள்ளிடவும், எ.கா. EMP-2026-101.`,
        kn: `ಹಂತ ${item.step}: ನಿಮ್ಮ ಉದ್ಯೋಗಿ ಐಡಿಯನ್ನು ನಮೂದಿಸಿ, ಉದಾಹರಣೆಗೆ EMP-2026-101.`,
        ml: `ഘട്ടം ${item.step}: നിങ്ങളുടെ ജീവനക്കാരുടെ ഐഡി നൽകുക, ഉദാഹരണത്തിന് EMP-2026-101.`,
        pa: `ਕਦਮ ${item.step}: ਆਪਣੀ ਕਰਮਚਾਰੀ ਆਈਡੀ ਦਰਜ ਕਰੋ, ਜਿਵੇਂ EMP-2026-101.`,
        as: `পদক্ষেপ ${item.step}: আপোনাৰ কৰ্মচাৰী আই-ডি দিয়ক, যেনে EMP-2026-101.`,
        bn: `ধাপ ${item.step}: আপনার কর্মচারী আইডি লিখুন, যেমন EMP-2026-101.`,
        or: `ପଦକ୍ଷେପ ${item.step}: ଆପଣଙ୍କ କର୍ମଚାରୀ ଆଇଡି ପ୍ରବେଶ କରନ୍ତୁ, ଯଥା EMP-2026-101.`,
        ur: `مرحلہ ${item.step}: اپنا ایمپلائی آئی ڈی درج کریں، مثلاً EMP-2026-101.`,
        es: `Paso ${item.step}: Ingrese su ID de empleado verificado, por ejemplo EMP-2026-101.`,
        fr: `Étape ${item.step} : Entrez votre identifiant employé, par exemple EMP-2026-101.`,
        de: `Schritt ${item.step}: Geben Sie Ihre Mitarbeiter-ID ein, z. B. EMP-2026-101.`,
        ja: `ステップ ${item.step}: 認可された従業員IDを入力してください（例: EMP-2026-101）。`,
        ar: `الخطوة ${item.step}: يرجى إدخال معرف الموظف المعتمد الخاص بك، مثل EMP-2026-101.`
      },
      "gw-password": {
        en: `Step ${item.step}: Please enter your Command Center Master Password.`,
        hi: `चरण ${item.step}: कमांड सेंटर मास्टर पासवर्ड दर्ज करें।`,
        mr: `पायरी ${item.step}: कमांड सेंटर मास्टर पासवर्ड प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: કમાન્ડ સેન્ટર માસ્ટર પાસવર્ડ દાખલ કરો.`,
        mwr: `कदम ${item.step}: मुख्य पासवर्ड लगावो सा।`,
        te: `దశ ${item.step}: మాస్టర్ పాస్‌వర్డ్‌ను నమోదు చేయండి.`,
        ta: `படி ${item.step}: முதன்மை கடவுச்சொல்லை உள்ளிடவும்.`,
        kn: `ಹಂತ ${item.step}: ಮಾಸ್ಟರ್ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.`,
        ml: `ഘട്ടം ${item.step}: മാസ്റ്റർ പാസ്‌വേഡ് നൽകുക.`,
        pa: `ਕਦਮ ${item.step}: ਮਾਸਟਰ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ।`,
        as: `পদক্ষেপ ${item.step}: মাষ্টাৰ পাছৱৰ্ড দিয়ক।`,
        bn: `ধাপ ${item.step}: মাস্টার পাসওয়ার্ড লিখুন।`,
        or: `ପଦକ୍ଷେପ ${item.step}: ମାଷ୍ଟର ପାସୱାର୍ଡ ପ୍ରବେଶ କରନ୍ତୁ।` ,
        ur: `مرحلہ ${item.step}: ماسٹر پاس ورڈ درج کریں۔`,
        es: `Paso ${item.step}: Ingrese la contraseña maestra del Centro de Mando.`,
        fr: `Étape ${item.step} : Entrez le mot de passe maître.`,
        de: `Schritt ${item.step}: Geben Sie das Hauptpasswort ein.`,
        ja: `ステップ ${item.step}: マスターパスワードを入力してください。`,
        ar: `الخطوة ${item.step}: يرجى إدخال كلمة المرور الرئيسية.`
      },
      "gw-address": {
        en: `Step ${item.step}: Finally, enter your Physical or Operating Address.`,
        hi: `चरण ${item.step}: अंत में अपना भौतिक या परिचालन पता दर्ज करें।`,
        mr: `पायरी ${item.step}: शेवटी आपला प्रत्यक्ष किंवा कामाचा पत्ता प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: છેલ્લે તમારું ભૌતિક અથવા કાર્યકારી સરનામું દાખલ કરો.`,
        mwr: `कदम ${item.step}: अब आपरो घर रो या काम रो पत्तो लिखो सा।`,
        te: `దశ ${item.step}: చివరిగా మీ భౌతిక లేదా నిర్వహణ చిరునామాను నమోదు చేయండి.`,
        ta: `படி ${item.step}: இறுதியாக உங்கள் நேரடி முகவரியை உள்ளிடவும்.`,
        kn: `ಹಂತ ${item.step}: ಕೊನೆಯದಾಗಿ ನಿಮ್ಮ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.`,
        ml: `ഘട്ടം ${item.step}: അവസാനമായി നിങ്ങളുടെ മേൽവിലാസം നൽകുക.`,
        pa: `ਕਦਮ ${item.step}: ਅੰਤ ਵਿੱਚ ਆਪਣਾ ਪਤਾ ਦਰਜ ਕਰੋ।`,
        as: `পদক্ষেপ ${item.step}: শেষত আপোনাৰ ঠিকনা প্ৰবিষ্টি কৰক।`,
        bn: `ধাপ ${item.step}: পরিশেষে আপনার কাজের বা বাড়ির ঠিকানা লিখুন।`,
        or: `ପଦକ୍ଷେପ ${item.step}: ଶେଷରେ ଆପଣଙ୍କ ଠିକଣା ପ୍ରବେଶ କରନ୍ତୁ।`,
        ur: `مرحلہ ${item.step}: آخر میں اپنا پتہ درج کریں۔`,
        es: `Paso ${item.step}: Finalmente, ingrese su dirección física u operativa.`,
        fr: `Étape ${item.step} : Enfin, entrez votre adresse physique ou d'exploitation.`,
        de: `Schritt ${item.step}: Geben Sie abschließend Ihre physische Adresse ein.`,
        ja: `ステップ ${item.step}: 最後に住所または事業所所在地を入力してください。`,
        ar: `الخطوة ${item.step}: أخيرًا، يرجى إدخال عنوانك الفعلي أو التشغيلي.`
      }
    };

    const dict = promptsByField[item.id] || {};
    return dict[lang] || dict["en"] || `Please enter ${item.label}`;
  }

  onFieldInput(fieldId) {
    if (!this.isEnabled) return;
    const currentItem = this.fieldsSequence[this.currentStepIndex];
    if (!currentItem || currentItem.id !== fieldId) return;

    const el = document.getElementById(fieldId);
    const val = (el ? el.value : "").trim();

    // Check if input satisfies minimum completion criteria
    let isSatisfied = false;
    if (fieldId === "gw-name" && val.length >= 3) isSatisfied = true;
    if (fieldId === "gw-phone" && val.length >= 8) isSatisfied = true;
    if (fieldId === "gw-email" && val.includes("@") && val.includes(".")) isSatisfied = true;
    if (fieldId === "gw-emp-id" && val.length >= 4) isSatisfied = true;
    if (fieldId === "gw-password" && val.length >= 4) isSatisfied = true;
    if (fieldId === "gw-address" && val.length >= 5) isSatisfied = true;

    if (isSatisfied) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.advanceToNextStep();
      }, 1200);
    }
  }

  onFieldBlur(fieldId) {
    if (!this.isEnabled) return;
    const currentItem = this.fieldsSequence[this.currentStepIndex];
    if (!currentItem || currentItem.id !== fieldId) return;

    const el = document.getElementById(fieldId);
    const val = (el ? el.value : "").trim();

    // On blur, if optional or filled, advance
    if (!currentItem.req || val.length >= 2) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.advanceToNextStep();
      }, 500);
    }
  }

  advanceToNextStep() {
    if (!this.isEnabled) return;
    const prevItem = this.fieldsSequence[this.currentStepIndex];
    if (prevItem) {
      const prevContainer = document.getElementById(prevItem.container);
      if (prevContainer) {
        prevContainer.classList.remove("tts-field-highlight");
        prevContainer.classList.add("tts-field-done");
      }
    }

    this.currentStepIndex++;
    if (this.currentStepIndex < this.fieldsSequence.length) {
      this.narrateCurrentStep();
    } else {
      // Completed!
      const submitBtn = document.getElementById("btn-gateway-submit");
      if (submitBtn) {
        submitBtn.classList.add("tts-field-highlight");
        submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const item = { isSubmit: true };
      const prompt = this.getFieldPrompt(item);
      this.speakPrompt(prompt);
    }
  }

  replayCurrentField() {
    if (!this.isEnabled) return;
    this.narrateCurrentStep();
  }

  speakPrompt(text, onEndCallback = null) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
      const localeMap = {
        hi: 'hi-IN', mr: 'mr-IN', gu: 'gu-IN', mwr: 'hi-IN', te: 'te-IN',
        ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', as: 'bn-IN',
        bn: 'bn-IN', or: 'hi-IN', ur: 'ur-PK', es: 'es-ES', fr: 'fr-FR',
        de: 'de-DE', ja: 'ja-JP', ar: 'ar-SA', en: 'en-IN'
      };
      utterance.lang = localeMap[lang] || 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => {
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = () => {
        if (onEndCallback) onEndCallback();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS narration speech error:", e);
      if (onEndCallback) onEndCallback();
    }
  }
}

// Global instance
const loginTTSNarrator = new LoginTTSNarrator();

function toggleLoginTTS() {
  loginTTSNarrator.toggle();
}

document.addEventListener("DOMContentLoaded", () => {
  loginTTSNarrator.init();
});
