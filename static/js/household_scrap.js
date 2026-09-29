/**
 * EcoFlow AI - Household Scrap Lifecycle & Post Scrap Module
 * Handles:
 * - Timezone-synchronized dynamic greetings
 * - Live market prices ticker & dynamic environmental taglines
 * - Post Scrap screen with 2-column materials table & photo scan
 * - Single photo capture, confirmation (OK vs Retake), and AI weight estimation
 * - 10 km (and expanding) radius distribution to smartphone & SMS collectors
 * - 7-second countdown "Pickup confirmed" modal
 * - Real-time 5-step progress bar with Post Scrap button lock until Payment Received
 */

// Environmental Inspiring Taglines
const ENV_TAGLINES = [
  "Recycling 1 ton of plastic saves up to 5,774 kWh of electricity, 16.3 barrels of oil, and 30 cubic yards of landfill space.",
  "Recycling 1 ton of paper saves 17 mature trees, 7,000 gallons of water, and 463 gallons of crude oil.",
  "Recycling aluminium uses 95% less energy than producing primary aluminium from bauxite ore.",
  "Every kilogram of copper recycled prevents 2.8 kg of CO₂ emissions from polluting our atmosphere.",
  "Recycling one tin can saves enough electricity to power a television set for up to three hours.",
  "Recycling glass saves 70% of the energy compared to making glass from raw silica and soda ash.",
  "Manufacturing recycled steel consumes 75% less energy and preserves 1,115 kg of natural iron ore per ton.",
  "Household scrap segregation enables 98% circular recovery and empowers frontline green collection workers."
];

// Scrap Material Categories & Rates
const SCRAP_TAXONOMY = [
  { code: 'IRON_STEEL', name: 'Iron & Steel Scraps', defaultRate: 32.0, unit: 'kg', icon: '🔩', trend: '+3.2%', co2: 1.8 },
  { code: 'COPPER_SCRAP', name: 'Copper Scrap & Wires', defaultRate: 580.0, unit: 'kg', icon: '⚡', trend: '+4.8%', co2: 2.8 },
  { code: 'ALUMINIUM_SCRAP', name: 'Aluminium Scrap & Cans', defaultRate: 145.0, unit: 'kg', icon: '🥫', trend: '+2.1%', co2: 9.1 },
  { code: 'PET_BOTTLE', name: 'PET Plastic Containers', defaultRate: 24.0, unit: 'kg', icon: '🧴', trend: '+1.5%', co2: 1.5 },
  { code: 'HDPE_PLASTIC', name: 'HDPE Hard Plastics', defaultRate: 28.0, unit: 'kg', icon: '🛢️', trend: '+2.0%', co2: 1.7 },
  { code: 'CARDBOARD', name: 'Paper & Corrugated Cardboard', defaultRate: 12.0, unit: 'kg', icon: '📦', trend: '-0.5%', co2: 0.9 },
  { code: 'EWASTE_PCB', name: 'Electronic Waste (E-Waste)', defaultRate: 220.0, unit: 'kg', icon: '💻', trend: '+5.5%', co2: 4.5 },
  { code: 'BRASS_SCRAP', name: 'Brass & Metal Alloys', defaultRate: 390.0, unit: 'kg', icon: '🔔', trend: '+1.8%', co2: 3.1 }
];

// Active Post Scrap State
let postScrapState = {
  currentPhoto: null,
  photoConfirmed: false,
  detectedMaterials: [],
  totalWeight: 0.0,
  totalValue: 0.0,
  totalCo2: 0.0,
  activeLotId: null,
  activePickupId: null,
  currentStep: 0, // 0: None, 1: Requested, 2: Accepted, 3: Verified, 4: Confirmed, 5: Received
  isLocked: false
};

// ----------------------------------------------------
// 1. TIMEZONE-SYNCED GREETING & HEADER
// ----------------------------------------------------
function updateHouseholdGreeting() {
  const now = new Date();
  const hours = now.getHours();
  let greetingWord = "Good Morning";
  let icon = "🌅";

  if (hours >= 12 && hours < 17) {
    greetingWord = "Good Afternoon";
    icon = "☀️";
  } else if (hours >= 17 && hours < 21) {
    greetingWord = "Good Evening";
    icon = "🌆";
  } else if (hours >= 21 || hours < 5) {
    greetingWord = "Good Night";
    icon = "🌙";
  }

  // Get active user name from session
  let userName = "Rahul Sharma";
  try {
    const s = localStorage.getItem("ecoflow_user_session");
    if (s) {
      const u = JSON.parse(s);
      if (u.name) userName = u.name;
    }
  } catch (e) {}

  const titleEl = document.getElementById("hh-dynamic-greeting-title");
  if (titleEl) {
    titleEl.textContent = `${greetingWord}, ${userName} ${icon}`;
  }

  // Display detected local timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tzPill = document.getElementById("hh-timezone-name");
    if (tzPill) {
      tzPill.textContent = `Synced with ${tz} (${timeStr} Local Time)`;
    }
  } catch (e) {}
}

