/**
 * EcoFlow AI - Login Page Sequential Text-To-Speech (TTS) Narrator
 * Automatically reads out each login field aloud line-by-line in the active language,
 * and advances to the next field as the user completes entering data.
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

  updateToggleUI() {
    const btn = document.getElementById("btn-tts-toggle");
    const label = document.getElementById("tts-toggle-text");
    const repeatBtn = document.getElementById("btn-tts-speak-again");
    const bar = document.getElementById("gateway-tts-bar");

    if (this.isEnabled) {
      if (btn) btn.classList.add("active");
      if (label) label.textContent = (typeof t === 'function' ? t('tts.voice_guide_on', "Voice Guide: ON 🔊") : "Voice Guide: ON 🔊");
      if (repeatBtn) repeatBtn.style.display = "inline-flex";
      if (bar) bar.classList.add("active-narration");
    } else {
      if (btn) btn.classList.remove("active");
      if (label) label.textContent = (typeof t === 'function' ? t('tts.voice_guide_off', "Voice Guide: OFF 🔇") : "Voice Guide: OFF 🔇");
      if (repeatBtn) repeatBtn.style.display = "none";
      if (bar) bar.classList.remove("active-narration");
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

    // Welcome speech
    const roleTitleEl = document.getElementById("gateway-role-title");
    const roleName = roleTitleEl ? roleTitleEl.textContent : "EcoFlow AI";

    this.speakPrompt(`Welcome to EcoFlow AI. Active portal: ${roleName}. I will now guide you line by line.`, () => {
      this.narrateCurrentStep();
    });
  }

  stopNarrator() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
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

    this.speakPrompt(`Switched interface to ${roleName}. Let's fill your credentials.`, () => {
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
        hi: "सभी विवरण दर्ज हो चुके हैं। कृपया पोर्टल में प्रवेश करने के लिए 'प्रमाणीकृत करें' बटन दबाएं।",
        mr: "सर्व तपशील भरले गेले आहेत. पोर्टलमध्ये जाण्यासाठी कृपया 'प्रमाणीकृत करा' बटण दाबा.",
        gu: "બધી વિગતો દાખલ થઈ ગઈ છે. પોર્ટલમાં પ્રવેશવા માટે કૃપા કરીને 'પ્રમાણિત કરો' બટન દબાવો.",
        mwr: "सगळी जानकारी भर दी गई है सा। पोर्टल माथे जाण खातर बटन दबावो।",
        te: "అన్ని వివరాలు నమోదు చేయబడ్డాయి. పోర్టల్‌లోకి ప్రవేశించడానికి ದಯచేసి ప్రామాణీకరించండి బటన్‌ను నొక్కండి.",
        ta: "அனைத்து விவரங்களும் பூர்த்தி செய்யப்பட்டன. போர்ட்டலில் நுழைய அங்கீகரிக்கும் பொத்தானை அழுத்தவும்.",
        as: "সকলো তথ্য প্ৰবিষ্টি কৰা হ'ল। পৰ্টেলত প্ৰৱেশ কৰিবলৈ প্ৰমাণীকৰণ বুটাম টিপক।",
        bn: "সমস্ত বিবরণ সম্পন্ন হয়েছে। পোর্টালে প্রবেশ করতে প্রমাণীকরণ বোতাম টিপুন।",
        es: "¡Todos los campos completos! Presione el botón Autenticar para ingresar.",
        fr: "Tous les champs sont remplis ! Appuyez sur Authentifier pour entrer.",
        de: "Alle Angaben vollständig! Drücken Sie auf Authentifizieren, um fortzufahren.",
        ja: "すべての入力が完了しました。認証ボタンを押してポータルに入ってください。",
        ar: "تم إدخال جميع البيانات بنجاح! اضغط على زر المصادقة للدخول إلى البوابة.",
        en: "All details have been entered successfully. Please press the Authenticate and Enter button to proceed into your portal."
      };
      return prompts[lang] || prompts["en"];
    }

    // Prompts by Field ID
    const promptsByField = {
      "gw-name": {
        hi: `चरण ${item.step}: कृपया अपना पूरा नाम दर्ज करें।`,
        mr: `पायरी ${item.step}: कृपया आपले पूर्ण नाव प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.`,
        mwr: `कदम ${item.step}: आपरो पूरो नाम लगावो सा।`,
        te: `దశ ${item.step}: దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.`,
        ta: `படி ${item.step}: தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்.`,
        as: `পদক্ষেপ ${item.step}: অনুগ্ৰহ কৰি আপোনাৰ সম্পূৰ্ণ নাম দিয়ক।`,
        bn: `ধাপ ${item.step}: দয়া করে আপনার পুরো নাম লিখুন।`,
        es: `Paso ${item.step}: Por favor ingrese su nombre completo.`,
        fr: `Étape ${item.step} : Veuillez entrer votre nom complet.`,
        de: `Schritt ${item.step}: Bitte geben Sie Ihren vollständigen Namen ein.`,
        ja: `ステップ ${item.step}: 氏名を入力してください。`,
        ar: `الخطوة ${item.step}: يرجى إدخال اسمك الكامل.`,
        en: `Step ${item.step}: Please enter your Full Name.`
      },
      "gw-phone": {
        hi: item.req ? `चरण ${item.step}: अब अपना मोबाइल नंबर दर्ज करें।` : `चरण ${item.step}: मोबाइल नंबर वैकल्पिक है, यदि है तो दर्ज करें।`,
        mr: item.req ? `पायरी ${item.step}: आता आपला मोबाईल नंबर प्रविष्ट करा.` : `पायरी ${item.step}: मोबाईल नंबर पर्यायी आहे, असल्यास टाका.`,
        gu: `પગલું ${item.step}: હવે તમારો મોબાઇલ નંબર દાખલ કરો.`,
        mwr: `कदम ${item.step}: अब आपरो मोबाइल नंबर लगावो सा।`,
        te: `దశ ${item.step}: ఇప్పుడు మీ మొబైల్ సంఖ్యను నమోదు చేయండి.`,
        ta: `படி ${item.step}: இப்போது உங்கள் மொபைல் எண்ணை உள்ளிடவும்.`,
        as: `পদক্ষেপ ${item.step}: এতিয়া আপোনাৰ মোবাইল নম্বৰ দিয়ক।`,
        bn: `ধাপ ${item.step}: এবার আপনার মোবাইল নম্বর লিখুন।`,
        es: `Paso ${item.step}: Ahora ingrese su número de teléfono móvil.`,
        fr: `Étape ${item.step} : Maintenant, entrez votre numéro de mobile.`,
        de: `Schritt ${item.step}: Geben Sie nun Ihre Handynummer ein.`,
        ja: `ステップ ${item.step}: 携帯電話番号を入力してください。`,
        ar: `الخطوة ${item.step}: الآن يرجى إدخال رقم هاتفك المحمول.`,
        en: item.req ? `Step ${item.step}: Now enter your Mobile Number.` : `Step ${item.step}: Mobile number is optional. You may enter it or leave it blank.`
      },
      "gw-email": {
        hi: `चरण ${item.step}: कृपया अपना ईमेल पता दर्ज करें।`,
        mr: `पायरी ${item.step}: कृपया आपला ईमेल पत्ता प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: કૃપા કરીને તમારું ઇમેઇલ સરનામું દાખલ કરો.`,
        mwr: `कदम ${item.step}: आपरो ईमेल पत्तो लगावो सा।`,
        te: `దశ ${item.step}: దయచేసి మీ ఇమెయిల్ చిరునామాను నమోదు చేయండి.`,
        ta: `படி ${item.step}: உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்.`,
        as: `পদক্ষেপ ${item.step}: আপোনাৰ ইমেইল ঠিকনা দিয়ক।`,
        bn: `ধাপ ${item.step}: আপনার ইমেল ঠিকানা লিখুন।`,
        es: `Paso ${item.step}: Ingrese su dirección de correo electrónico.`,
        fr: `Étape ${item.step} : Entrez votre adresse e-mail.`,
        de: `Schritt ${item.step}: Geben Sie Ihre E-Mail-Adresse ein.`,
        ja: `ステップ ${item.step}: メールアドレスを入力してください。`,
        ar: `الخطوة ${item.step}: يرجى إدخال عنوان بريدك الإلكتروني.`,
        en: `Step ${item.step}: Please enter your Email Address.`
      },
      "gw-emp-id": {
        hi: `चरण ${item.step}: अपना आधिकारिक कर्मचारी आईडी दर्ज करें, जैसे ईएमपी-2026-101।`,
        mr: `पायरी ${item.step}: आपला अधिकृत कर्मचारी आयडी प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: તમારું સત્તાવાર કર્મચારી ID દાખલ કરો.`,
        mwr: `कदम ${item.step}: आपरी सरकारी कर्मचारी आईडी लगावो सा।`,
        te: `దశ ${item.step}: మీ ఉద్యోగి ఐడిని నమోదు చేయండి.`,
        ta: `படி ${item.step}: உங்கள் பணியாளர் ஐடியை உள்ளிடவும்.`,
        as: `পদক্ষেপ ${item.step}: আপোনাৰ কৰ্মচাৰী আই-ডি দিয়ক।`,
        bn: `ধাপ ${item.step}: আপনার কর্মচারী আইডি লিখুন।`,
        es: `Paso ${item.step}: Ingrese su ID de empleado verificado.`,
        fr: `Étape ${item.step} : Entrez votre identifiant employé vérifié.`,
        de: `Schritt ${item.step}: Geben Sie Ihre verifizierte Mitarbeiter-ID ein.`,
        ja: `ステップ ${item.step}: 認可された従業員IDを入力してください。`,
        ar: `الخطوة ${item.step}: يرجى إدخال معرف الموظف المعتمد الخاص بك.`,
        en: `Step ${item.step}: Please enter your verified Coordinator Employee ID, for example EMP-2026-101.`
      },
      "gw-password": {
        hi: `चरण ${item.step}: कमांड सेंटर मास्टर पासवर्ड दर्ज करें।`,
        mr: `पायरी ${item.step}: मास्टर पासवर्ड प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: માસ્ટર પાસવર્ડ દાખલ કરો.`,
        mwr: `कदम ${item.step}: मुख्य पासवर्ड लगावो सा।`,
        te: `దశ ${item.step}: మాస్టర్ పాస్‌వర్డ్‌ను నమోదు చేయండి.`,
        ta: `படி ${item.step}: முதன்மை கடவுச்சொல்லை உள்ளிடவும்.`,
        as: `পদক্ষেপ ${item.step}: মাষ্টাৰ পাছৱৰ্ড দিয়ক।`,
        bn: `ধাপ ${item.step}: মাস্টার পাসওয়ার্ড লিখুন।`,
        es: `Paso ${item.step}: Ingrese la contraseña maestra del Centro de Mando.`,
        fr: `Étape ${item.step} : Entrez le mot de passe maître.`,
        de: `Schritt ${item.step}: Geben Sie das Hauptpasswort ein.`,
        ja: `ステップ ${item.step}: マスターパスワードを入力してください。`,
        ar: `الخطوة ${item.step}: يرجى إدخال كلمة المرور الرئيسية.`,
        en: `Step ${item.step}: Please enter your Command Center Master Password.`
      },
      "gw-address": {
        hi: `चरण ${item.step}: अंत में अपना भौतिक या परिचालन पता दर्ज करें।`,
        mr: `पायरी ${item.step}: शेवटी आपला प्रत्यक्ष किंवा कामाचा पत्ता प्रविष्ट करा.`,
        gu: `પગલું ${item.step}: છેલ્લે તમારું ભૌતિક અથવા કાર્યકારી સરનામું દાખલ કરો.`,
        mwr: `कदम ${item.step}: अब आपरो घर रो या काम रो पत्तो लिखो सा।`,
        te: `దశ ${item.step}: చివరిగా మీ భౌతిక లేదా నిర్వహణ చిరునామాను నమోదు చేయండి.`,
        ta: `படி ${item.step}: இறுதியாக உங்கள் நேரடி முகவரியை உள்ளிடவும்.`,
        as: `পদক্ষেপ ${item.step}: শেষত আপোনাৰ ঠিকনা প্ৰবিষ্টি কৰক।`,
        bn: `ধাপ ${item.step}: পরিশেষে আপনার কাজের বা বাড়ির ঠিকানা লিখুন।`,
        es: `Paso ${item.step}: Finalmente, ingrese su dirección física u operativa.`,
        fr: `Étape ${item.step} : Enfin, entrez votre adresse physique ou d'exploitation.`,
        de: `Schritt ${item.step}: Geben Sie abschließend Ihre physische Adresse ein.`,
        ja: `ステップ ${item.step}: 最後に住所または事業所所在地を入力してください。`,
        ar: `الخطوة ${item.step}: أخيرًا، يرجى إدخال عنوانك الفعلي أو التشغيلي.`,
        en: `Step ${item.step}: Finally, enter your Physical or Operating Address.`
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
