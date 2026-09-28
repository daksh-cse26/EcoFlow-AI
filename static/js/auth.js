/**
 * EcoFlow AI - Authentication & Interface Gateway Module
 * Handles role-based authentication, PBKDF2/AES database encryption,
 * persistent local session lock, unique collector ID generation,
 * and Command Center access control for Daksh Singhi (dakssinghi@gmail.com).
 */

let activeGatewayRole = 'household';
let pendingAdminEmail = '';

// Initialize Authentication and Gateway on Page Load
function initAuth() {
  const sessionStr = localStorage.getItem("ecoflow_user_session");
  const gatewayEl = document.getElementById("portal-gateway-screen");
  const badgeEl = document.getElementById("active-session-badge");

  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.role) {
        applyActiveSession(session);
        return;
      }
    } catch (e) {
      localStorage.removeItem("ecoflow_user_session");
    }
  }

  // No active session: Display Onboarding Portal Gateway Screen
  if (gatewayEl) gatewayEl.style.display = "block";
  if (badgeEl) badgeEl.style.display = "none";
  document.querySelectorAll(".perspective-view").forEach(v => v.classList.remove("active"));
  selectGatewayRole('household');
}

// Select interface role in the gateway
function selectGatewayRole(role) {
  activeGatewayRole = role;

  // Update card selections
  document.querySelectorAll(".portal-role-card").forEach(card => {
    card.classList.toggle("selected", card.dataset.role === role);
  });

  // Role Metadata Titles
  const roleNames = {
    household: "🏠 Household Citizen Portal",
    coordinator: "📋 Field Coordinator Portal",
    collector: "🚚 Field Collector Portal",
    hub: "⚖️ Storage Hub (Authority) Station",
    recycler: "🏭 Recycler Portal",
    admin: "🗺️ Command Center (Master Control)"
  };
  const titleEl = document.getElementById("gateway-role-title");
  if (titleEl) titleEl.textContent = roleNames[role] || role.toUpperCase();

  // Configure field visibility
  const nameField = document.getElementById("gf-name-container");
  const phoneField = document.getElementById("gf-phone-container");
  const emailField = document.getElementById("gf-email-container");
  const addressField = document.getElementById("gf-address-container");
  const empIdField = document.getElementById("gf-employee-id-container");
  const passwordField = document.getElementById("gf-password-container");
  const adminNotice = document.getElementById("gf-admin-notice");
  const collectorNotice = document.getElementById("gf-collector-notice");

  // Reset notices
  if (adminNotice) adminNotice.style.display = (role === 'admin') ? "block" : "none";
  if (collectorNotice) collectorNotice.style.display = (role === 'collector') ? "block" : "none";

  if (role === 'admin') {
    if (nameField) nameField.style.display = "none";
    if (phoneField) phoneField.style.display = "none";
    if (emailField) emailField.style.display = "block";
    if (addressField) addressField.style.display = "none";
    if (empIdField) empIdField.style.display = "none";
    if (passwordField) passwordField.style.display = "block";
    
    // Set default placeholder for root owner
    const emailInput = document.getElementById("gw-email");
    if (emailInput && !emailInput.value) emailInput.placeholder = "dakssinghi@gmail.com";
  } else if (role === 'collector') {
    if (nameField) nameField.style.display = "block";
    if (phoneField) {
      phoneField.style.display = "block";
      const lbl = phoneField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = "(Optional / If any)"; lbl.className = "field-tag field-tag-opt"; }
    }
    if (emailField) {
      emailField.style.display = "block";
      const lbl = emailField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = "(Optional / If any)"; lbl.className = "field-tag field-tag-opt"; }
    }
    if (addressField) addressField.style.display = "block";
    if (empIdField) empIdField.style.display = "none";
    if (passwordField) passwordField.style.display = "none";
  } else if (role === 'coordinator') {
    if (nameField) nameField.style.display = "block";
    if (phoneField) {
      phoneField.style.display = "block";
      const lbl = phoneField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = "* Mandatory"; lbl.className = "field-tag field-tag-req"; }
    }
    if (emailField) {
      emailField.style.display = "block";
      const lbl = emailField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = "* Mandatory"; lbl.className = "field-tag field-tag-req"; }
    }
    if (addressField) addressField.style.display = "block";
    if (empIdField) empIdField.style.display = "block";
    if (passwordField) passwordField.style.display = "none";
  } else {
    // household, hub, recycler
    if (nameField) nameField.style.display = "block";
    if (phoneField) {
      phoneField.style.display = "block";
      const lbl = phoneField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = "* Mandatory"; lbl.className = "field-tag field-tag-req"; }
    }
    if (emailField) {
      emailField.style.display = "block";
      const lbl = emailField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = "* Mandatory"; lbl.className = "field-tag field-tag-req"; }
    }
    if (addressField) addressField.style.display = "block";
    if (empIdField) empIdField.style.display = "none";
    if (passwordField) passwordField.style.display = "none";
  }

  validateGatewayInputs();
}

