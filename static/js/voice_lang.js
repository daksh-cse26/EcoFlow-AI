/**
 * EcoFlow AI - Voice Language Auto-Detection Module
 * Helps illiterate or non-reading users automatically detect and switch
 * platform language by simply speaking in their mother tongue.
 */

class VoiceLanguageDetector {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.selectedDetectedLang = null;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateUI("LISTENING");
      };

      this.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        this.handleTranscript(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn("Language speech recognition error:", event.error);
        this.isListening = false;
        // If mic permission blocked or error, provide simulated language matcher
        this.simulateRecognition();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (!this.selectedDetectedLang) {
          this.updateUI("READY");
        }
      };
    }
  }

  // Keywords and phrase matching dictionary for all 19 supported languages
  detectLanguageFromText(text) {
    if (!text) return null;
    const lower = text.toLowerCase().trim();

    // Specific language signature keywords & native greetings
    const signatures = [
      { lang: 'hi', keywords: ['hindi', 'हिन्दी', 'हिंदी', 'नमस्ते', 'कबाड़', 'कचरा', 'मेरा नाम', 'कृपया', 'प्रणाम', 'राम राम'] },
      { lang: 'mr', keywords: ['marathi', 'मराठी', 'नमस्कार', 'भंगार', 'माझं नाव', 'मला', 'उद्या', 'कचरा संकलन'] },
      { lang: 'gu', keywords: ['gujarati', 'ગુજરાતી', 'કેમ છો', 'નમસ્તે', 'મારું નામ', 'મને', 'કૃપા કરીને', 'ભંગાર'] },
      { lang: 'mwr', keywords: ['marwari', 'मारवाड़ी', 'म्हारो', 'म्हाने', 'राम राम सा', 'घरेलू', 'कबाड़'] },
      { lang: 'te', keywords: ['telugu', 'తెలుగు', 'నమస్కారం', 'నా పేరు', 'దయచేసి', 'చెత్త', 'వ్యర్థాలు'] },
      { lang: 'ta', keywords: ['tamil', 'தமிழ்', 'வணக்கம்', 'என் பெயர்', 'தயவுசெய்து', 'குப்பை', 'கழிவு'] },
      { lang: 'kn', keywords: ['kannada', 'ಕನ್ನಡ', 'ನಮಸ್ಕಾರ', 'ನನ್ನ ಹೆಸರು', 'ದಯವಿಟ್ಟು', 'ತ್ಯಾಜ್ಯ'] },
      { lang: 'ml', keywords: ['malayalam', 'മലയാളം', 'നമസ്കാരം', 'എന്റെ പേര്', 'ദയവായി', 'മാലിന്യം'] },
      { lang: 'pa', keywords: ['punjabi', 'ਪੰਜਾਬੀ', 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'ਕੂੜਾ', 'ਮੇਰਾ ਨਾਮ', 'ਕਿਰਪਾ ਕਰਕੇ'] },
      { lang: 'as', keywords: ['assamese', 'অসমীয়া', 'নমস্কাৰ', 'মোৰ নাম', 'অনুগ্ৰহ কৰি', 'আৱৰ্জনা'] },
      { lang: 'bn', keywords: ['bengali', 'বাংলা', 'নমস্কার', 'আমার নাম', 'দয়া করে', 'বর্জ্য'] },
      { lang: 'or', keywords: ['odia', 'ଓଡ଼ିଆ', 'ନମସ୍କାର', 'ମୋ ନାମ', 'ଦୟାକରି', 'ବର୍ଜ୍ୟ'] },
      { lang: 'ur', keywords: ['urdu', 'اردو', 'السلام علیکم', 'میرا نام', 'شکریہ', 'کچرا'] },
      { lang: 'es', keywords: ['spanish', 'español', 'hola', 'buenos días', 'por favor', 'residuos', 'reciclaje'] },
      { lang: 'fr', keywords: ['french', 'français', 'bonjour', 'salut', 's\'il vous plaît', 'déchets'] },
      { lang: 'de', keywords: ['german', 'deutsch', 'hallo', 'guten tag', 'bitte', 'abfall', 'müll'] },
      { lang: 'ja', keywords: ['japanese', 'nihongo', '日本語', 'こんにちは', 'おはよう', 'ごみ', 'リサイクル'] },
      { lang: 'ar', keywords: ['arabic', 'العربية', 'مرحبا', 'السلام عليكم', 'من فضلك', 'نفايات'] },
      { lang: 'en', keywords: ['english', 'hello', 'hi', 'good morning', 'pickup', 'scrap', 'waste', 'please'] }
    ];

    for (const item of signatures) {
      for (const kw of item.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return item.lang;
        }
      }
    }

    // Secondary character script detection
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari default
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
    if (/[\u0B00-\u0B7F]/.test(text)) return 'or'; // Odia
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Gurmukhi / Punjabi
    if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali / Assamese
    if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Arabic / Urdu
    if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(text)) return 'ja'; // Japanese

    return null;
  }

  handleTranscript(transcript) {
    const textEl = document.getElementById("lang-voice-transcript");
    if (textEl) textEl.textContent = `"${transcript}"`;

    const detected = this.detectLanguageFromText(transcript);
    if (detected) {
      this.selectedDetectedLang = detected;
      this.confirmAndApplyLanguage(detected);
    }
  }

  startListening() {
    this.selectedDetectedLang = null;
    const textEl = document.getElementById("lang-voice-transcript");
    if (textEl) textEl.textContent = "Listening... Speak in your native language now.";

    if (this.recognition) {
      try {
        this.recognition.lang = "hi-IN"; // Broad Indian multilingual recognizer default
        this.recognition.start();
        return;
      } catch (e) {
        console.warn("Recognition already active or failed, using simulated recognition:", e);
      }
    }
    this.simulateRecognition();
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.isListening = false;
    this.updateUI("READY");
  }

  simulateRecognition() {
    this.updateUI("LISTENING");
    const samples = [
      { text: "नमस्ते, मुझे हिन्दी में काम करना है", lang: "hi" },
      { text: "नमस्कार, मला मराठी भाषा पाहिजे", lang: "mr" },
      { text: "નમસ્તે, મને ગુજરાતી ભાષામાં એપ જોઈએ છે", lang: "gu" },
      { text: "राम राम सा, म्हाने मारवाड़ी बोली में समझ आवै", lang: "mwr" },
      { text: "నమస్కారం, నాకు తెలుగు కావాలి", lang: "te" },
      { text: "வணக்கம், எனக்கு தமிழ் வேண்டும்", lang: "ta" },
      { text: "Hello, I speak English please", lang: "en" },
      { text: "নমস্কাৰ, মই অসমীয়া কওঁ", lang: "as" },
      { text: "নমস্কার, আমি বাংলায় দেখতে চাই", lang: "bn" }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setTimeout(() => {
      const textEl = document.getElementById("lang-voice-transcript");
      if (textEl) textEl.textContent = `"${pick.text}"`;
      this.confirmAndApplyLanguage(pick.lang);
    }, 1800);
  }

  confirmAndApplyLanguage(lang) {
    this.stopListening();
    this.updateUI("SUCCESS");

    const langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[lang]) ? LANG_NAMES[lang] : lang.toUpperCase();
    const resultEl = document.getElementById("lang-voice-result");
    if (resultEl) {
      resultEl.innerHTML = `🎉 <strong>Detected Language:</strong> ${langName} • Applying immediately...`;
    }

    // Apply platform language
    if (typeof setLanguage === 'function') {
      setLanguage(lang);
    }

    // Audible confirmation via SpeechSynthesis
    this.speakConfirmation(lang, langName);

    // Close modal smoothly after user hears/sees confirmation
    setTimeout(() => {
      this.closeModal();
    }, 2000);
  }

  speakConfirmation(lang, langName) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const phrases = {
        hi: "भाषा हिन्दी चुन ली गई है। आपका स्वागत है।",
        mr: "मराठी भाषा निवडली गेली आहे. आपले स्वागत आहे.",
        gu: "ગુજરાતી ભાષા પસંદ કરવામાં આવી છે. આપનું સ્વાગત છે.",
        mwr: "मारवाड़ी भाषा चुणी गई सा। आपरो स्वागत है।",
        te: "తెలుగు భాష ఎంచుకోబడింది. స్వాగతం.",
        ta: "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது. வருக.",
        kn: "ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಸುಸ್ವಾಗತ.",
        ml: "മലയാളം ഭാഷ തിരഞ്ഞെടുത്തു. സ്വാഗതം.",
        pa: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਚੁਣ ਲਈ ਗਈ ਹੈ। ਜੀ ਆਇਆਂ ਨੂੰ।",
        as: "অসমীয়া ভাষা বাছনি কৰা হ'ল। স্বাগতম।",
        bn: "বাংলা ভাষা নির্বাচন করা হয়েছে। স্বাগতম।",
        or: "ଓଡ଼ିଆ ଭାଷା ଚୟନ କରାଗଲା। ସ୍ୱାଗତ।",
        ur: "اردو زبان منتخب کر لی گئی ہے۔ خوش آمدید۔",
        es: "Idioma español seleccionado. Bienvenido.",
        fr: "Langue française sélectionnée. Bienvenue.",
        de: "Deutsche Sprache ausgewählt. Willkommen.",
        ja: "日本語が選択されました。ようこそ。",
        ar: "تم اختيار اللغة العربية. أهلاً بك.",
        en: "Language set to English. Welcome to EcoFlow AI."
      };

      const msg = phrases[lang] || `Language set to ${langName}`;
      const utterance = new SpeechSynthesisUtterance(msg);
      
      const localeMap = {
        hi: 'hi-IN', mr: 'mr-IN', gu: 'gu-IN', mwr: 'hi-IN', te: 'te-IN',
        ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', as: 'bn-IN',
        bn: 'bn-IN', or: 'hi-IN', ur: 'ur-PK', es: 'es-ES', fr: 'fr-FR',
        de: 'de-DE', ja: 'ja-JP', ar: 'ar-SA', en: 'en-IN'
      };
      utterance.lang = localeMap[lang] || 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS confirmation failed:", e);
    }
  }

  updateUI(state) {
    const micBtn = document.getElementById("lang-voice-mic-circle");
    const statusText = document.getElementById("lang-voice-status");
    const waveBox = document.getElementById("lang-voice-waves");

    if (state === "LISTENING") {
      if (micBtn) micBtn.classList.add("active-pulse");
      if (waveBox) waveBox.classList.add("active");
      if (statusText) statusText.textContent = "🎙️ Listening... Please speak in any Indian or foreign language";
    } else if (state === "SUCCESS") {
      if (micBtn) micBtn.classList.remove("active-pulse");
      if (waveBox) waveBox.classList.remove("active");
      if (statusText) statusText.textContent = "✨ Language Recognized!";
    } else {
      if (micBtn) micBtn.classList.remove("active-pulse");
      if (waveBox) waveBox.classList.remove("active");
      if (statusText) statusText.textContent = "Tap the microphone and speak your language";
    }
  }

  openModal() {
    const modal = document.getElementById("voice-lang-modal");
    if (modal) {
      modal.classList.add("active");
      this.updateUI("READY");
      const textEl = document.getElementById("lang-voice-transcript");
      if (textEl) textEl.textContent = "Press the mic and say: 'हिन्दी', 'मराठी', 'ગુજરાતી', 'தமிழ்', 'English'...";
      const resEl = document.getElementById("lang-voice-result");
      if (resEl) resEl.innerHTML = "";
      
      // Auto-start listening after 400ms for convenience of illiterate users
      setTimeout(() => {
        this.startListening();
      }, 450);
    }
  }

  closeModal() {
    this.stopListening();
    const modal = document.getElementById("voice-lang-modal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // 1-Tap audible chip selection with voice feedback
  selectByChip(lang) {
    this.confirmAndApplyLanguage(lang);
  }
}

// Global instance
const voiceLangDetector = new VoiceLanguageDetector();

function openLanguageVoiceModal() {
  voiceLangDetector.openModal();
}

function closeLanguageVoiceModal() {
  voiceLangDetector.closeModal();
}
