/**
 * EcoFlow AI - Authentication & Interface Gateway Module
 * Handles role-based authentication, PBKDF2/AES database encryption,
 * persistent local session lock, unique collector ID generation,
 * and Command Center access control for Daksh Singhi (dakssinghi@gmail.com).
 */

// Ensure global application state is initialized
window.appState = window.appState || {
  currentRole: 'household',
  householdTab: 'home',
  activeLotId: null,
  adminTab: 'map',
  collectorMode: 'online',
  commandMap: null,
  currentScanResult: null,
  householdMap: null,
  stats: {}
};
var appState = window.appState;

let activeGatewayRole = 'household';
let pendingAdminEmail = '';

// Bypass Mode Status (Can be fully restored on instruction)
const IS_LOGIN_BYPASS_ACTIVE = true;

// Initialize in Bypass Mode (Direct access to all interfaces)
function initAuth() {
  const gatewayEl = document.getElementById("portal-gateway-screen");
  if (gatewayEl) gatewayEl.style.display = "none";

  const badgeEl = document.getElementById("active-session-badge");
  if (badgeEl) badgeEl.style.display = "none";

  // In bypass mode, activate chosen role (saved or default to household)
  const savedRole = localStorage.getItem("ecoflow_bypass_role") || "household";
  bypassSwitchRole(savedRole);
}

// Direct bypass role switcher
function bypassSwitchRole(role) {
  activeGatewayRole = role;
  localStorage.setItem("ecoflow_bypass_role", role);

  // Update button active state in the bypass navigation bar
  document.querySelectorAll(".bypass-role-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.role === role);
  });

  // Mock sessions for direct full access
  const customName = (typeof getActiveUserName === "function") ? getActiveUserName("") : (localStorage.getItem("ecoflow_custom_user_name") || "");
  const mockSessions = {
    household: { role: 'household', name: customName || 'Citizen User', email: 'citizen@ecoflow.gov.in', address: 'House 42, Green Park Avenue, North Zone, Guwahati' },
    coordinator: { role: 'coordinator', name: customName || 'Field Operations Coordinator', employee_id: 'EMP-2026-101', email: 'coordinator@ecoflow.gov.in', address: 'Zonal Command Office, Sector 4' },
    collector: { role: 'collector', name: customName || 'Field Collector', collector_id: 'COL-2026-00142', email: 'collector@ecoflow.gov.in', address: 'North Zone Municipal Shed' },
    hub: { role: 'hub', name: customName || 'Storage Hub Authority', email: 'hub.central@ecoflow.gov.in', address: 'Municipal Weigh Station & Intake Hub' },
    recycler: { role: 'recycler', name: customName || 'Industrial Recycling Partner', email: 'procurement@greenindia.in', address: 'Industrial Estate, Phase II' },
    admin: { role: 'admin', name: customName || 'Platform Administrator', email: 'dakssinghi@gmail.com', is_root: true }
  };

  const user = mockSessions[role] || { role: role, name: customName || 'Active User' };
  localStorage.setItem("ecoflow_user_session", JSON.stringify(user));

  // Hide Gateway screen completely
  const gatewayEl = document.getElementById("portal-gateway-screen");
  if (gatewayEl) gatewayEl.style.display = "none";

  // Switch perspective view
  switchPerspective(role);

  // Update dynamic user names across all headers and greetings
  if (typeof updateAllInterfaceUserNames === "function") {
    updateAllInterfaceUserNames();
  }

  // Load role data immediately without restrictions
  if (role === 'admin') {
    if (typeof loadEncryptedRegistry === "function") loadEncryptedRegistry();
    if (typeof loadWhitelist === "function") loadWhitelist();
    if (typeof loadAdminCoordinators === "function") loadAdminCoordinators();
    if (typeof loadAIModels === "function") loadAIModels();
    if (typeof loadAuditLogs === "function") loadAuditLogs();
  } else if (role === 'coordinator') {
    if (typeof loadCoordinatorFleet === "function") loadCoordinatorFleet();
    if (typeof loadCoordinatorQueue === "function") loadCoordinatorQueue();
  } else if (role === 'collector') {
    if (typeof loadCollectorTasks === "function") loadCollectorTasks();
  } else if (role === 'hub') {
    if (typeof loadHubPendingLots === "function") loadHubPendingLots();
    if (typeof renderHubMaterialRows === "function") renderHubMaterialRows();
  } else if (role === 'recycler') {
    if (typeof loadRecyclerPortalData === "function") loadRecyclerPortalData();
  }
}