// Live Validation: Reveal login button when all mandatory details are entered
function validateGatewayInputs() {
  const name = (document.getElementById("gw-name")?.value || "").trim();
  const phone = (document.getElementById("gw-phone")?.value || "").trim();
  const email = (document.getElementById("gw-email")?.value || "").trim();
  const address = (document.getElementById("gw-address")?.value || "").trim();
  const empId = (document.getElementById("gw-emp-id")?.value || "").trim();
  const password = (document.getElementById("gw-password")?.value || "").trim();

  let isValid = false;

  if (activeGatewayRole === 'admin') {
    // Email is required. Password can be checked or filled
    isValid = (email.length > 3 && email.includes('@'));
  } else if (activeGatewayRole === 'collector') {
    // Name and address are mandatory. Phone and email optional.
    isValid = (name.length >= 2 && address.length >= 4);
  } else if (activeGatewayRole === 'coordinator') {
    // Name, phone, email, address, and employee_id are all mandatory
    isValid = (name.length >= 2 && phone.length >= 7 && email.includes('@') && address.length >= 4 && empId.length >= 2);
  } else {
    // household, hub, recycler: Name, phone, email, address mandatory
    isValid = (name.length >= 2 && phone.length >= 7 && email.includes('@') && address.length >= 4);
  }

  const submitContainer = document.getElementById("gateway-submit-container");
  if (submitContainer) {
    submitContainer.style.display = isValid ? "block" : "none";
  }
}

// Submit Onboarding / Login Request
async function submitGatewayLogin() {
  const name = (document.getElementById("gw-name")?.value || "").trim();
  const phone = (document.getElementById("gw-phone")?.value || "").trim();
  const email = (document.getElementById("gw-email")?.value || "").trim();
  const address = (document.getElementById("gw-address")?.value || "").trim();
  const empId = (document.getElementById("gw-emp-id")?.value || "").trim();
  const password = (document.getElementById("gw-password")?.value || "").trim();

  const payload = {
    role: activeGatewayRole,
    name: name,
    phone: phone,
    email: email,
    address: address,
    employee_id: empId,
    password: password
  };

  const btn = document.getElementById("btn-gateway-submit");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-inline"></span> Encrypting & Authenticating...`;
  }

  try {
    const res = await fetch("/api/auth/register-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      alert("Authentication Error: " + (result.error || "Login failed. Please check credentials."));
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `✨ Authenticate & Enter Portal ▶`;
      }
      return;
    }

    // Handle First-Time Command Center Master Password Setup
    if (activeGatewayRole === 'admin' && result.first_time_setup) {
      pendingAdminEmail = email;
      openAdminSetupPasswordModal(email);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `✨ Authenticate & Enter Portal ▶`;
      }
      return;
    }

    // Handle Field Collector Unique ID Announcement
    if (activeGatewayRole === 'collector' && result.collector_id) {
      saveSessionAndLock(result.user);
      openCollectorCelebrationModal(result.collector_id, name);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `✨ Authenticate & Enter Portal ▶`;
      }
      return;
    }

    // Default Success: Save locally and lock chosen interface
    saveSessionAndLock(result.user);
  } catch (err) {
    alert("Connection error: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `✨ Authenticate & Enter Portal ▶`;
    }
  }
}

// Store credentials in localStorage and lock the view
function saveSessionAndLock(userData) {
  localStorage.setItem("ecoflow_user_session", JSON.stringify(userData));
  applyActiveSession(userData);
}

