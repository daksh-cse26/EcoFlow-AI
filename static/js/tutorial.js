/**
 * EcoFlow AI - Interactive Step-by-Step Tutorial Guide & Feature Video Demonstrations
 * STRICT REQUIREMENT: Only enabled and visible in Household and Field Collector interfaces.
 */

class TutorialController {
  constructor() {
    this.currentContext = null; // 'household' or 'collector'
    this.currentStepIndex = 0;
    this.isPlayingVideo = false;
    this.videoTimer = null;
    this.videoCurrentTime = 0;
    this.videoDuration = 20; // 20 seconds standard per video
    this.videoSpeed = 1.0;
    this.videoVoiceoverEnabled = true;
    this.activeVideoKey = null;

    // Household Tutorial Steps
    this.householdSteps = [
      {
        id: "hh_impact",
        title: "🌱 1. Verified Recycling Impact",
        targetSelector: ".impact-grid",
        desc: "Track your environmental impact in real-time. View verified kilograms of scrap, total completed pickups, your segregation cleanliness score (up to 100), and how many times your weight estimates matched the hub's scale!",
        videoKey: "hh_impact",
        icon: "⚖️"
      },
      {
        id: "hh_scanner",
        title: "📸 2. Local AI Waste Scanner",
        targetSelector: "#hh-tab-scan",
        desc: "Scan scrap using on-device regional Indian AI neural models. Test copper wires, computer circuit boards, newspapers, PET bottles, or aluminium. The AI identifies materials and gives segregation recommendations with preliminary pricing!",
        videoKey: "hh_scanner",
        icon: "🎯"
      },
      {
        id: "hh_pickup",
        title: "📅 3. Schedule Doorstep Pickup",
        targetSelector: "#hh-tab-pickups",
        desc: "Book a certified field collector pickup in seconds. Pick your address, select your preferred date and time slot, add landmark notes, and send your request. Our smart zonal coordinator automatically assigns the nearest available collector!",
        videoKey: "hh_pickup",
        icon: "📦"
      },
      {
        id: "hh_settlement",
        title: "🧾 4. Transparent Settlement Formula",
        targetSelector: "#hh-tab-settlement",
        desc: "Never get cheated on scrap prices! Settlements are strictly calculated using: Verified Hub Weight × Company Buying Rate. If your weight matches within ±5%, you earn special Cleaner & Greener eco bonuses!",
        videoKey: "hh_settlement",
        icon: "🎉"
      },
      {
        id: "hh_rewards",
        title: "🎁 5. Eco Rewards & Multilingual Voice",
        targetSelector: "#hh-tab-rewards",
        desc: "Earn carbon offset tokens and rewards for proper segregation. Tap the voice assistant icon at any time to speak in 19 Indian & global languages to dictate notes and instructions!",
        videoKey: "hh_rewards",
        icon: "🎙️"
      }
    ];

    // Field Collector Tutorial Steps
    this.collectorSteps = [
      {
        id: "col_modes",
        title: "📱 1. Three Operating Modes",
        targetSelector: ".portal-subnav-bar",
        desc: "Field collectors can work in 3 ways: Mode 1 via Smartphone App with GPS, Mode 2 via Two-Way Interactive SMS for basic button phones, or Mode 3 via Printed Physical Coordinator Dispatch Sheets!",
        videoKey: "col_modes",
        icon: "🚚"
      },
      {
        id: "col_assignment",
        title: "📍 2. Active Collection Assignment",
        targetSelector: "#collector-pane-mode1",
        desc: "View assigned doorstep pickups with household addresses, scrap categories, and customer phone numbers. Navigate directly to the doorstep and inspect the scrap before sealing.",
        videoKey: "col_assignment",
        icon: "🏠"
      },
      {
        id: "col_seallot",
        title: "📦 3. Seal & Generate Waste Lot QR",
        targetSelector: ".hub-card",
        desc: "Weigh the collected scrap on your portable scale, pack it into a secure sack, and tap 'Seal Waste Lot'. An encrypted QR code is stamped onto the lot, permanently locking the household identity and pickup ID.",
        videoKey: "col_seallot",
        icon: "🏷️"
      },
      {
        id: "col_transfer",
        title: "⚖️ 4. Transfer to Storage Hub Station",
        targetSelector: ".hub-card",
        desc: "Deliver sealed lots to the municipal Storage Hub. The hub operator scans the lot QR on their digital platform scale to verify material grade, physical weight, and trigger instant settlements.",
        videoKey: "col_transfer",
        icon: "🏭"
      },
      {
        id: "col_grassroots",
        title: "📴 5. Grassroots Peer Registration (COL-NP)",
        targetSelector: "#collector-pane-mode1",
        desc: "Empower informal waste-pickers without phones. Register them directly to generate an official COL-NP token with physical printable pass. Full zero-knowledge privacy ensures their data is purged from your phone.",
        videoKey: "col_grassroots",
        icon: "📴"
      }
    ];

    // Video Catalog Data (Household & Collector)
    this.videos = {
      // Household Videos
      hh_impact: {
        title: "Verified Recycling & Weight Match Overview",
        subtitle: "How verified weights, segregation scores, and green incentives work",
        interface: "household",
        duration: 22,
        steps: [
          { time: 0, text: "Household dashboard shows verified recycling weight from Storage Hub.", visual: "counter" },
          { time: 6, text: "Segregation score increases when dry and wet waste are segregated.", visual: "score" },
          { time: 13, text: "When your estimate matches hub scale weight within ±5%, celebration unlocks!", visual: "match" },
          { time: 18, text: "Transparent receipts show verified weight multiplied by company buying rate.", visual: "settlement" }
        ]
      },
      hh_scanner: {
        title: "Local AI Waste Scanner Demonstration",
        subtitle: "Neural on-device waste classification with regional Indian presets",
        interface: "household",
        duration: 24,
        steps: [
          { time: 0, text: "Point camera or select regional scrap preset like Copper Wires or PCB.", visual: "scan_camera" },
          { time: 7, text: "On-device AI analyzes visual texture, copper sheen, and solder points.", visual: "scan_ai" },
          { time: 14, text: "Classification complete: Copper Wires (94.4% Confidence, Segregation 93/100).", visual: "scan_result" },
          { time: 19, text: "Instant indicative price calculated: ₹5,800. Tap to schedule doorstep pickup!", visual: "scan_price" }
        ]
      },
      hh_pickup: {
        title: "Booking a Doorstep Scrap Pickup",
        subtitle: "Confirmed location, preferred date/time slots, and zonal collector assignment",
        interface: "household",
        duration: 20,
        steps: [
          { time: 0, text: "Open Request Pickup modal from Home or Scanner screen.", visual: "pickup_open" },
          { time: 5, text: "Confirm your household address on the interactive location map.", visual: "pickup_map" },
          { time: 11, text: "Choose preferred date and convenient time slot (e.g. 10 AM - 12 PM).", visual: "pickup_slot" },
          { time: 16, text: "Request confirmed! Nearest zonal collector receives assignment immediately.", visual: "pickup_done" }
        ]
      },
      hh_settlement: {
        title: "Transparent Digital Settlements & Tolerance Matches",
        subtitle: "Verified Weight × Buying Rate with zero hidden deductions",
        interface: "household",
        duration: 22,
        steps: [
          { time: 0, text: "Field collector delivers your scrap lot to the official Storage Hub.", visual: "settle_hub" },
          { time: 6, text: "Hub digital scale verifies physical weight (e.g. 10.0 kg).", visual: "settle_scale" },
          { time: 12, text: "Celebration popup triggers: Congratulations! Cleaner & Greener Environment!", visual: "settle_celeb" },
          { time: 17, text: "Final payment calculated: 10.0 kg × ₹504.40/kg = ₹5,044.00 direct settlement.", visual: "settle_calc" }
        ]
      },
      hh_rewards: {
        title: "Eco Rewards & Multilingual Voice Guide",
        subtitle: "Earning green tokens and dictating notes in 19 Indian languages",
        interface: "household",
        duration: 20,
        steps: [
          { time: 0, text: "Earn Eco Reward tokens for every kilogram of verified segregated waste.", visual: "reward_tokens" },
          { time: 6, text: "Tap the Voice Assistant button to speak instructions in your mother tongue.", visual: "reward_mic" },
          { time: 12, text: "Speech recognition converts spoken notes into verified pickup instructions.", visual: "reward_text" },
          { time: 16, text: "End-to-end QR digital chain ensures full traceability from your doorstep.", visual: "reward_qr" }
        ]
      },

      // Collector Videos
      col_modes: {
        title: "Three Multi-Mode Field Collector Workflows",
        subtitle: "Mode 1 Smartphone App, Mode 2 Basic SMS, Mode 3 Physical Sheets",
        interface: "collector",
        duration: 24,
        steps: [
          { time: 0, text: "EcoFlow empowers all collectors: smartphone users and basic phone users alike.", visual: "modes_intro" },
          { time: 6, text: "Mode 1: Smartphone app with GPS navigation, live assignments, and offline QR.", visual: "mode1_app" },
          { time: 13, text: "Mode 2: Two-way SMS interactive terminal for simple keypad phones.", visual: "mode2_sms" },
          { time: 19, text: "Mode 3: Printed coordinator dispatch sheets for non-phone collectors.", visual: "mode3_sheet" }
        ]
      },
      col_assignment: {
        title: "Receiving & Executing Collection Assignments",
        subtitle: "Live assignment cards, customer verification, and doorstep arrival",
        interface: "collector",
        duration: 22,
        steps: [
          { time: 0, text: "Toggle your status to ONLINE to receive nearby household pickup requests.", visual: "assign_online" },
          { time: 6, text: "New assignment card pops up with customer name, zone, and scrap category.", visual: "assign_card" },
          { time: 12, text: "Arrive at customer doorstep and perform preliminary physical check.", visual: "assign_doorstep" },
          { time: 17, text: "Customer confirms scrap handoff. Ready to weigh and seal lot!", visual: "assign_confirm" }
        ]
      },
      col_seallot: {
        title: "Sealing Digital Waste Lot & QR Generation",
        subtitle: "Tamper-evident lot sealing and end-to-end cryptographic QR code",
        interface: "collector",
        duration: 22,
        steps: [
          { time: 0, text: "Weigh the collected scrap sack using portable spring or digital scale.", visual: "seal_weigh" },
          { time: 6, text: "Enter collector observed weight (e.g. 10 kg Copper & E-Waste).", visual: "seal_input" },
          { time: 12, text: "Tap 'Seal & Generate Waste Lot QR'. Unique LOT-2026 QR is generated!", visual: "seal_qr" },
          { time: 17, text: "Tie tamper-evident seal. Digital custody is permanently locked on device.", visual: "seal_complete" }
        ]
      },
      col_transfer: {
        title: "Storage Hub Custody Transfer & Digital Weighing",
        subtitle: "Handoff to official hub digital scale verification station",
        interface: "collector",
        duration: 22,
        steps: [
          { time: 0, text: "Transport sealed lots to the designated municipal Storage Hub.", visual: "trans_arrive" },
          { time: 6, text: "Storage Hub authority scans your lot QR code at the intake station.", visual: "trans_scan" },
          { time: 12, text: "Calibrated digital scale weighs the lot to establish source of truth.", visual: "trans_scale" },
          { time: 17, text: "Lot verified! Immediate settlement released to household and collector logged.", visual: "trans_done" }
        ]
      },
      col_grassroots: {
        title: "Grassroots Peer Registration (Phone-less COL-NP)",
        subtitle: "Registering informal waste-pickers with special NP code and privacy erasure",
        interface: "collector",
        duration: 24,
        steps: [
          { time: 0, text: "Empower informal waste-pickers who do not possess a smartphone or SIM.", visual: "grass_intro" },
          { time: 6, text: "Open Peer Registration modal and enter their name and operating area.", visual: "grass_form" },
          { time: 12, text: "System generates official unique ID with special 'NP' code (e.g. COL-NP-0024).", visual: "grass_token" },
          { time: 18, text: "Zero-knowledge privacy: All candidate data is wiped from your device.", visual: "grass_privacy" }
        ]
      }
    };
  }