// ----------------------------------------------------
// 2. DYNAMIC ENVIRONMENT TAGLINE
// ----------------------------------------------------
function refreshEnvironmentalTagline() {
  const el = document.getElementById("env-tagline-text");
  if (!el) return;
  const randomIndex = Math.floor(Math.random() * ENV_TAGLINES.length);
  el.textContent = `"${ENV_TAGLINES[randomIndex]}"`;
}

// ----------------------------------------------------
// 3. LIVE MARKET PRICE SECTION
// ----------------------------------------------------
async function loadLiveMarketPrices() {
  const grid = document.getElementById("market-rates-grid");
  if (!grid) return;

  try {
    const res = await fetch("/api/household/live-rates");
    const data = await res.json();
    const rates = (data && data.rates && data.rates.length) ? data.rates : SCRAP_TAXONOMY;

    grid.innerHTML = rates.map(item => `
      <div class="market-rate-card" title="Click to view details in Post Scrap" onclick="openPostScrapScreen()">
        <div class="rate-card-top">
          <span class="rate-icon">${item.icon || '♻️'}</span>
          <span class="rate-trend ${item.trend.startsWith('+') ? 'trend-up' : (item.trend.startsWith('-') ? 'trend-down' : '')}">
            ${item.trend}
          </span>
        </div>
        <div class="rate-name">${item.name}</div>
        <div class="rate-val-row">
          <strong class="rate-price">₹${parseFloat(item.rate).toFixed(2)}</strong>
          <span class="rate-unit">/${item.unit || 'kg'}</span>
        </div>
      </div>
    `).join("");
  } catch (err) {
    grid.innerHTML = SCRAP_TAXONOMY.map(item => `
      <div class="market-rate-card">
        <div class="rate-card-top">
          <span class="rate-icon">${item.icon}</span>
          <span class="rate-trend trend-up">${item.trend}</span>
        </div>
        <div class="rate-name">${item.name}</div>
        <div class="rate-val-row">
          <strong class="rate-price">₹${item.defaultRate.toFixed(2)}</strong>
          <span class="rate-unit">/${item.unit}</span>
        </div>
      </div>
    `).join("");
  }
}

// ----------------------------------------------------
// 4. CHECK ACTIVE PICKUP & PROGRESS BAR STATE
// ----------------------------------------------------
async function checkActiveHouseholdPickup() {
  try {
    const res = await fetch("/api/household/active-pickup");
    const data = await res.json();

    const postBtn = document.getElementById("btn-main-post-scrap");
    const lockNotice = document.getElementById("post-scrap-disabled-notice");
    const progressCard = document.getElementById("household-live-progress-card");

    if (data.has_active && data.step >= 1 && data.step < 5) {
      // Pickup active and NOT yet payment received: Lock Post Scrap
      postScrapState.isLocked = true;
      postScrapState.currentStep = data.step;
      postScrapState.activeLotId = data.lot_id;
      
      if (postBtn) {
        postBtn.disabled = true;
        postBtn.classList.add("disabled");
      }
      if (lockNotice) lockNotice.style.display = "flex";
      if (progressCard) progressCard.style.display = "block";

      updateProgressBarUI(data.step, data.lot_id, data.pickup);
    } else {
      // Completed or no active pickup: Enable Post Scrap
      postScrapState.isLocked = false;
      postScrapState.currentStep = 0;
      
      if (postBtn) {
        postBtn.disabled = false;
        postBtn.classList.remove("disabled");
      }
      if (lockNotice) lockNotice.style.display = "none";
      if (progressCard) progressCard.style.display = "none";
    }
  } catch (err) {
    console.warn("Could not check active pickup:", err);
  }
}