// Apply active session to the UI
function applyActiveSession(session) {
  const gatewayEl = document.getElementById("portal-gateway-screen");
  if (gatewayEl) gatewayEl.style.display = "none";

  const badgeEl = document.getElementById("active-session-badge");
  const rolePill = document.getElementById("session-role-pill");
  const userName = document.getElementById("session-user-name");

  if (badgeEl) {
    badgeEl.style.display = "flex";
    const roleLabels = {
      household: "🏠 Household",
      coordinator: "📋 Coordinator",
      collector: "🚚 Collector",
      hub: "⚖️ Storage Hub",
      recycler: "🏭 Recycler",
      admin: "🗺️ Command Center"
    };
    if (rolePill) rolePill.textContent = roleLabels[session.role] || session.role.toUpperCase();

    let displayStr = session.name || session.email || "Active User";
    if (session.collector_id) displayStr += ` (${session.collector_id})`;
    else if (session.employee_id) displayStr += ` (${session.employee_id})`;
    if (userName) userName.textContent = displayStr;
  }

  // Lock and activate chosen interface view
  switchPerspective(session.role);

  // If Command Center, check if whitelist or registry need initial load
  if (session.role === 'admin') {
    loadEncryptedRegistry();
    loadWhitelist();
  }
}

// Confirm Logout / Switch Portal
function confirmSwitchPortal() {
  if (confirm("Do you wish to log out and switch to another interface? Your local session will be cleared.")) {
    localStorage.removeItem("ecoflow_user_session");
    window.location.reload();
  }
}

// Collector Celebration Modal
function openCollectorCelebrationModal(collectorId, collectorName) {
  const modal = document.getElementById("collector-celebration-modal");
  const idEl = document.getElementById("modal-collector-id");
  const nameEl = document.getElementById("modal-collector-name");

  if (idEl) idEl.textContent = collectorId;
  if (nameEl) nameEl.textContent = collectorName || "Field Collector";
  if (modal) modal.classList.add("open");
}

function closeCollectorCelebrationModal() {
  const modal = document.getElementById("collector-celebration-modal");
  if (modal) modal.classList.remove("open");
  const sessionStr = localStorage.getItem("ecoflow_user_session");
  if (sessionStr) {
    applyActiveSession(JSON.parse(sessionStr));
  }
}

// Command Center First-Time Master Password Setup Modal
function openAdminSetupPasswordModal(email) {
  const modal = document.getElementById("admin-setup-password-modal");
  const emailEl = document.getElementById("admin-setup-email-display");
  if (emailEl) emailEl.textContent = email;
  if (modal) modal.classList.add("open");
}

function closeAdminSetupPasswordModal() {
  const modal = document.getElementById("admin-setup-password-modal");
  if (modal) modal.classList.remove("open");
}

async function submitAdminMasterPassword() {
  const p1 = (document.getElementById("admin-new-password")?.value || "").trim();
  const p2 = (document.getElementById("admin-confirm-password")?.value || "").trim();

  if (p1.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }
  if (p1 !== p2) {
    alert("Passwords do not match. Please re-enter.");
    return;
  }

  try {
    const res = await fetch("/api/auth/register-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "admin",
        email: pendingAdminEmail || "dakssinghi@gmail.com",
        password: p1,
        is_first_setup: true
      })
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      alert("Error: " + (result.error || "Failed to set master password."));
      return;
    }

    closeAdminSetupPasswordModal();
    alert("Master password configured and encrypted with 600,000 PBKDF2 iterations!");
    saveSessionAndLock(result.user);
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Command Center "Forgot Password" Modal & Flow
function openForgotPasswordModal() {
  const modal = document.getElementById("admin-forgot-password-modal");
  const emailInput = document.getElementById("admin-forgot-email");
  if (emailInput) emailInput.value = "dakssinghi@gmail.com";
  if (modal) modal.classList.add("open");
}

function closeForgotPasswordModal() {
  const modal = document.getElementById("admin-forgot-password-modal");
  if (modal) modal.classList.remove("open");
}

async function requestPasswordResetCode() {
  const email = (document.getElementById("admin-forgot-email")?.value || "").trim();
  if (!email) {
    alert("Please enter your administrator email.");
    return;
  }

  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      alert("Error: " + (result.error || "Unable to send reset code."));
      return;
    }

    // Step 2 reveal
    const step2 = document.getElementById("forgot-password-step2");
    if (step2) step2.style.display = "block";

    const alertBox = document.getElementById("forgot-token-alert");
    if (alertBox) {
      alertBox.innerHTML = `<strong>Verification Code Generated:</strong> <span style="font-family:monospace; color:#34D399; font-size:16px;">${result.token_preview}</span><br><small class="text-muted">A verification token has been simulated to your registered email (${email}). Enter it below to set your new password.</small>`;
      alertBox.style.display = "block";
    }

    const tokenInput = document.getElementById("admin-reset-token");
    if (tokenInput && result.token_preview) tokenInput.value = result.token_preview;
  } catch (err) {
    alert("Connection error: " + err.message);
  }
}