// Select interface role in the gateway (clicking any card opens that role immediately)
function selectGatewayRole(role) {
  bypassSwitchRole(role);
  updateGatewayRoleTitle(role);
}

function updateGatewayRoleTitle(role = activeGatewayRole) {
  const roleNames = {
    household: (typeof t === 'function' ? t('gw.role_household_portal', "🏠 Household Citizen Portal") : "🏠 Household Citizen Portal"),
    coordinator: (typeof t === 'function' ? t('gw.role_coordinator_portal', "📋 Field Coordinator Portal") : "📋 Field Coordinator Portal"),
    collector: (typeof t === 'function' ? t('gw.role_collector_portal', "🚚 Field Collector Portal") : "🚚 Field Collector Portal"),
    hub: (typeof t === 'function' ? t('gw.role_hub_portal', "⚖️ Storage Hub (Authority) Station") : "⚖️ Storage Hub (Authority) Station"),
    recycler: (typeof t === 'function' ? t('gw.role_recycler_portal', "🏭 Recycler Portal") : "🏭 Recycler Portal"),
    admin: (typeof t === 'function' ? t('gw.role_admin_portal', "🗺️ Command Center (Master Control)") : "🗺️ Command Center (Master Control)")
  };
  const titleEl = document.getElementById("gateway-role-title");
  if (titleEl) titleEl.textContent = roleNames[role] || (role ? role.toUpperCase() : "");
}

// Live Validation: Reveal login button when all mandatory details are entered
function validateGatewayInputs() {
  const submitContainer = document.getElementById("gateway-submit-container");
  if (submitContainer) {
    submitContainer.style.display = "block";
  }
}

// Submit Onboarding / Login Request (Bypass Mode Active)
async function submitGatewayLogin() {
  bypassSwitchRole(activeGatewayRole || 'household');
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

  // If Command Center, check if whitelist, registry, or coordinator directory need initial load
  if (session.role === 'admin') {
    loadEncryptedRegistry();
    loadWhitelist();
    loadAdminCoordinators();
  } else if (session.role === 'coordinator') {
    loadCoordinatorFleet();
  }
}