// Render 5-Step Progress Bar
function updateProgressBarUI(step, lotId, pickupData = {}) {
  const lotEl = document.getElementById("progress-lot-id-display");
  if (lotEl && lotId) lotEl.textContent = lotId;

  const collectorName = pickupData?.collector_name || "Rameshwar Boro";
  const collectorId = pickupData?.assigned_collector || "COL-00142";
  const collectorMode = pickupData?.collector_mode || "smartphone";

  const colInfoEl = document.getElementById("progress-assigned-collector-info");
  if (colInfoEl) {
    colInfoEl.innerHTML = `🚚 Collector: <strong>${collectorName}</strong> (${collectorId} • ${collectorMode.toUpperCase()}) • Locked`;
  }

  // Step names
  const stepLabels = [
    "Pickup requested",
    "Pickup Accepted",
    "Scrap Verified",
    "Payment Confirmed",
    "Payment Received"
  ];

  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById(`step-node-${i}`);
    const conn = document.getElementById(`step-conn-${i}`);
    const timeEl = document.getElementById(`step-time-${i}`);

    if (node) {
      node.classList.remove("completed", "active");
      if (i < step) {
        node.classList.add("completed");
        if (timeEl) timeEl.textContent = "Done ✓";
      } else if (i === step) {
        node.classList.add("active");
        if (timeEl) timeEl.textContent = "In Progress ⏳";
      } else {
        if (timeEl) timeEl.textContent = "Pending";
      }
    }

    if (conn) {
      conn.classList.toggle("completed", i < step);
    }
  }
}

// Advance Step (Demo/Testing function)
async function advancePickupStepDemo() {
  if (!postScrapState.activeLotId) return;

  const nextStep = (postScrapState.currentStep || 1) + 1;
  if (nextStep > 5) {
    alert("Pickup lifecycle completed! Payment has been received.");
    checkActiveHouseholdPickup();
    return;
  }

  try {
    const res = await fetch("/api/household/progress-step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lot_id: postScrapState.activeLotId,
        step: nextStep
      })
    });
    const data = await res.json();
    if (data.success) {
      postScrapState.currentStep = nextStep;
      if (nextStep === 5) {
        // Payment received!
        updateProgressBarUI(5, postScrapState.activeLotId);
        setTimeout(() => {
          alert(`🎉 Payment Received! Verified scrap payment settled for ${postScrapState.activeLotId}.\n\n"Post Scrap" is now unlocked!`);
          checkActiveHouseholdPickup();
        }, 600);
      } else {
        updateProgressBarUI(nextStep, postScrapState.activeLotId);
      }
    }
  } catch (err) {
    alert("Error updating step: " + err.message);
  }
}

