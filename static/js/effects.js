/**
 * EcoFlow AI - Premium Visual Effects & Interactions Engine
 * Floating Particles · Dark/Light Mode Toggle · Button Ripples
 * Shimmer Loaders · Smooth Transitions · Animated Counters
 */

// =====================================================
// 1. FLOATING PARTICLES BACKGROUND
// =====================================================
(function initParticles() {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;

    const PARTICLE_COUNT = 28;
    const COLORS = [
      "rgba(52, 211, 153, 0.35)",   // mint
      "rgba(16, 185, 129, 0.28)",   // emerald
      "rgba(245, 158, 11, 0.22)",   // amber
      "rgba(6, 182, 212, 0.2)",     // cyan
      "rgba(139, 92, 246, 0.18)",   // purple (for admin theme)
      "rgba(56, 189, 248, 0.15)",   // sky
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const orb = document.createElement("div");
      orb.className = "particle-orb";
      const size = Math.random() * 6 + 3;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur = Math.random() * 18 + 14;
      const delay = Math.random() * 20;
      const x = Math.random() * 100;

      orb.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        bottom: -${size + 10}px;
        background: radial-gradient(circle, ${color}, transparent 70%);
        box-shadow: 0 0 ${size * 2}px ${color};
        animation-duration: ${dur}s;
        animation-delay: -${delay}s;
      `;
      canvas.appendChild(orb);
    }
  });
})();

// =====================================================
// 2. DARK / LIGHT MODE TOGGLE
// =====================================================
function toggleThemeMode() {
  const body = document.body;
  const toggle = document.getElementById("theme-toggle");
  const isLight = body.classList.toggle("light-mode");

  if (toggle) toggle.classList.toggle("light", isLight);
  localStorage.setItem("ecoflow_theme", isLight ? "light" : "dark");

  // Update particles colour for light mode
  document.querySelectorAll(".particle-orb").forEach(orb => {
    orb.style.opacity = isLight ? "0.3" : "";
  });
}

// Restore saved theme on load
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("ecoflow_theme");
  if (saved === "light") {
    document.body.classList.add("light-mode");
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.classList.add("light");
  }
});

// =====================================================
// 3. BUTTON RIPPLE EFFECT
// =====================================================
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn, .btn-primary, .btn-outline, .btn-secondary, .portal-role-card, .action-card-btn, .btn-gateway-submit, .portal-subnav-btn");
  if (!btn) return;

  const ripple = document.createElement("span");
  ripple.className = "ripple-effect";
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.4;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
  `;

  btn.style.position = btn.style.position || "relative";
  btn.style.overflow = "hidden";
  btn.appendChild(ripple);

  ripple.addEventListener("animationend", () => ripple.remove());
});

// =====================================================
// 4. SHIMMER / SKELETON LOADING
// =====================================================
function showShimmer(containerId, rows = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '<div class="shimmer-container">';
  for (let i = 0; i < rows; i++) {
    const w = 50 + Math.random() * 45;
    html += `<div class="shimmer-line" style="width: ${w}%; animation-delay: ${i * 0.12}s;"></div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function hideShimmer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const shimmer = container.querySelector(".shimmer-container");
  if (shimmer) shimmer.remove();
}

// =====================================================
// 5. SMOOTH PERSPECTIVE VIEW TRANSITIONS
// =====================================================
(function enhanceViewTransitions() {
  const origSwitch = window.switchPerspective;
  if (!origSwitch) return;

  window.switchPerspective = function(role) {
    // Fade out current active view
    const currentView = document.querySelector(".perspective-view.active");
    if (currentView) {
      currentView.style.opacity = "0";
      currentView.style.transform = "translateY(12px)";
    }

    // Call original after brief delay
    setTimeout(() => {
      origSwitch(role);
      // Fade in new view
      const newView = document.querySelector(".perspective-view.active");
      if (newView) {
        newView.style.opacity = "0";
        newView.style.transform = "translateY(12px)";
        requestAnimationFrame(() => {
          newView.style.transition = "opacity 0.35s ease, transform 0.35s ease";
          newView.style.opacity = "1";
          newView.style.transform = "translateY(0)";
        });
      }
    }, 150);
  };
})();

// =====================================================
// 6. ANIMATED STAT COUNTERS
// =====================================================
function animateCounter(elementId, targetValue, duration = 1200, prefix = "", suffix = "") {
  const el = document.getElementById(elementId);
  if (!el) return;

  const startVal = 0;
  const startTime = performance.now();
  const isFloat = String(targetValue).includes(".");
  const decimals = isFloat ? (String(targetValue).split(".")[1] || "").length : 0;

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startVal + (targetValue - startVal) * eased;

    el.textContent = prefix + (isFloat ? current.toFixed(decimals) : Math.floor(current)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// =====================================================
// 7. HOVER MICRO-INTERACTIONS (Enhanced)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  // Add glow-on-hover class to interactive cards
  const cards = document.querySelectorAll(
    ".impact-card, .hub-card, .assessment-card, .chain-step-node, .locked-reward-card, .portal-role-card, .gateway-field"
  );
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.transition = "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.transform = "translateY(-3px) scale(1.01)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });
  });
});