// Confirm Logout / Switch Portal (Bypass Mode Active)
function confirmSwitchPortal() {
  bypassSwitchRole('household');
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

// Command Center First-Time Master Password Setup Modal (Bypass Mode)
function openAdminSetupPasswordModal(email) {
  bypassSwitchRole('admin');
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

// ====================================================
// FIELD COORDINATOR: FLEET MANAGEMENT & ADD COLLECTORS
// Direct authority to onboard Mode 1, Mode 2, and Mode 3 collectors
// ====================================================
async function loadCoordinatorFleet() {
  const container = document.getElementById("coordinator-fleet-list");
  if (!container) return;

  try {
    const res = await fetch("/api/employees");
    const data = await res.json();
    const emps = data.employees || [];

    if (emps.length === 0) {
      container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1;">No collectors found in fleet roster.</p>`;
      return;
    }

    container.innerHTML = emps.map(e => {
      const isNoPhone = e.mode === 'no_phone' || (e.employee_id && e.employee_id.includes('-NP-'));
      const isBasicPhone = e.mode === 'basic_phone' || (e.employee_id && e.employee_id.includes('-NS-'));
      const modeTitle = isNoPhone ? "Mode 3: No Physical Phone" : (isBasicPhone ? "Mode 2: Basic SMS Phone" : "Mode 1: Smartphone App");
      const modeBadge = isNoPhone ? "status-verified" : (isBasicPhone ? "badge-green" : "badge-green");
      const phoneDisplay = isNoPhone ? "📴 No Physical Phone" : (e.phone ? escapeHtml(e.phone) : "—");

      return `
        <div class="inspector-card" id="fleet-card-${e.employee_id}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong>${escapeHtml(e.name)}</strong>
            <span class="${modeBadge}" style="font-size: 9.5px;">${e.availability || 'AVAILABLE'}</span>
          </div>
          <p class="small text-muted mb-1">ID: <code style="color: #34D399; font-weight: 700;">${e.employee_id}</code></p>
          <p class="small text-muted mb-1">Mode: <strong>${modeTitle}</strong></p>
          <p class="small text-muted mb-1">Contact: <span>${phoneDisplay}</span></p>
          <p class="small text-muted mb-2">Zone: <strong>${e.service_zone}</strong> • Hub: <strong>${e.assigned_hub || 'HUB-001'}</strong> • Workload: ${e.workload || 0}</p>
          <div style="display: flex; gap: 6px;">
            ${isNoPhone 
              ? `<button class="btn btn-sm btn-outline btn-block" onclick="switchPerspective('collector'); switchCollectorMode('mode3');">Open Dispatch Sheet ➔</button>`
              : (isBasicPhone 
                ? `<button class="btn btn-sm btn-outline btn-block" onclick="switchPerspective('collector'); switchCollectorMode('mode2');">Open SMS Terminal ➔</button>`
                : `<button class="btn btn-sm btn-outline btn-block" onclick="switchPerspective('collector'); switchCollectorMode('mode1');">Open App Terminal ➔</button>`
              )
            }
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.warn("Could not load coordinator fleet:", err);
  }
}

function openCoordinatorAddCollectorModal(defaultMode) {
  const modal = document.getElementById("coord-add-collector-modal");
  if (!modal) return;
  modal.style.display = "flex";

  const formBody = document.getElementById("coord-add-collector-form-body");
  const passResult = document.getElementById("coord-collector-pass-result");
  if (formBody) formBody.style.display = "block";
  if (passResult) passResult.style.display = "none";

  const modeSel = document.getElementById("coord-col-mode");
  if (modeSel) {
    modeSel.value = defaultMode || "smartphone";
    onCoordinatorModeChange(modeSel.value);
  }

  const nameInput = document.getElementById("coord-col-name");
  const phoneInput = document.getElementById("coord-col-phone");
  const addrInput = document.getElementById("coord-col-address");
  if (nameInput) nameInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (addrInput) addrInput.value = "";
}

function closeCoordinatorAddCollectorModal() {
  const modal = document.getElementById("coord-add-collector-modal");
  if (modal) modal.style.display = "none";
  loadCoordinatorFleet();
}

function onCoordinatorModeChange(mode) {
  const phoneGroup = document.getElementById("coord-col-phone-group");
  const noteEl = document.getElementById("coord-col-id-note");
  if (mode === 'no_phone') {
    if (phoneGroup) phoneGroup.style.display = "none";
    if (noteEl) {
      noteEl.innerHTML = `📴 <strong>No Phone Protocol:</strong> Generates unique ID <code>COL-NP-2026-XXXXX</code> ('NP' signifies No Physical Phone). A printable QR lot pass will be generated on completion.`;
    }
  } else if (mode === 'basic_phone') {
    if (phoneGroup) phoneGroup.style.display = "block";
    if (noteEl) {
      noteEl.innerHTML = `💬 <strong>Basic SMS Protocol:</strong> Generates unique ID <code>COL-NS-2026-XXXXX</code> ('NS' signifies No Smartphone / Basic SMS). Collector receives assignments via 2G SMS.`;
    }
  } else {
    if (phoneGroup) phoneGroup.style.display = "block";
    if (noteEl) {
      noteEl.innerHTML = `📱 <strong>Smartphone App Protocol:</strong> Generates unique ID <code>COL-2026-XXXXX</code> with full digital QR workflow and offline synchronization.`;
    }
  }
}

async function submitCoordinatorAddCollector() {
  const mode = document.getElementById("coord-col-mode")?.value || "smartphone";
  const name = (document.getElementById("coord-col-name")?.value || "").trim();
  const phone = (document.getElementById("coord-col-phone")?.value || "").trim();
  const address = (document.getElementById("coord-col-address")?.value || "").trim();
  const zone = document.getElementById("coord-col-zone")?.value || "ZONE B";
  const hub = document.getElementById("coord-col-hub")?.value || "HUB-001";
  const materials = (document.getElementById("coord-col-materials")?.value || "").trim() || "Mixed Recyclables";

  if (!name || name.length < 2) {
    alert("Please enter the collector's full name.");
    return;
  }
  if (mode !== 'no_phone' && (!phone || phone.length < 8)) {
    alert("Please enter a valid mobile number for this collector.");
    return;
  }
  if (!address || address.length < 4) {
    alert("Please enter the operating address or scrap cluster location.");
    return;
  }

  try {
    const res = await fetch("/api/coordinator/add-collector", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: mode,
        name: name,
        phone: phone,
        address: address,
        service_zone: zone,
        assigned_hub: hub,
        specialization: materials
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert("Registration Error: " + (data.error || "Failed to onboard collector."));
      return;
    }

    // Strict Zero-Knowledge Privacy Protocol: clear local storage
    localStorage.removeItem("last_added_collector_temp");
    sessionStorage.removeItem("last_added_collector_temp");

    if (mode === 'no_phone') {
      // Show Printable Token Pass with COL-NP- ID
      const formBody = document.getElementById("coord-add-collector-form-body");
      const passResult = document.getElementById("coord-collector-pass-result");
      const idEl = document.getElementById("coord-col-result-id");
      const nameEl = document.getElementById("coord-col-result-name");
      const zoneEl = document.getElementById("coord-col-result-zone");
      const qrCanvas = document.getElementById("coord-col-pass-qr");

      if (formBody) formBody.style.display = "none";
      if (passResult) passResult.style.display = "block";
      if (idEl) idEl.textContent = data.collector_id;
      if (nameEl) nameEl.textContent = name;
      if (zoneEl) zoneEl.textContent = zone;

      if (qrCanvas && typeof qrEngine !== "undefined") {
        qrEngine.renderQR(qrCanvas, `ECOFLOW-COL-TOKEN:${data.collector_id}`, 140);
      }
    } else {
      alert(`🎉 Collector Successfully Onboarded to Fleet!\n\nCollector: ${name}\nID: ${data.collector_id}\nMode: ${mode.toUpperCase()}\nZone: ${zone}\n\nCredentials encrypted in master database.`);
      closeCoordinatorAddCollectorModal();
    }

    loadCoordinatorFleet();
  } catch (err) {
    alert("Network Error: " + err.message);
  }
}

// ====================================================
// COMMAND CENTER: AUTHORIZED COORDINATORS DIRECTORY
// Verifies employee IDs allowed to access Field Coordinator Interface
// ====================================================
async function loadAdminCoordinators() {
  const tbody = document.getElementById("admin-coordinators-tbody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/admin/coordinators");
    const data = await res.json();
    if (!data.coordinators) return;

    tbody.innerHTML = data.coordinators.map(c => `
      <tr>
        <td><code style="color: #34D399; font-weight: 700; font-size: 13px;">${c.employee_id}</code></td>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td><span class="category-tag tag-metal">${c.service_zone}</span></td>
        <td>${c.email || '—'}</td>
        <td>${c.phone || '—'}</td>
        <td><span class="status-badge status-verified">ACTIVE (AUTHORIZED)</span></td>
      </tr>
    `).join("");

    const countEl = document.getElementById("admin-coord-count-badge");
    if (countEl) countEl.textContent = `${data.count || data.coordinators.length} Verified Officers`;
  } catch (err) {
    console.warn("Could not load authorized coordinators:", err);
  }
}

async function adminAuthorizeCoordinator() {
  const empId = (document.getElementById("new-coord-empid")?.value || "").trim().toUpperCase();
  const name = (document.getElementById("new-coord-name")?.value || "").trim();
  const zone = document.getElementById("new-coord-zone")?.value || "ZONE B";
  const email = (document.getElementById("new-coord-email")?.value || "").trim();

  if (!empId || empId.length < 3) {
    alert("Please enter a valid Employee ID (e.g. EMP-2026-105).");
    return;
  }
  if (!name || name.length < 2) {
    alert("Please enter the Coordinator's full name.");
    return;
  }

  try {
    const res = await fetch("/api/admin/coordinators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: empId,
        name: name,
        service_zone: zone,
        email: email
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert("Authorization Error: " + (data.error || "Failed to authorize coordinator."));
      return;
    }

    alert(`✅ Employee ID ${empId} successfully authorized in Command Center Directory for ${name} (${zone}).`);
    const idInput = document.getElementById("new-coord-empid");
    const nameInput = document.getElementById("new-coord-name");
    const emailInput = document.getElementById("new-coord-email");
    if (idInput) idInput.value = "";
    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";

    loadAdminCoordinators();
  } catch (err) {
    alert("Network Error: " + err.message);
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
});
