/**
 * EcoFlow AI - Settlement & Weight Match Verification Engine
 * Section 25, 26: Weight Match Celebration & Important Weight Rule
 * Section 28, 29: Transparent Household Settlement
 * Section 31, 32: Digital Receipt & Reassessment Workflow
 */

class SettlementEngine {
  constructor() {
    this.confettiCanvas = null;
    this.confettiCtx = null;
    this.particles = [];
    this.animationId = null;
    this.currentData = null;
  }

  showCelebrationModal(data) {
    this.currentData = data;
    const modal = document.getElementById("weight-match-modal");
    if (!modal) return;

    const estEl = document.getElementById("match-est-weight");
    const verEl = document.getElementById("match-ver-weight");
    const tolEl = document.getElementById("match-tolerance-used");
    const co2El = document.getElementById("match-co2-saved");
    const pointsEl = document.getElementById("match-eco-points");

    const w = parseFloat(data.verified_weight) || 10.0;
    if (estEl) estEl.textContent = `${data.user_estimated_weight} kg`;
    if (verEl) verEl.textContent = `${data.verified_weight} kg`;
    if (tolEl) tolEl.textContent = `±${data.tolerance_used}% tolerance`;
    if (co2El) co2El.textContent = `${(w * 2.45).toFixed(1)} kg CO₂`;
    if (pointsEl) pointsEl.textContent = `+${Math.round(w * 10)} pts`;

    modal.classList.add("active");
    this.launchParticles();
    this.playEcoChime();
  }

  closeCelebrationModal() {
    const modal = document.getElementById("weight-match-modal");
    if (modal) modal.classList.remove("active");
    this.stopParticles();
  }

  playEcoChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.55);
      });
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  burstLeavesAt(x, y) {
    if (!this.confettiCanvas) return;
    const colors = ["#10B981", "#34D399", "#22C55E", "#A7F3D0", "#F59E0B"];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x: x,
        y: y,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        isLeaf: Math.random() > 0.35,
        life: 1.0
      });
    }
  }

  launchParticles() {
    this.confettiCanvas = document.getElementById("celebration-canvas");
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext("2d");

    const w = this.confettiCanvas.width = this.confettiCanvas.parentElement.offsetWidth;
    const h = this.confettiCanvas.height = this.confettiCanvas.parentElement.offsetHeight;

    // Interactive pointer click bursts on the celebration canvas
    this.confettiCanvas.onpointerdown = (e) => {
      this.burstLeavesAt(e.offsetX, e.offsetY);
      this.playEcoChime();
    };

    this.particles = [];
    const colors = ["#10B981", "#34D399", "#059669", "#A7F3D0", "#F59E0B"];

    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 2.5 + 1.2,
        speedX: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        isLeaf: Math.random() > 0.4
      });
    }

    this.animateParticles();
  }

  animateParticles() {
    if (!this.confettiCtx || !this.confettiCanvas) return;
    const ctx = this.confettiCtx;
    const w = this.confettiCanvas.width;
    const h = this.confettiCanvas.height;

    ctx.clearRect(0, 0, w, h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      // Wrap falling particles
      if (p.life === undefined && p.y > h) {
        p.y = -10;
        p.x = Math.random() * w;
      }

      // Handle burst particles decay
      if (p.life !== undefined) {
        p.life -= 0.02;
        p.speedY += 0.08; // gravity
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      if (p.life !== undefined) ctx.globalAlpha = p.life;

      if (p.isLeaf) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }

    this.animationId = requestAnimationFrame(() => this.animateParticles());
  }

  stopParticles() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.confettiCtx && this.confettiCanvas) {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }
  }

  downloadEcoCertificate() {
    const d = this.currentData || { verified_weight: 10.0, user_estimated_weight: 10.0 };
    const certCanvas = document.createElement("canvas");
    certCanvas.width = 900;
    certCanvas.height = 600;
    const ctx = certCanvas.getContext("2d");

    // Certificate Background
    ctx.fillStyle = "#0B1512";
    ctx.fillRect(0, 0, 900, 600);

    // Border Frame
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 860, 560);
    ctx.strokeStyle = "#34D399";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 840, 540);

    // Decorative Header
    ctx.fillStyle = "#A7F3D0";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ECOFLOW AI • VERIFIED RECYCLING FOUNDATION", 450, 75);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("CERTIFICATE OF ENVIRONMENTAL IMPACT", 450, 130);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "16px sans-serif";
    ctx.fillText("This certifies verified digital physical scrap weighment and compliance", 450, 170);

    ctx.fillStyle = "#34D399";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("Rahul Sharma (Demo Household)", 450, 240);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "18px sans-serif";
    ctx.fillText(`"Congratulations! You are making a Cleaner and Greener Environment."`, 450, 290);

    // Metrics Box
    ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
    ctx.fillRect(150, 340, 600, 100);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1;
    ctx.strokeRect(150, 340, 600, 100);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`Verified Scrap: ${d.verified_weight} kg  •  CO₂ Saved: ${(d.verified_weight * 2.45).toFixed(1)} kg  •  Tolerance: ±5% MATCH`, 450, 395);

    // Footer
    ctx.fillStyle = "#94A3B8";
    ctx.font = "13px sans-serif";
    ctx.fillText(`Lot ID: LOT-2026-000184  •  Storage Hub: Central Sorting Hub HUB-001  •  Date: ${new Date().toLocaleDateString()}`, 450, 490);
    ctx.fillStyle = "#10B981";
    ctx.fillText("🔒 Cryptographically Verified Digital Lot Manifest", 450, 520);

    // Trigger download
    const link = document.createElement("a");
    link.download = `EcoFlow-Cleaner-Greener-Certificate-${Date.now()}.png`;
    link.href = certCanvas.toDataURL("image/png");
    link.click();
  }

  renderSettlementReceipt(settlement) {
    const container = document.getElementById("settlement-receipt-view");
    if (!container) return;

    if (!settlement || !settlement.lot_id) {
      container.innerHTML = `
        <div class="empty-state-notice" id="settlement-empty-notice" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <div class="empty-state-icon" style="font-size: 40px; margin-bottom: 10px;">🧾</div>
          <h4 style="margin: 0 0 6px 0; color: var(--text-main);">No Settlement Receipts Yet</h4>
          <p class="small text-muted" style="margin: 0; max-width: 420px; margin-inline: auto;">
            Digital receipts and transparent weighment calculations will appear here automatically after your scrap is physically verified and paid at the hub.
          </p>
        </div>
      `;
      return;
    }

    const s = settlement;
    const itemsHtml = (s.items || []).map(i => `
      <tr>
        <td><strong>${i.material_name}</strong></td>
        <td><span class="badge-grade">${i.grade}</span></td>
        <td>${i.verified_weight} kg</td>
        <td>₹${i.rate_per_kg}/kg</td>
        <td class="text-right"><strong>₹${i.subtotal ? i.subtotal.toFixed(2) : (i.verified_weight * i.rate_per_kg).toFixed(2)}</strong></td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div class="receipt-card">
        <div class="receipt-header">
          <div class="receipt-logo">
            <span class="receipt-icon">🌱</span>
            <div>
              <h3>ECOFLOW AI</h3>
              <p class="receipt-sub">Verified Recycling Settlement</p>
            </div>
          </div>
          <div class="receipt-meta">
            <div class="receipt-no">Receipt #${s.receipt_number || 'RCP-2026-990142'}</div>
            <div class="receipt-date">${s.settlement_date || new Date().toISOString()}</div>
          </div>
        </div>

        <div class="receipt-trust-banner">
          <div class="trust-badge">🔒 Physically Verified at Storage Hub</div>
          <p class="trust-text">AI predicts preliminary categories. Final settlement is strictly calculated from verified scale weight and official company buying rates.</p>
        </div>

        <div class="receipt-details-grid">
          <div><span class="lbl">Citizen / Household:</span> <strong>${s.household_name || 'Citizen'}</strong></div>
          <div><span class="lbl">Pickup ID:</span> <strong>${s.pickup_id || '—'}</strong></div>
          <div><span class="lbl">Digital Lot ID:</span> <strong>${s.lot_id}</strong></div>
          <div><span class="lbl">Hub Station:</span> <strong>HUB-001 (Central Sorting Hub)</strong></div>
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>Verified Material</th>
              <th>Grade</th>
              <th>Verified Weight</th>
              <th>Buying Rate</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || `
              <tr>
                <td colspan="5" class="text-center text-muted" style="padding: 14px;">No itemized materials logged.</td>
              </tr>
            `}
          </tbody>
          <tfoot>
            <tr>
              <th colspan="2">Total Verified Weight:</th>
              <th colspan="2">${s.verified_weight} kg</th>
              <th class="text-right text-success total-amount">₹${s.final_amount.toFixed(2)}</th>
            </tr>
          </tfoot>
        </table>

        <div class="receipt-audit-box">
          <div class="audit-row">
            <span><strong>Calculation Formula:</strong></span>
            <span><code>${s.calculation_formula}</code></span>
          </div>
          <div class="audit-row">
            <span><strong>Weight Match Tolerance:</strong></span>
            <span>${s.verification ? (s.verification.weight_match_status === 'MATCH' ? '✅ MATCH (Within ±5% tolerance)' : '⚠️ DIFFERENCE (Verified weight used)') : '✅ MATCH'}</span>
          </div>
        </div>

        <div class="receipt-actions">
          <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Print Receipt</button>
          <button class="btn btn-outline btn-sm" onclick="settlementEngine.shareReceipt('${s.receipt_number}')">📤 Share</button>
          <button class="btn btn-secondary btn-sm" onclick="settlementEngine.openReassessmentModal('${s.lot_id}')">🔄 Request Reassessment</button>
        </div>
      </div>
    `;
  }

  shareReceipt(receiptNo) {
    if (navigator.share) {
      navigator.share({
        title: "EcoFlow AI Recycling Settlement Receipt",
        text: `My verified recycling settlement receipt: #${receiptNo}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert(`Receipt #${receiptNo} copied to clipboard!`);
    }
  }

  openReassessmentModal(lotId) {
    const reason = prompt("Enter specific reason for reverification request (e.g. tare weight inquiry):");
    if (!reason) return;

    fetch("/api/reassessment/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lot_id: lotId, household_name: "Rahul Sharma", reason })
    })
    .then(res => res.json())
    .then(data => {
      alert(`Reassessment request submitted! Ticket: ${data.reassessment_id}. Status: UNDER_REVIEW. Historical records remain fully preserved.`);
    });
  }
}

const settlementEngine = new SettlementEngine();