async function submitResetPassword() {
  const email = (document.getElementById("admin-forgot-email")?.value || "").trim();
  const token = (document.getElementById("admin-reset-token")?.value || "").trim();
  const newPass = (document.getElementById("admin-reset-new-password")?.value || "").trim();

  if (!token || !newPass) {
    alert("Please enter both the verification code and your new password.");
    return;
  }
  if (newPass.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        token: token,
        new_password: newPass
      })
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      alert("Reset Error: " + (result.error || "Failed to reset password."));
      return;
    }

    alert("Password reset successfully! Please log in with your new password.");
    closeForgotPasswordModal();
    const pwInput = document.getElementById("gw-password");
    if (pwInput) pwInput.value = newPass;
    validateGatewayInputs();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Command Center: Encrypted User Registry Loader
async function loadEncryptedRegistry() {
  const tbody = document.getElementById("encrypted-registry-tbody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/auth/registry");
    const data = await res.json();
    if (!data.registry) return;

    tbody.innerHTML = data.registry.map(u => `
      <tr>
        <td><code>${u.user_id}</code></td>
        <td><span class="status-badge status-${u.role === 'admin' ? 'verified' : 'pending'}">${u.role.toUpperCase()}</span></td>
        <td><strong>${u.name}</strong></td>
        <td>${u.phone}</td>
        <td>${u.email}</td>
        <td><small>${u.address}</small></td>
        <td><code>${u.custom_id}</code></td>
        <td><span class="registry-encrypted-pill" title="Raw AES Keystream Cipher">${u.raw_ciphertext}</span></td>
      </tr>
    `).join("");

    const countEl = document.getElementById("registry-count-badge");
    if (countEl) countEl.textContent = `${data.total_records} Encrypted Records`;
  } catch (err) {
    console.warn("Could not load encrypted registry:", err);
  }
}