// ----------------------------------------------------
// 5. POST SCRAP SCREEN & 2-COLUMN TABLE
// ----------------------------------------------------
function openPostScrapScreen() {
  if (postScrapState.isLocked) {
    alert("An active scrap pickup is currently in progress. You can post new scrap once the payment for the current lot has been received.");
    return;
  }

  // Hide household dashboard, show post scrap screen
  const dashboard = document.getElementById("hh-tab-home");
  const postScreen = document.getElementById("hh-screen-post-scrap");
  
  if (dashboard) dashboard.style.display = "none";
  if (postScreen) {
    postScreen.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  renderScrapMaterialsTable();
  resetPostScrapForm();
}

function renderScrapMaterialsTable() {
  const tbody = document.getElementById("scrap-table-tbody");
  if (!tbody) return;

  tbody.innerHTML = SCRAP_TAXONOMY.map((item, idx) => `
    <tr class="scrap-table-row" data-code="${item.code}">
      <td class="col-category">
        <div class="category-name-group">
          <span class="category-icon">${item.icon}</span>
          <div>
            <strong>${item.name}</strong>
            <small class="text-muted d-block">Spot Rate: ₹${item.defaultRate.toFixed(2)}/kg</small>
          </div>
        </div>
      </td>
      <td class="col-weight" style="text-align: right;">
        <div class="weight-input-wrapper">
          <input type="number" 
                 id="scrap-weight-${item.code}" 
                 class="scrap-weight-input" 
                 step="0.1" 
                 min="0" 
                 value="0.0" 
                 onchange="recalculateCostFromTable()" 
                 placeholder="0.0" />
          <span class="weight-unit">kg</span>
        </div>
      </td>
    </tr>
  `).join("");
}

// Top Left Back Button (indicated by a left arrow)
function onPostScrapBackClick() {
  const modal = document.getElementById("post-scrap-exit-modal");
  if (modal) modal.style.display = "flex";
}

// Exit Confirmation Modal response
function confirmExitPostScrap(yes) {
  const modal = document.getElementById("post-scrap-exit-modal");
  if (modal) modal.style.display = "none";

  if (yes) {
    // Reset progress and open household interface
    resetPostScrapForm();
    const dashboard = document.getElementById("hh-tab-home");
    const postScreen = document.getElementById("hh-screen-post-scrap");
    
    if (postScreen) postScreen.style.display = "none";
    if (dashboard) dashboard.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function resetPostScrapForm() {
  postScrapState.currentPhoto = null;
  postScrapState.photoConfirmed = false;
  postScrapState.detectedMaterials = [];
  postScrapState.totalWeight = 0.0;
  postScrapState.totalValue = 0.0;

  // Clear inputs
  document.querySelectorAll(".scrap-weight-input").forEach(input => {
    input.value = "0.0";
  });

  // Reset photo preview
  const previewContainer = document.getElementById("scrap-photo-preview-container");
  const actionsRow = document.getElementById("photo-upload-actions-row");
  const costCard = document.getElementById("ai-cost-estimation-card");
  const submitBtn = document.getElementById("btn-request-pickup-submit");

  if (previewContainer) previewContainer.style.display = "none";
  if (actionsRow) actionsRow.style.display = "flex";
  if (costCard) costCard.style.display = "none";
  if (submitBtn) {
    submitBtn.disabled = true;
    const sub = document.getElementById("pickup-btn-sub");
    if (sub) sub.textContent = "Confirm scrap photo to unlock pickup";
  }
}

// ----------------------------------------------------
// 6. PHOTO CAPTURE & CONFIRMATION (OK vs Retake)
// ----------------------------------------------------
function triggerScrapCamera() {
  const input = document.getElementById("scrap-camera-input");
  if (input) input.click();
}

function handleScrapPhotoSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    displayCapturedPhoto(e.target.result);
  };
  reader.readAsDataURL(file);
}

// Quick Sample Photo for Testing
function simulateSampleScrapPhoto() {
  // High quality SVG scrap illustration
  const samplePhoto = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%231E293B"/><rect x="40" y="40" width="520" height="320" rx="16" fill="%230F172A" stroke="%2310B981" stroke-width="2"/><text x="300" y="160" font-family="sans-serif" font-size="70" text-anchor="middle" fill="%2310B981">📦 🔩 ⚡ 🧴</text><text x="300" y="220" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="%23F8FAFC">Segregated Recyclable Scrap Pile</text><text x="300" y="260" font-family="sans-serif" font-size="15" text-anchor="middle" fill="%2394A3B8">Iron Scrap (14.5 kg) • Copper Wires (3.2 kg) • PET Plastic (5.0 kg)</text><circle cx="100" cy="90" r="10" fill="%2334D399"/><text x="120" y="95" font-family="sans-serif" font-size="12" fill="%2334D399">High-Resolution Scrap Photo</text></svg>`;
  displayCapturedPhoto(samplePhoto);
}

function displayCapturedPhoto(photoDataUrl) {
  postScrapState.currentPhoto = photoDataUrl;
  postScrapState.photoConfirmed = false;

  const img = document.getElementById("scrap-photo-img");
  const previewContainer = document.getElementById("scrap-photo-preview-container");
  const actionsRow = document.getElementById("photo-upload-actions-row");
  const confirmCard = document.getElementById("photo-confirm-card");
  const scanMsg = document.getElementById("photo-scanning-msg");

  if (img) img.src = photoDataUrl;
  if (previewContainer) previewContainer.style.display = "block";
  if (actionsRow) actionsRow.style.display = "none";
  if (confirmCard) confirmCard.style.display = "block";
  if (scanMsg) scanMsg.style.display = "none";
}

function retakeScrapPhoto() {
  postScrapState.currentPhoto = null;
  postScrapState.photoConfirmed = false;

  const previewContainer = document.getElementById("scrap-photo-preview-container");
  const actionsRow = document.getElementById("photo-upload-actions-row");
  const fileInput = document.getElementById("scrap-camera-input");

  if (previewContainer) previewContainer.style.display = "none";
  if (actionsRow) actionsRow.style.display = "flex";
  if (fileInput) fileInput.value = "";
}

// User confirms photo is OK -> AI scans photo
function confirmScrapPhotoOk() {
  postScrapState.photoConfirmed = true;

  const confirmCard = document.getElementById("photo-confirm-card");
  const scanMsg = document.getElementById("photo-scanning-msg");
  const laser = document.getElementById("photo-laser-scanner");

  if (confirmCard) confirmCard.style.display = "none";
  if (scanMsg) scanMsg.style.display = "flex";
  if (laser) laser.style.display = "block";

  // Simulate on-device neural vision inference delay (1.2s)
  setTimeout(() => {
    if (laser) laser.style.display = "none";
    if (scanMsg) scanMsg.style.display = "none";

    // AI Detected Materials & Estimated Weights
    const simulatedResults = [
      { code: 'IRON_STEEL', weight: 14.5 },
      { code: 'COPPER_SCRAP', weight: 3.2 },
      { code: 'PET_BOTTLE', weight: 5.0 },
      { code: 'CARDBOARD', weight: 7.8 }
    ];

    // Print values in the table above!
    simulatedResults.forEach(item => {
      const input = document.getElementById(`scrap-weight-${item.code}`);
      if (input) {
        input.value = item.weight.toFixed(1);
        input.classList.add("highlight-pulse");
        setTimeout(() => input.classList.remove("highlight-pulse"), 1500);
      }
    });

    recalculateCostFromTable();

    // Enable Request Pickup Button
    const submitBtn = document.getElementById("btn-request-pickup-submit");
    const sub = document.getElementById("pickup-btn-sub");
    if (submitBtn) submitBtn.disabled = false;
    if (sub) sub.textContent = "Tap to search collectors in 10 km radius";
  }, 1200);
}

// ----------------------------------------------------
// 7. AI ESTIMATED COST RECALCULATION
// ----------------------------------------------------
function recalculateCostFromTable() {
  let detected = [];
  let totalWt = 0.0;
  let totalVal = 0.0;
  let totalCo2 = 0.0;

  SCRAP_TAXONOMY.forEach(item => {
    const input = document.getElementById(`scrap-weight-${item.code}`);
    const weight = parseFloat(input?.value || 0.0);
    if (weight > 0) {
      const subtotal = weight * item.defaultRate;
      detected.push({
        code: item.code,
        name: item.name,
        icon: item.icon,
        weight: weight,
        rate: item.defaultRate,
        subtotal: subtotal,
        co2: weight * item.co2
      });
      totalWt += weight;
      totalVal += subtotal;
      totalCo2 += (weight * item.co2);
    }
  });

  postScrapState.detectedMaterials = detected;
  postScrapState.totalWeight = totalWt;
  postScrapState.totalValue = totalVal;
  postScrapState.totalCo2 = totalCo2;

  // Render cost breakdown section
  const costCard = document.getElementById("ai-cost-estimation-card");
  const costTbody = document.getElementById("cost-breakdown-tbody");
  const totalValEl = document.getElementById("cost-grand-total");
  const co2El = document.getElementById("cost-carbon-offset");

  if (detected.length > 0) {
    if (costCard) costCard.style.display = "block";
    if (costTbody) {
      costTbody.innerHTML = detected.map(d => `
        <tr>
          <td><span class="cost-item-icon">${d.icon}</span> <strong>${d.name}</strong></td>
          <td style="text-align: right;">${d.weight.toFixed(1)} kg</td>
          <td style="text-align: right;">₹${d.rate.toFixed(2)}/kg</td>
          <td style="text-align: right;" class="text-success font-weight-bold">₹${d.subtotal.toFixed(2)}</td>
        </tr>
      `).join("");
    }
    if (totalValEl) totalValEl.textContent = `₹${totalVal.toFixed(2)}`;
    if (co2El) co2El.textContent = `${totalCo2.toFixed(1)} kg CO₂ Offset`;
  } else {
    if (costCard) costCard.style.display = "none";
  }
}

// ----------------------------------------------------
// 8. REQUEST PICKUP & RADIUS DISTRIBUTION FLOW
// ----------------------------------------------------
async function submitScrapPickupFlow() {
  if (postScrapState.detectedMaterials.length === 0 || postScrapState.totalWeight <= 0) {
    alert("Please enter weights or scan scrap photo to calculate material estimates.");
    return;
  }

  // Open animated radius search HUD modal
  openRadiusSearchHUD();

  // Payload for server
  const sessionStr = localStorage.getItem("ecoflow_user_session");
  const session = sessionStr ? JSON.parse(sessionStr) : {};
  
  const payload = {
    household_name: session.name || "Rahul Sharma",
    household_phone: session.phone || "+91 98640 12345",
    address: session.address || "House 14, Peace Enclave, Paltan Bazaar, Guwahati",
    service_zone: "ZONE B",
    materials: postScrapState.detectedMaterials,
    total_weight: postScrapState.totalWeight,
    total_value: postScrapState.totalValue,
    waste_image: postScrapState.currentPhoto || "sample_scrap.jpg"
  };

  try {
    const res = await fetch("/api/household/post-scrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      alert("Error submitting pickup: " + (result.error || "Please check details."));
      closeRadiusSearchHUD();
      return;
    }

    postScrapState.activeLotId = result.lot_id;
    postScrapState.activePickupId = result.pickup_id;
    postScrapState.isLocked = true;

    // Animate radius search progression:
    // 10 km search -> Dispatch alerts -> Acceptance & Lock!
    animateRadiusSearchSequence(result);

  } catch (err) {
    alert("Network Error: " + err.message);
    closeRadiusSearchHUD();
  }
}

function openRadiusSearchHUD() {
  const hud = document.getElementById("radius-search-hud-modal");
  if (hud) hud.style.display = "flex";
}

function closeRadiusSearchHUD() {
  const hud = document.getElementById("radius-search-hud-modal");
  if (hud) hud.style.display = "none";
}

function animateRadiusSearchSequence(result) {
  const radiusText = document.getElementById("hud-radius-num");
  const statusLog = document.getElementById("hud-search-status-log");

  if (radiusText) radiusText.textContent = "10 km";
  if (statusLog) {
    statusLog.innerHTML = `
      <div class="hud-log-line">📡 Broadcasting scrap pickup to field personnel in <strong>10 km radius</strong>...</div>
      <div class="hud-log-line text-info">📨 Dispatched SMS to ${result.dispatched_sms.length} basic/no-phone collectors (COL-NP/NS)</div>
      <div class="hud-log-line text-primary">🔔 Dispatched in-app push notification to ${result.dispatched_smartphone.length} smartphone collectors</div>
    `;
  }

  // After 1.5s, simulate check or expansion
  setTimeout(() => {
    if (statusLog) {
      statusLog.innerHTML += `
        <div class="hud-log-line text-warning">⏳ Evaluating nearest collector dispatch availability...</div>
      `;
    }

    setTimeout(() => {
      // Collector Accepts and Request is LOCKED
      if (statusLog) {
        statusLog.innerHTML += `
          <div class="hud-log-line text-success font-weight-bold">
            🔒 ACCEPTED & LOCKED: Collector ${result.assigned_collector.name} (${result.assigned_collector.employee_id}) has accepted!
          </div>
          <div class="hud-log-line small text-muted">Request locked. No further dispatches or bids will be entertained.</div>
        `;
      }

      // After 1.2s, close HUD and trigger 7-second "Pickup confirmed" toast
      setTimeout(() => {
        closeRadiusSearchHUD();
        triggerPickupConfirmedToast(result.lot_id);
      }, 1200);

    }, 1200);

  }, 1000);
}

// ----------------------------------------------------
// 9. 7-SECOND "PICKUP CONFIRMED" POP-UP MODAL
// ----------------------------------------------------
function triggerPickupConfirmedToast(lotId) {
  const toast = document.getElementById("pickup-confirmed-toast");
  const lotEl = document.getElementById("toast-lot-id");
  const countdownEl = document.getElementById("toast-countdown-seconds");

  if (lotEl) lotEl.textContent = lotId;
  if (toast) toast.style.display = "flex";

  let remaining = 7;
  if (countdownEl) countdownEl.textContent = remaining;

  const timerInterval = setInterval(() => {
    remaining -= 1;
    if (countdownEl) countdownEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (toast) toast.style.display = "none";

      // Automatically exit post scrap screen and return to household interface
      const dashboard = document.getElementById("hh-tab-home");
      const postScreen = document.getElementById("hh-screen-post-scrap");
      
      if (postScreen) postScreen.style.display = "none";
      if (dashboard) dashboard.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Refresh active pickup to show the real-time 5-step progress bar
      checkActiveHouseholdPickup();
    }
  }, 1000);
}

// ----------------------------------------------------
// INITIALIZATION ON DOM READY
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateHouseholdGreeting();
  refreshEnvironmentalTagline();
  loadLiveMarketPrices();
  checkActiveHouseholdPickup();

  // Periodically refresh greeting (every minute) & tagline (every 2 minutes)
  setInterval(updateHouseholdGreeting, 60000);
  setInterval(refreshEnvironmentalTagline, 120000);
});
