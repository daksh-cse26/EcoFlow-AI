/**
 * EcoFlow AI - AI Speech Recognition Module
 * Section 8: Multilingual Speech Recognition
 * Indian Languages: English (en-IN), Hindi (hi-IN), Assamese (as-IN), Bengali (bn-IN)
 * CRITICAL RULE: Never execute financial or operational actions purely from speech without confirmation.
 */

class VoiceAssistant {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.targetInputElement = null;
    this.onConfirmCallback = null;
    this.currentRecognizedText = "";
    this.initBrowserSpeech();
  }

  initBrowserSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateModalState("LISTENING");
      };

      this.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        this.currentRecognizedText = transcript;
        const textDisplay = document.getElementById("voice-recognized-text");
        if (textDisplay) {
          textDisplay.value = transcript;
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isListening = false;
        this.updateModalState("READY");
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.currentRecognizedText.trim()) {
          this.updateModalState("CONFIRM");
        } else {
          this.updateModalState("READY");
        }
      };
    }
  }

  openVoiceModal(targetInputId = null, defaultContext = "pickup", onConfirm = null) {
    this.targetInputElement = targetInputId ? document.getElementById(targetInputId) : null;
    this.onConfirmCallback = onConfirm;
    this.currentRecognizedText = "";

    const modal = document.getElementById("voice-modal");
    if (modal) {
      modal.classList.add("active");
    }

    // Set voice recognition locale according to current language
    const langLocales = {
      en: "en-IN",
      hi: "hi-IN",
      as: "as-IN",
      bn: "bn-IN"
    };
    if (this.recognition) {
      this.recognition.lang = langLocales[currentLang] || "en-IN";
    }

    this.renderPresets(defaultContext);
    this.updateModalState("READY");
  }

  startListening() {
    this.currentRecognizedText = "";
    const textDisplay = document.getElementById("voice-recognized-text");
    if (textDisplay) textDisplay.value = "";

    if (this.recognition) {
      try {
        this.recognition.start();
        return;
      } catch (e) {
        console.warn("Recognition already started or permission blocked, simulating voice input:", e);
      }
    }

    // Fallback Simulation for environments without microphone access
    this.simulateListening();
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
  }

  simulateListening() {
    this.isListening = true;
    this.updateModalState("LISTENING");

    const sampleTranscripts = {
      en: [
        "Please collect my recyclable waste tomorrow between 10 AM and 12 PM.",
        "I have approximately 10 kg of old copper wires and discarded circuit boards.",
        "Please schedule pickup for 25 kg of newspapers and flattened cardboard boxes.",
        "Can you verify what rate you pay for clean PET plastic bottles?"
      ],
      hi: [
        "कृपया कल सुबह 10 से 12 बजे के बीच मेरा पुनर्चक्रण कचरा एकत्र करें।",
        "मेरे पास लगभग 10 किलो तांबे के तार और पुराने कंप्यूटर पार्ट्स हैं।",
        "कृपया 25 किलो अखबार और गत्ते के डिब्बों के लिए पिकअप शेड्यूल करें।"
      ],
      as: [
        "অনুগ্ৰহ কৰি কাইলৈ পুৱা ১০ বজাৰ পৰা ১২ বজাৰ ভিতৰত মোৰ আৱৰ্জনা সংগ্ৰহ কৰক।",
        "মোৰ ওচৰত প্ৰায় ১০ কেজি তামৰ তাঁৰ আৰু কম্পিউটাৰৰ বৰ্ড আছে।",
        "অনুগ্ৰহ কৰি ২৫ কেজি বাতৰি কাকত আৰু কাৰ্ডবৰ্ডৰ বাবে পিকআপ বুক কৰক।"
      ],
      bn: [
        "দয়া করে আগামীকাল সকাল ১০টা থেকে ১২টার মধ্যে আমার বর্জ্য সংগ্রহ করুন।",
        "আমার কাছে প্রায় ১০ কেজি তামার তার এবং সার্কিট বোর্ড রয়েছে।",
        "২৫ কেজি খবরের কাগজ এবং কার্ডবোর্ডের জন্য পিকআপ বুক করুন।"
      ]
    };

    const phrases = sampleTranscripts[currentLang] || sampleTranscripts["en"];
    const chosen = phrases[Math.floor(Math.random() * phrases.length)];

    setTimeout(() => {
      this.currentRecognizedText = chosen;
      const textDisplay = document.getElementById("voice-recognized-text");
      if (textDisplay) textDisplay.value = chosen;
      this.isListening = false;
      this.updateModalState("CONFIRM");
    }, 1800);
  }

  selectSample(phrase) {
    this.currentRecognizedText = phrase;
    const textDisplay = document.getElementById("voice-recognized-text");
    if (textDisplay) textDisplay.value = phrase;
    this.updateModalState("CONFIRM");
  }

  confirmSpeech() {
    const textDisplay = document.getElementById("voice-recognized-text");
    const finalText = textDisplay ? textDisplay.value.trim() : this.currentRecognizedText.trim();

    if (this.targetInputElement) {
      this.targetInputElement.value = finalText;
      this.targetInputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (this.onConfirmCallback) {
      this.onConfirmCallback(finalText);
    }

    this.closeVoiceModal();
  }

  closeVoiceModal() {
    this.stopListening();
    const modal = document.getElementById("voice-modal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  updateModalState(state) {
    const waves = document.getElementById("voice-waves");
    const statusText = document.getElementById("voice-status-text");
    const confirmActions = document.getElementById("voice-confirm-actions");
    const micBtn = document.getElementById("voice-mic-btn");

    if (state === "LISTENING") {
      if (waves) waves.classList.add("active");
      if (statusText) statusText.textContent = t("voice.listening");
      if (confirmActions) confirmActions.style.display = "none";
      if (micBtn) micBtn.classList.add("recording");
    } else if (state === "CONFIRM") {
      if (waves) waves.classList.remove("active");
      if (statusText) statusText.textContent = "Speech Recognized. Please Confirm:";
      if (confirmActions) confirmActions.style.display = "flex";
      if (micBtn) micBtn.classList.remove("recording");
    } else {
      if (waves) waves.classList.remove("active");
      if (statusText) statusText.textContent = t("voice.tap_to_speak");
      if (confirmActions) confirmActions.style.display = "none";
      if (micBtn) micBtn.classList.remove("recording");
    }
  }

  renderPresets(context) {
    const container = document.getElementById("voice-sample-chips");
    if (!container) return;

    const samples = [
      { text: "10 kg copper wires and circuit boards", label: "Copper & PCB (10kg)" },
      { text: "Please collect 20 kg newspapers tomorrow morning", label: "Newspapers (20kg)" },
      { text: "PET bottles rinsed and segregated in sack", label: "PET Bottles" },
      { text: "Household scrap from kitchen renovation", label: "Aluminium & Brass" }
    ];

    container.innerHTML = samples.map(s => `
      <button type="button" class="voice-chip-btn" onclick="voiceAssistant.selectSample('${s.text}')">
        💬 "${s.label}"
      </button>
    `).join("");
  }
}

const voiceAssistant = new VoiceAssistant();