// Command Center: Whitelist Management Loader
async function loadWhitelist() {
  const tbody = document.getElementById("admin-whitelist-tbody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/auth/whitelist");
    const data = await res.json();
    if (!data.whitelist) return;

    tbody.innerHTML = data.whitelist.map(w => `
      <tr>
        <td>
          <strong>${w.email}</strong>
          ${w.is_root ? '<span class="status-badge status-verified" style="margin-left:6px;">👑 ROOT OWNER</span>' : ''}
        </td>
        <td>${w.name}</td>
        <td>
          ${w.has_password ? '<span class="text-success">🔒 Encrypted (PBKDF2 600k)</span>' : '<span class="text-muted">⏳ Pending First Setup</span>'}
        </td>
        <td><small class="text-muted">${w.created_at || '—'}</small></td>
        <td>
          ${w.is_root 
            ? '<small class="text-muted">Root Protected</small>' 
            : `<button class="btn btn-sm btn-outline" style="color:#EF4444; border-color:#EF4444;" onclick="deleteWhitelistEmail('${w.email}')">Revoke Access</button>`}
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.warn("Could not load whitelist:", err);
  }
}

// Add Administrator to Whitelist
async function addWhitelistEmail() {
  const sessionStr = localStorage.getItem("ecoflow_user_session");
  const session = sessionStr ? JSON.parse(sessionStr) : {};

  if (session.email !== 'dakssinghi@gmail.com') {
    alert("Access Denied: Only Daksh Singhi (dakssinghi@gmail.com) has permission to add authorized Command Center emails.");
    return;
  }

  const targetEmail = (document.getElementById("new-admin-email")?.value || "").trim();
  const targetName = (document.getElementById("new-admin-name")?.value || "").trim() || "Command Center Officer";

  if (!targetEmail || !targetEmail.includes('@')) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    const res = await fetch("/api/auth/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caller_email: session.email,
        action: "add",
        target_email: targetEmail,
        target_name: targetName
      })
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      alert("Error: " + (result.error || "Failed to add email."));
      return;
    }

    alert(`Successfully authorized ${targetEmail} for Command Center access.`);
    const emailInput = document.getElementById("new-admin-email");
    if (emailInput) emailInput.value = "";
    loadWhitelist();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Revoke Administrator Email
async function deleteWhitelistEmail(targetEmail) {
  const sessionStr = localStorage.getItem("ecoflow_user_session");
  const session = sessionStr ? JSON.parse(sessionStr) : {};

  if (session.email !== 'dakssinghi@gmail.com') {
    alert("Access Denied: Only Daksh Singhi (dakssinghi@gmail.com) has permission to modify the whitelist.");
    return;
  }

  if (!confirm(`Are you sure you want to revoke Command Center access for ${targetEmail}?`)) return;

  try {
    const res = await fetch("/api/auth/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caller_email: session.email,
        action: "delete",
        target_email: targetEmail
      })
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      alert("Error: " + (result.error || "Failed to revoke access."));
      return;
    }

    alert(`Access revoked for ${targetEmail}.`);
    loadWhitelist();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// ====================================================
// FIELD COLLECTOR: PEER REGISTRATION (NO PHYSICAL PHONE)
// Generates COL-NP-2026-XXXXX with physical lot pass
// ====================================================
function openPhonelessCollectorModal() {
  const modal = document.getElementById("phoneless-collector-modal");
  if (!modal) return;
  modal.style.display = "flex";

  const formBody = document.getElementById("phoneless-form-body");
  const resultCard = document.getElementById("phoneless-pass-result");
  if (formBody) formBody.style.display = "block";
  if (resultCard) resultCard.style.display = "none";

  const nameInput = document.getElementById("np-collector-name");
  const addrInput = document.getElementById("np-collector-address");
  const matInput = document.getElementById("np-collector-materials");
  const contactInput = document.getElementById("np-collector-contact");
  if (nameInput) nameInput.value = "";
  if (addrInput) addrInput.value = "";
  if (matInput) matInput.value = "";
  if (contactInput) contactInput.value = "";
}

function closePhonelessCollectorModal() {
  const modal = document.getElementById("phoneless-collector-modal");
  if (modal) modal.style.display = "none";
}

async function submitPhonelessRegistration() {
  const name = (document.getElementById("np-collector-name")?.value || "").trim();
  const address = (document.getElementById("np-collector-address")?.value || "").trim();
  const hub = document.getElementById("np-collector-hub")?.value || "HUB-001";
  const materials = (document.getElementById("np-collector-materials")?.value || "").trim();
  const contact = (document.getElementById("np-collector-contact")?.value || "").trim();

  if (!name || name.length < 2) {
    alert("Please enter the collector's full name.");
    return;
  }
  if (!address || address.length < 4) {
    alert("Please enter the operating address or scrap cluster location.");
    return;
  }

  try {
    const res = await fetch("/api/auth/register-phoneless", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "no_phone",
        name: name,
        address: address,
        storage_hub_id: hub,
        materials: materials,
        emergency_contact: contact,
        service_zone: "ZONE B"
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert("Registration error: " + (data.error || "Failed to register."));
      return;
    }

    // Display Printable Token Pass
    const formBody = document.getElementById("phoneless-form-body");
    const resultCard = document.getElementById("phoneless-pass-result");
    const idEl = document.getElementById("np-result-id");
    const nameEl = document.getElementById("np-result-name");
    const hubEl = document.getElementById("np-result-hub");
    const qrCanvas = document.getElementById("np-pass-qr");

    if (formBody) formBody.style.display = "none";
    if (resultCard) resultCard.style.display = "block";
    if (idEl) idEl.textContent = data.collector_id;
    if (nameEl) nameEl.textContent = name;
    if (hubEl) hubEl.textContent = hub;

    // Render physical pass QR code
    if (qrCanvas && typeof qrEngine !== "undefined") {
      qrEngine.renderQR(qrCanvas, `ECOFLOW-COL-TOKEN:${data.collector_id}`, 140);
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
}

// ====================================================
// FIELD COORDINATOR: 10KM PROXIMITY SMS ONBOARDING (BASIC PHONE)
// Interactive 2-Choice Flash SMS (1 = Accept, 2 = Decline)
// Issues COL-NS-2026-XXXXX and strictly ERASES candidate
// personal details from Coordinator Local Storage.
// ====================================================
let activeSMSCandidate = null;

function triggerProximitySMS(name, phone, location, distance, cardId) {
  activeSMSCandidate = { name, phone, location, distance, cardId };
  openSMSInviteModal(activeSMSCandidate);
}

function triggerCustomProximitySMS() {
  const phone = (document.getElementById("custom-sms-phone")?.value || "").trim();
  const name = (document.getElementById("custom-sms-name")?.value || "").trim() || "Kabadiwala Partner";
  const location = document.getElementById("custom-sms-location")?.value || "Kamrup Metro 10km Zone";

  if (!phone || phone.length < 8) {
    alert("Please enter a valid mobile number for the proximity SMS broadcast.");
    return;
  }

  activeSMSCandidate = { name, phone, location, distance: "10 km geofence", cardId: null };
  openSMSInviteModal(activeSMSCandidate);
}

function openSMSInviteModal(candidate) {
  const modal = document.getElementById("sms-invite-modal");
  if (!modal) return;

  const screenInvite = document.getElementById("phone-screen-invite");
  const screenAccepted = document.getElementById("phone-screen-accepted");
  const screenDeclined = document.getElementById("phone-screen-declined");
  const msgEl = document.getElementById("phone-msg-text");
  const clockEl = document.getElementById("phone-brand-clock");

  if (screenInvite) screenInvite.style.display = "block";
  if (screenAccepted) screenAccepted.style.display = "none";
  if (screenDeclined) screenDeclined.style.display = "none";

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (clockEl) clockEl.textContent = timeStr;

  if (msgEl) {
    msgEl.textContent = `[FLASH SMS POPUP]
From: +91 80000 32635
ECOFLOW AI RECYCLING NETWORK

Nearby collection opportunity within 10 km radius (${candidate.distance || '10km zone'}).
Candidate: ${candidate.name || 'Kabadiwala'}
Guaranteed daily payouts at verified Hub-001.

Interactive choices:
Press 1 to ACCEPT & get ID
Press 2 to DECLINE`;
  }

  modal.style.display = "flex";
}

function closeSMSInviteModal() {
  const modal = document.getElementById("sms-invite-modal");
  if (modal) modal.style.display = "none";
  activeSMSCandidate = null;
}

async function respondToSMSInvite(choice) {
  const screenInvite = document.getElementById("phone-screen-invite");
  const screenAccepted = document.getElementById("phone-screen-accepted");
  const screenDeclined = document.getElementById("phone-screen-declined");

  if (choice === '2') {
    // Declined option
    if (screenInvite) screenInvite.style.display = "none";
    if (screenDeclined) screenDeclined.style.display = "block";
    setTimeout(() => {
      closeSMSInviteModal();
    }, 2200);
    return;
  }

  if (choice === '1') {
    // Accepted option
    const candidateData = activeSMSCandidate || {
      name: "Kabadiwala Aggregator",
      phone: "+91 98640 88121",
      location: "Kamrup Metro 10km Zone",
      cardId: null
    };

    try {
      const res = await fetch("/api/auth/register-phoneless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "basic_phone",
          name: candidateData.name,
          phone: candidateData.phone,
          address: candidateData.location,
          service_zone: "ZONE B"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Registration failed: " + (data.error || "Could not register candidate."));
        return;
      }

      // Display automated incoming confirmation SMS on feature phone LCD
      if (screenInvite) screenInvite.style.display = "none";
      if (screenAccepted) screenAccepted.style.display = "block";
      const idEl = document.getElementById("phone-registered-id");
      if (idEl) idEl.textContent = data.collector_id;

      // ====================================================
      // STRICT PRIVACY PROTOCOL ENFORCEMENT:
      // Completely erase candidate personal details from
      // Coordinator's device local storage.
      // Coordinator cannot view candidate raw personal data.
      // ====================================================
      localStorage.removeItem("active_candidate_data");
      localStorage.removeItem("last_invited_kabadiwala");
      sessionStorage.removeItem("active_candidate_data");

      const savedCardId = candidateData.cardId;
      activeSMSCandidate = null; // Purge memory references

      // Update coordinator candidate card to show sealed record
      if (savedCardId) {
        const cardEl = document.getElementById(savedCardId);
        if (cardEl) {
          cardEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: #34D399;">${data.collector_id}</strong>
              <span class="status-pill status-verified" style="font-size: 9px;">ACTIVE</span>
            </div>
            <p class="small text-muted mb-1">Mode: <strong>Basic Phone (SMS Only)</strong></p>
            <p class="small text-muted mb-1">Identity: <span style="color:#94A3B8; font-family: monospace;">[🔒 RECORD SEALED & ENCRYPTED]</span></p>
            <p class="small text-muted mb-2">Personal Data: <span style="color:#94A3B8; font-family: monospace;">[ERASED FROM LOCAL STORAGE]</span></p>
            <span class="badge-green" style="font-size: 10px; width: 100%; display: block; text-align: center; padding: 4px;">
              🔒 Privacy Protocol Enforced
            </span>
          `;
        }
      }

      // Display Coordinator Privacy Audit Banner
      const privacyBanner = document.getElementById("coord-privacy-banner");
      if (privacyBanner) privacyBanner.style.display = "flex";

    } catch (err) {
      alert("Network error: " + err.message);
    }
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
});