  // ==========================================
  // STEP-BY-STEP TUTORIAL GUIDE CONTROLLER
  // ==========================================
  startGuide(context) {
    this.currentContext = context;
    this.currentStepIndex = 0;

    const modal = document.getElementById("tutorial-guide-modal");
    if (modal) {
      modal.classList.add("active");
    }

    this.renderCurrentGuideStep();
  }

  closeGuide() {
    const modal = document.getElementById("tutorial-guide-modal");
    if (modal) {
      modal.classList.remove("active");
    }
    this.clearSpotlight();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  getStepsList() {
    return this.currentContext === 'collector' ? this.collectorSteps : this.householdSteps;
  }

  renderCurrentGuideStep() {
    const steps = this.getStepsList();
    if (this.currentStepIndex >= steps.length) {
      this.closeGuide();
      return;
    }

    const step = steps[this.currentStepIndex];

    // Update Modal DOM
    const badgeEl = document.getElementById("tut-guide-badge");
    const titleEl = document.getElementById("tut-guide-title");
    const descEl = document.getElementById("tut-guide-desc");
    const counterEl = document.getElementById("tut-guide-counter");
    const prevBtn = document.getElementById("tut-guide-btn-prev");
    const nextBtn = document.getElementById("tut-guide-btn-next");
    const dotsContainer = document.getElementById("tut-guide-dots");
    const videoBtn = document.getElementById("tut-guide-btn-video");

    if (badgeEl) badgeEl.textContent = (this.currentContext === 'collector') ? "🚚 Field Collector Training" : "🏠 Household Recycling Guide";
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (counterEl) counterEl.textContent = `Step ${this.currentStepIndex + 1} of ${steps.length}`;
    if (prevBtn) prevBtn.style.display = (this.currentStepIndex === 0) ? "none" : "inline-flex";
    if (nextBtn) nextBtn.textContent = (this.currentStepIndex === steps.length - 1) ? "🎉 Finish Guide" : "Next Step ▶";

    if (videoBtn) {
      videoBtn.onclick = () => {
        this.openVideo(step.videoKey);
      };
    }

    // Render Progress Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = steps.map((s, idx) => `
        <span class="tut-dot ${idx === this.currentStepIndex ? 'active' : ''}" onclick="tutorialController.jumpToStep(${idx})"></span>
      `).join("");
    }

    // Spotlight target element on page
    this.highlightTarget(step.targetSelector);
  }

  highlightTarget(selector) {
    this.clearSpotlight();
    if (!selector) return;

    try {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.add("tut-spotlight-active");
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {}
  }

  clearSpotlight() {
    document.querySelectorAll(".tut-spotlight-active").forEach(el => {
      el.classList.remove("tut-spotlight-active");
    });
  }

  nextStep() {
    const steps = this.getStepsList();
    if (this.currentStepIndex < steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentGuideStep();
    } else {
      this.closeGuide();
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentGuideStep();
    }
  }

  jumpToStep(index) {
    const steps = this.getStepsList();
    if (index >= 0 && index < steps.length) {
      this.currentStepIndex = index;
      this.renderCurrentGuideStep();
    }
  }

  speakCurrentStep() {
    const steps = this.getStepsList();
    const step = steps[this.currentStepIndex];
    if (!step || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const textToSpeak = `${step.title}. ${step.desc}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
    const localeMap = {
      hi: 'hi-IN', mr: 'mr-IN', gu: 'gu-IN', mwr: 'hi-IN', te: 'te-IN',
      ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', as: 'bn-IN',
      bn: 'bn-IN', or: 'hi-IN', ur: 'ur-PK', es: 'es-ES', fr: 'fr-FR',
      de: 'de-DE', ja: 'ja-JP', ar: 'ar-SA', en: 'en-IN'
    };
    utterance.lang = localeMap[lang] || 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // ==========================================
  // TUTORIAL VIDEO DEMONSTRATION PLAYER
  // ==========================================
  openVideo(videoKey) {
    const videoData = this.videos[videoKey];
    if (!videoData) return;

    this.activeVideoKey = videoKey;
    this.videoDuration = videoData.duration || 20;
    this.videoCurrentTime = 0;
    this.isPlayingVideo = true;

    const modal = document.getElementById("tutorial-video-modal");
    if (modal) {
      modal.classList.add("active");
    }

    // Populate Video Metadata
    const titleEl = document.getElementById("tut-video-title");
    const subEl = document.getElementById("tut-video-sub");
    if (titleEl) titleEl.textContent = videoData.title;
    if (subEl) subEl.textContent = videoData.subtitle;

    // Render Side Menu for features of that interface
    this.renderVideoPlaylist(videoData.interface);

    // Start video animation loop
    this.startVideoAnimation();
  }

  closeVideo() {
    this.pauseVideo();
    const modal = document.getElementById("tutorial-video-modal");
    if (modal) {
      modal.classList.remove("active");
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  renderVideoPlaylist(interfaceType) {
    const listContainer = document.getElementById("tut-video-playlist-items");
    if (!listContainer) return;

    const keys = Object.keys(this.videos).filter(k => this.videos[k].interface === interfaceType);

    listContainer.innerHTML = keys.map(k => {
      const v = this.videos[k];
      const isActive = (k === this.activeVideoKey);
      return `
        <div class="tut-playlist-item ${isActive ? 'active' : ''}" onclick="tutorialController.openVideo('${k}')">
          <div class="tut-pl-icon">🎥</div>
          <div class="tut-pl-text">
            <strong>${v.title}</strong>
            <span class="small text-muted">0:${v.duration}s Tutorial</span>
          </div>
        </div>
      `;
    }).join("");
  }

  toggleVideoPlay() {
    if (this.isPlayingVideo) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  playVideo() {
    this.isPlayingVideo = true;
    const playBtn = document.getElementById("tut-video-play-btn");
    if (playBtn) playBtn.innerHTML = "❚❚";
    this.startVideoAnimation();
  }

  pauseVideo() {
    this.isPlayingVideo = false;
    clearInterval(this.videoTimer);
    const playBtn = document.getElementById("tut-video-play-btn");
    if (playBtn) playBtn.innerHTML = "▶";
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  restartVideo() {
    this.videoCurrentTime = 0;
    this.playVideo();
  }

  seekVideo(percent) {
    this.videoCurrentTime = (percent / 100) * this.videoDuration;
    this.updateVideoFrame();
  }

  setSpeed(speed) {
    this.videoSpeed = speed;
    document.querySelectorAll(".tut-speed-btn").forEach(btn => {
      btn.classList.toggle("active", parseFloat(btn.dataset.speed) === speed);
    });
    if (this.isPlayingVideo) {
      clearInterval(this.videoTimer);
      this.startVideoAnimation();
    }
  }

  toggleVoiceover() {
    this.videoVoiceoverEnabled = !this.videoVoiceoverEnabled;
    const btn = document.getElementById("tut-video-voice-btn");
    if (btn) {
      btn.classList.toggle("active", this.videoVoiceoverEnabled);
      btn.title = this.videoVoiceoverEnabled ? "Voiceover narration: ON" : "Voiceover narration: OFF";
    }
    if (!this.videoVoiceoverEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  startVideoAnimation() {
    clearInterval(this.videoTimer);
    const intervalMs = 100 / this.videoSpeed;

    this.videoTimer = setInterval(() => {
      if (this.videoCurrentTime >= this.videoDuration) {
        this.videoCurrentTime = this.videoDuration;
        this.pauseVideo();
        return;
      }
      this.videoCurrentTime += 0.1;
      this.updateVideoFrame();
    }, intervalMs);

    this.updateVideoFrame();
  }

  updateVideoFrame() {
    const videoData = this.videos[this.activeVideoKey];
    if (!videoData) return;

    // 1. Update Time Display
    const currentSec = Math.floor(this.videoCurrentTime);
    const timeDisplay = document.getElementById("tut-video-time-display");
    if (timeDisplay) {
      timeDisplay.textContent = `0:${currentSec < 10 ? '0' + currentSec : currentSec} / 0:${videoData.duration}`;
    }

    // 2. Update Progress Bar
    const progressFill = document.getElementById("tut-video-progress-fill");
    if (progressFill) {
      const pct = (this.videoCurrentTime / videoData.duration) * 100;
      progressFill.style.width = `${Math.min(pct, 100)}%`;
    }

    // 3. Find Active Subtitle / Step
    let activeStep = videoData.steps[0];
    for (const s of videoData.steps) {
      if (this.videoCurrentTime >= s.time) {
        activeStep = s;
      }
    }

    // Update Subtitle & Caption
    const captionEl = document.getElementById("tut-video-caption-text");
    if (captionEl && captionEl.textContent !== activeStep.text) {
      captionEl.textContent = activeStep.text;
      if (this.videoVoiceoverEnabled && this.isPlayingVideo) {
        this.speakCaption(activeStep.text);
      }
    }

    // 4. Render Animated Canvas Frame
    this.renderCanvasFrame(activeStep.visual, this.videoCurrentTime);
  }

  speakCaption(text) {
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
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  renderCanvasFrame(visualType, time) {
    const canvas = document.getElementById("tut-video-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark sleek backdrop with grid
    ctx.fillStyle = "#0B132B";
    ctx.fillRect(0, 0, w, h);

    // Subtle background mesh grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dynamic Visual Renderer based on visualType
    ctx.save();

    if (visualType.startsWith("scan_")) {
      // Scanner visual: Device frame with scanning laser and scrap
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Scrap bundle illustration
      ctx.fillStyle = "#B45309";
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚡ COPPER", cx, cy + 10);

      // Scanning HUD box
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 100, cy - 80, 200, 160);

      // Animated green laser line moving up and down
      const laserY = cy - 80 + ((Math.sin(time * 3) + 1) / 2) * 160;
      ctx.strokeStyle = "#34D399";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#34D399";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(cx - 95, laserY);
      ctx.lineTo(cx + 95, laserY);
      ctx.stroke();

      // Confidence badge
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
      ctx.fillRect(cx - 85, cy + 95, 170, 26);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("AI: 94.4% CONFIDENCE", cx, cy + 113);
    } else if (visualType.startsWith("mode2_sms")) {
      // SMS basic phone visual
      const cx = w / 2;
      const cy = h / 2 - 10;

      // Mobile phone body
      ctx.fillStyle = "#1E293B";
      ctx.roundRect(cx - 80, cy - 110, 160, 220, 16);
      ctx.fill();
      ctx.strokeStyle = "#64748B";
      ctx.stroke();

      // Phone screen
      ctx.fillStyle = "#0284C7";
      ctx.fillRect(cx - 70, cy - 95, 140, 120);

      // SMS bubble
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "10px monospace";
      ctx.fillText("📨 NEW PICKUP!", cx - 60, cy - 70);
      ctx.fillText("Zone B • 10kg Copper", cx - 60, cy - 50);
      ctx.fillStyle = "#FEF08A";
      ctx.fillText("Reply 1 to ACCEPT", cx - 60, cy - 30);
      ctx.fillText("Reply 2 to DECLINE", cx - 60, cy - 10);

      // Keypad buttons
      ctx.fillStyle = "#334155";
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillRect(cx - 50 + c * 38, cy + 35 + r * 22, 28, 16);
        }
      }
    } else if (visualType.startsWith("settle_") || visualType === "counter") {
      // Scale and settlement celebration visual
      const cx = w / 2;
      const cy = h / 2 - 15;

      // Digital Scale Station
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(cx - 120, cy + 20, 240, 50);
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 120, cy + 20, 240, 50);

      // Scale Digital Display (LED Numbers)
      ctx.fillStyle = "#000000";
      ctx.fillRect(cx - 70, cy - 40, 140, 50);
      ctx.fillStyle = "#34D399";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      const liveWeight = (Math.min(10.0, 7.5 + (time % 5) * 0.6)).toFixed(1);
      ctx.fillText(`${liveWeight} kg`, cx, cy - 6);

      // Green celebratory badge
      ctx.fillStyle = "#10B981";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("🎉 WEIGHT MATCHED (±5%)", cx, cy + 100);
      ctx.fillStyle = "#93C5FD";
      ctx.font = "13px monospace";
      ctx.fillText("Formula: 10.0kg × ₹504.40 = ₹5,044.00", cx, cy + 124);
    } else if (visualType.startsWith("seal_") || visualType.includes("token") || visualType.includes("qr")) {
      // QR Code Generation & Tamper Seal Visual
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Tamper-evident lot sack
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.arc(cx, cy + 20, 60, 0, Math.PI);
      ctx.fill();

      // Big QR Code Box
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(cx - 55, cy - 80, 110, 110);
      ctx.fillStyle = "#000000";
      ctx.fillRect(cx - 45, cy - 70, 30, 30);
      ctx.fillRect(cx + 15, cy - 70, 30, 30);
      ctx.fillRect(cx - 45, cy - 10, 30, 30);
      ctx.fillStyle = "#10B981";
      ctx.fillRect(cx - 10, cy - 35, 20, 20);

      ctx.fillStyle = "#34D399";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText("LOT-2026-000184 [SEALED]", cx, cy + 65);

      ctx.fillStyle = "#A7F3D0";
      ctx.font = "12px sans-serif";
      ctx.fillText("🔒 Cryptographically Verified by Coordinator", cx, cy + 90);
    } else {
      // Generic futuristic workflow node animation
      const cx = w / 2;
      const cy = h / 2 - 10;

      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#0284C7";
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EcoFlow AI", cx, cy - 5);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#BAE6FD";
      ctx.fillText("Active Step", cx, cy + 16);
    }

    ctx.restore();
  }
}

// Global instance
const tutorialController = new TutorialController();

// Global invocation helpers
function openStepTutorial(context) {
  tutorialController.startGuide(context);
}

function closeStepTutorial() {
  tutorialController.closeGuide();
}

function openVideoModal(videoKey) {
  tutorialController.openVideo(videoKey);
}

function closeVideoModal() {
  tutorialController.closeVideo();
}
