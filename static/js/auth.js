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

// Bypass Mode Status (Disabled - Full Production Cryptographic Vault Active)
const IS_LOGIN_BYPASS_ACTIVE = false;

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
  if (role === 'recycler') role = 'household';
  activeGatewayRole = role;

  // Update card selections
  document.querySelectorAll(".portal-role-card").forEach(card => {
    card.classList.toggle("selected", card.dataset.role === role);
  });

  // Toggle Cosmic Purple theme for admin/command center
  if (role === 'admin') {
    document.body.classList.add('cosmic-admin-theme');
  } else {
    document.body.classList.remove('cosmic-admin-theme');
  }

  // Voice Guide Bar (TTS) and Voice Assistant visibility:
  // Strictly remove Voice Guide feature for Command Center (admin) and Field Coordinator (coordinator)
  document.body.dataset.gatewayRole = role;
  const ttsBar = document.getElementById("gateway-tts-bar");
  const topVoiceBtn = document.querySelector(".voice-btn-top");
  if (role === 'admin' || role === 'coordinator') {
    if (ttsBar) ttsBar.style.display = "none";
    if (topVoiceBtn) topVoiceBtn.style.display = "none";
    if (typeof loginTTSNarrator !== 'undefined' && loginTTSNarrator) {
      loginTTSNarrator.stopNarrator();
      loginTTSNarrator.isEnabled = false;
      loginTTSNarrator.updateToggleUI();
    }
  } else {
    if (ttsBar) ttsBar.style.display = "flex";
    if (topVoiceBtn) topVoiceBtn.style.display = (role === 'household') ? "inline-flex" : "none";
    if (typeof loginTTSNarrator !== 'undefined' && loginTTSNarrator) {
      loginTTSNarrator.updateToggleUI();
    }
  }

  // Role Metadata Titles
  updateGatewayRoleTitle(role);

  // Configure field visibility
  const nameField = document.getElementById("gf-name-container");
  const phoneField = document.getElementById("gf-phone-container");
  const emailField = document.getElementById("gf-email-container");
  const addressField = document.getElementById("gf-address-container");
  const empIdField = document.getElementById("gf-employee-id-container");
  const colIdField = document.getElementById("gf-collector-id-container");
  const passwordField = document.getElementById("gf-password-container");
  const adminNotice = document.getElementById("gf-admin-notice");
  const collectorNotice = document.getElementById("gf-collector-notice");

  // Reset notices
  if (adminNotice) adminNotice.style.display = (role === 'admin') ? "block" : "none";
  if (collectorNotice) collectorNotice.style.display = (role === 'collector') ? "block" : "none";

  const reqText = typeof t === 'function' ? t('gw.mandatory', '* Mandatory') : '* Mandatory';
  const optText = typeof t === 'function' ? t('gw.optional', '(Optional / If any)') : '(Optional / If any)';

  if (role === 'admin') {
    if (nameField) nameField.style.display = "none";
    if (phoneField) phoneField.style.display = "none";
    if (emailField) emailField.style.display = "block";
    if (addressField) addressField.style.display = "none";
    if (empIdField) empIdField.style.display = "none";
    if (colIdField) colIdField.style.display = "none";
    if (passwordField) passwordField.style.display = "block";
    
    // Do not prefill email; let user enter email to trigger recognition
    const emailInput = document.getElementById("gw-email");
    if (emailInput) {
      emailInput.placeholder = "e.g. officer@ecoflow.ai or dakssinghi@gmail.com";
      setTimeout(() => emailInput.focus(), 80);
    }
    const pwdLabelEl = document.getElementById("gw-password-label-text");
    if (pwdLabelEl) {
      pwdLabelEl.textContent = (typeof t === 'function' ? t('gw.password_label', "Password") : "Password");
      pwdLabelEl.classList.remove("master-recognized-label");
    }
  } else if (role === 'collector') {
    if (nameField) nameField.style.display = "block";
    if (phoneField) {
      phoneField.style.display = "block";
      const lbl = phoneField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = optText; lbl.className = "field-tag field-tag-opt"; }
    }
    if (emailField) {
      emailField.style.display = "block";
      const lbl = emailField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = optText; lbl.className = "field-tag field-tag-opt"; }
    }
    if (addressField) addressField.style.display = "block";
    if (empIdField) empIdField.style.display = "none";
    if (colIdField) colIdField.style.display = "block";
    if (passwordField) passwordField.style.display = "none";
  } else if (role === 'coordinator') {
    if (nameField) nameField.style.display = "block";
    if (phoneField) {
      phoneField.style.display = "block";
      const lbl = phoneField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = reqText; lbl.className = "field-tag field-tag-req"; }
    }
    if (emailField) {
      emailField.style.display = "block";
      const lbl = emailField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = reqText; lbl.className = "field-tag field-tag-req"; }
    }
    if (addressField) addressField.style.display = "block";
    if (empIdField) empIdField.style.display = "block";
    if (colIdField) colIdField.style.display = "none";
    if (passwordField) passwordField.style.display = "none";
  } else {
    // household, hub
    if (nameField) nameField.style.display = "block";
    if (phoneField) {
      phoneField.style.display = "block";
      const lbl = phoneField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = reqText; lbl.className = "field-tag field-tag-req"; }
    }
    if (emailField) {
      emailField.style.display = "block";
      const lbl = emailField.querySelector(".field-tag");
      if (lbl) { lbl.textContent = reqText; lbl.className = "field-tag field-tag-req"; }
    }
    if (addressField) addressField.style.display = "block";
    if (empIdField) empIdField.style.display = "none";
    if (colIdField) colIdField.style.display = "none";
    if (passwordField) passwordField.style.display = "none";
  }

  validateGatewayInputs();
}

function updateGatewayRoleTitle(role = activeGatewayRole) {
  const roleNames = {
    household: (typeof t === 'function' ? t('gw.role_household_portal', "🏠 Household Citizen Portal") : "🏠 Household Citizen Portal"),
    coordinator: (typeof t === 'function' ? t('gw.role_coordinator_portal', "📋 Field Coordinator Portal") : "📋 Field Coordinator Portal"),
    collector: (typeof t === 'function' ? t('gw.role_collector_portal', "🚚 Field Collector Portal") : "🚚 Field Collector Portal"),
    hub: (typeof t === 'function' ? t('gw.role_hub_portal', "⚖️ Storage Hub (Authority) Station") : "⚖️ Storage Hub (Authority) Station"),
    admin: (typeof t === 'function' ? t('gw.role_admin_portal', "🗺️ Command Center") : "🗺️ Command Center")
  };
  const titleEl = document.getElementById("gateway-role-title");
  if (titleEl) {
    titleEl.textContent = roleNames[role] || (role ? role.toUpperCase() : "");
    titleEl.classList.remove("master-recognized");
  }
}

// List of well-known valid email domain TLDs and popular providers
const VALID_EMAIL_TLDS = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'io', 'co', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp',
  'in', 'br', 'it', 'es', 'nl', 'se', 'no', 'fi', 'dk', 'pl', 'cz', 'sk', 'at', 'ch', 'be', 'pt', 'ie',
  'nz', 'za', 'mx', 'ar', 'cl', 'co', 'kr', 'cn', 'tw', 'hk', 'sg', 'my', 'th', 'ph', 'id', 'vn',
  'ru', 'ua', 'tr', 'il', 'ae', 'sa', 'eg', 'ng', 'ke', 'gh', 'tz', 'info', 'biz', 'name', 'pro',
  'xyz', 'online', 'site', 'tech', 'store', 'app', 'dev', 'ai', 'me', 'tv', 'cc', 'ws', 'mobi',
  'asia', 'tel', 'museum', 'aero', 'coop', 'jobs', 'travel', 'cat', 'post', 'ac', 'ad'
];

/**
 * Validates if an email address has a valid domain name with a recognized TLD.
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email domain is valid
 */
function isValidEmailDomain(email) {
  if (!email || !email.includes('@')) return false;

  // Basic email regex: local@domain.tld
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  // Extract the domain part
  const domain = email.split('@')[1].toLowerCase();
  if (!domain || domain.length < 3) return false;

  // Extract TLD from domain
  const parts = domain.split('.');
  if (parts.length < 2) return false;

  const tld = parts[parts.length - 1];
  // Check if TLD is in our known list OR has 2-6 characters (covers country codes and new gTLDs)
  if (VALID_EMAIL_TLDS.includes(tld) || (tld.length >= 2 && tld.length <= 6 && /^[a-z]+$/.test(tld))) {
    // Additional check: domain part before TLD should be at least 1 char
    const domainName = parts.slice(0, -1).join('.');
    return domainName.length >= 1 && !/^[\-.]|[\-.]$/.test(domainName);
  }

  return false;
}

/**
 * Shows/hides the email validation error message and styles the input field.
 * Called on every keystroke in the email field.
 */
function validateEmailDomain() {
  const emailInput = document.getElementById('gw-email');
  const errorEl = document.getElementById('email-domain-error');
  if (!emailInput || !errorEl) return;

  const email = emailInput.value.trim();

  // Don't show error if field is empty or too short (user still typing)
  if (email.length < 3 || !email.includes('@')) {
    errorEl.classList.remove('visible');
    emailInput.classList.remove('input-error', 'input-valid');
    return;
  }

  // Check if the part after @ has started (user is typing domain)
  const afterAt = email.split('@')[1] || '';
  if (afterAt.length < 2) {
    errorEl.classList.remove('visible');
    emailInput.classList.remove('input-error', 'input-valid');
    return;
  }

  if (isValidEmailDomain(email)) {
    errorEl.classList.remove('visible');
    emailInput.classList.remove('input-error');
    emailInput.classList.add('input-valid');
  } else {
    errorEl.classList.add('visible');
    emailInput.classList.add('input-error');
    emailInput.classList.remove('input-valid');
  }
}

// Live Validation: Reveal login button when all mandatory details are entered
function validateGatewayInputs() {
  const name = (document.getElementById("gw-name")?.value || "").trim();
  const phone = (document.getElementById("gw-phone")?.value || "").trim();
  const email = (document.getElementById("gw-email")?.value || "").trim();
  const address = (document.getElementById("gw-address")?.value || "").trim();
  const empId = (document.getElementById("gw-emp-id")?.value || "").trim();
  const password = (document.getElementById("gw-password")?.value || "").trim();
  const colId = (document.getElementById("gw-collector-id")?.value || "").trim();

  // Email domain validation — block submission if invalid domain
  const emailDomainOk = email.length === 0 || isValidEmailDomain(email);

  let isValid = false;

  if (activeGatewayRole === 'admin') {
    const titleEl = document.getElementById("gateway-role-title");
    const pwdLabelEl = document.getElementById("gw-password-label-text");
    const isMasterEmail = (email.toLowerCase() === 'dakssinghi@gmail.com');

    if (isMasterEmail) {
      if (titleEl) {
        titleEl.textContent = (typeof t === 'function' ? t('gw.role_admin_portal_master', "🗺️ Command Center (Master Control)") : "🗺️ Command Center (Master Control)");
        titleEl.classList.add("master-recognized");
      }
      if (pwdLabelEl) {
        pwdLabelEl.textContent = (typeof t === 'function' ? t('gw.password_label_master', "Master Password") : "Master Password");
        pwdLabelEl.classList.add("master-recognized-label");
      }
    } else {
      if (titleEl) {
        titleEl.textContent = (typeof t === 'function' ? t('gw.role_admin_portal', "🗺️ Command Center") : "🗺️ Command Center");
        titleEl.classList.remove("master-recognized");
      }
      if (pwdLabelEl) {
        pwdLabelEl.textContent = (typeof t === 'function' ? t('gw.password_label', "Password") : "Password");
        pwdLabelEl.classList.remove("master-recognized-label");
      }
    }

    // Email is mandatory and Password is required directly
    isValid = (email.length > 3 && isValidEmailDomain(email) && password.length >= 1);
  } else if (activeGatewayRole === 'collector') {
    // Either entering existing collector ID, OR registering new with Name and Address
    if (colId.length >= 4) {
      isValid = true;
    } else {
      isValid = (name.length >= 2 && address.length >= 4);
    }
  } else if (activeGatewayRole === 'coordinator') {
    // Name, phone, email, address, and employee_id are all mandatory
    isValid = (name.length >= 2 && phone.length >= 7 && isValidEmailDomain(email) && address.length >= 4 && empId.length >= 2);
  } else {
    // household, hub: Name, phone, email, address mandatory
    isValid = (name.length >= 2 && phone.length >= 7 && isValidEmailDomain(email) && address.length >= 4);
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
  const colId = (document.getElementById("gw-collector-id")?.value || "").trim();

  // If restoring existing collector ID directly from gateway
  if (activeGatewayRole === 'collector' && colId) {
    if (typeof submitRestoreSmartphoneWork === "function") {
      submitRestoreSmartphoneWork(colId);
      return;
    }
  }

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

// ====================================================
// MASTER PASSWORD VERIFICATION CONTROLLER
// Strict Security: Prompt master password for all administrative changes
// ====================================================
let pendingMasterAction = null;

function promptMasterPassword(actionTitle, onAuthorizedCallback) {
  const modal = document.getElementById("admin-master-password-modal");
  const descEl = document.getElementById("master-auth-action-desc");
  const pwdInput = document.getElementById("master-auth-password");
  const errEl = document.getElementById("master-auth-error");
  const submitBtn = document.getElementById("btn-submit-master-auth");

  if (!modal) {
    const entered = window.prompt(`[EcoFlow Master Authorization]\n${actionTitle}\nEnter Master Password:`);
    if (entered) onAuthorizedCallback(entered);
    return;
  }

  pendingMasterAction = {
    actionTitle: actionTitle,
    callback: onAuthorizedCallback
  };

  if (descEl) {
    descEl.innerHTML = `<strong>Action:</strong> <span style="color: var(--accent-adaptive);">${actionTitle}</span><br>Enter your master security password to authorize this administrative change.`;
  }
  if (pwdInput) {
    pwdInput.value = "";
    pwdInput.type = "password";
  }
  const eyeBtn = document.getElementById("btn-toggle-master-auth-pwd");
  if (eyeBtn) eyeBtn.textContent = "👁️";

  if (errEl) {
    errEl.style.display = "none";
    errEl.textContent = "";
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `🔒 Authorize & Proceed`;
  }

  modal.style.display = "flex";
  modal.classList.add("open");

  setTimeout(() => {
    if (pwdInput) pwdInput.focus();
  }, 100);
}

function closeMasterPasswordModal() {
  const modal = document.getElementById("admin-master-password-modal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("open");
  }
  pendingMasterAction = null;
}

function toggleMasterAuthPwdVisibility() {
  const pwdInput = document.getElementById("master-auth-password");
  const eyeBtn = document.getElementById("btn-toggle-master-auth-pwd");
  if (!pwdInput) return;
  if (pwdInput.type === "password") {
    pwdInput.type = "text";
    if (eyeBtn) eyeBtn.textContent = "🙈";
  } else {
    pwdInput.type = "password";
    if (eyeBtn) eyeBtn.textContent = "👁️";
  }
}

async function submitMasterPasswordChallenge() {
  if (!pendingMasterAction) return;
  const pwdInput = document.getElementById("master-auth-password");
  const errEl = document.getElementById("master-auth-error");
  const submitBtn = document.getElementById("btn-submit-master-auth");
  const enteredPassword = (pwdInput?.value || "").trim();

  if (!enteredPassword) {
    if (errEl) {
      errEl.textContent = "Master password cannot be empty.";
      errEl.style.display = "block";
    }
    if (pwdInput) pwdInput.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-inline"></span> Verifying...`;
  }

  try {
    const res = await fetch("/api/auth/verify-master", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: enteredPassword })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      if (errEl) {
        errEl.textContent = data.error || "Incorrect Master Password. Access Denied.";
        errEl.style.display = "block";
      }
      if (pwdInput) {
        pwdInput.select();
        pwdInput.focus();
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `🔒 Authorize & Proceed`;
      }
      return;
    }

    // Success: Execute callback with verified password
    const cb = pendingMasterAction.callback;
    closeMasterPasswordModal();
    if (typeof cb === "function") {
      cb(enteredPassword);
    }
  } catch (err) {
    if (errEl) {
      errEl.textContent = "Network Error: " + err.message;
      errEl.style.display = "block";
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `🔒 Authorize & Proceed`;
    }
  }
}

// Helper role switcher for internal components
function bypassSwitchRole(role) {
  if (role === 'recycler') role = 'household';
  if (role === 'admin') {
    promptMasterPassword("Enter Command Center Master View", () => {
      executeBypassSwitchRole(role);
    });
    return;
  }
  executeBypassSwitchRole(role);
}

function executeBypassSwitchRole(role) {
  const customName = (typeof getActiveUserName === "function") ? getActiveUserName("") : (localStorage.getItem("ecoflow_custom_user_name") || "");
  const storedColId = localStorage.getItem("ecoflow_collector_id");
  const storedColName = localStorage.getItem("ecoflow_collector_name");
  const mockSessions = {
    household: { role: 'household', name: customName || 'Citizen User', email: 'citizen@ecoflow.gov.in', address: 'House 42, Green Park Avenue, North Zone, Guwahati' },
    coordinator: { role: 'coordinator', name: customName || 'Field Operations Coordinator', employee_id: 'EMP-2026-101', email: 'coordinator@ecoflow.gov.in', address: 'Zonal Command Office, Sector 4' },
    collector: { role: 'collector', name: storedColName || customName || 'Field Collector', collector_id: storedColId || 'COL-2026-00142', email: 'collector@ecoflow.gov.in', address: 'North Zone Municipal Shed' },
    hub: { role: 'hub', name: customName || 'Storage Hub Authority', email: 'hub.central@ecoflow.gov.in', address: 'Municipal Weigh Station & Intake Hub' },
    admin: { role: 'admin', name: customName || 'Platform Administrator', email: 'dakssinghi@gmail.com', is_root: true }
  };
  const user = mockSessions[role] || { role: role, name: customName || 'Active User' };
  saveSessionAndLock(user);
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

  // Set active role attribute and control Voice Guide / Assistant feature visibility
  document.body.dataset.activeRole = session.role;
  const topVoiceBtn = document.querySelector(".voice-btn-top");
  if (session.role === 'admin' || session.role === 'coordinator') {
    if (topVoiceBtn) topVoiceBtn.style.display = "none";
    if (typeof loginTTSNarrator !== 'undefined' && loginTTSNarrator) {
      loginTTSNarrator.stopNarrator();
      loginTTSNarrator.isEnabled = false;
    }
  } else {
    if (topVoiceBtn) topVoiceBtn.style.display = (session.role === 'household') ? "inline-flex" : "none";
  }

  // Update dynamic user names across all headers and greetings
  if (typeof updateAllInterfaceUserNames === "function") {
    updateAllInterfaceUserNames();
  }

  // If Command Center, check if whitelist, registry, or coordinator directory need initial load
  if (session.role === 'admin') {
    renderAdminAccessControl();
    if (typeof loadEncryptedRegistry === "function") loadEncryptedRegistry();
    if (typeof loadWhitelist === "function") loadWhitelist();
    if (typeof loadAdminCoordinators === "function") loadAdminCoordinators();
    if (typeof loadAIModels === "function") loadAIModels();
    if (typeof loadAuditLogs === "function") loadAuditLogs();
  } else if (session.role === 'coordinator') {
    if (typeof loadCoordinatorFleet === "function") loadCoordinatorFleet();
    if (typeof loadCoordinatorQueue === "function") loadCoordinatorQueue();
  } else if (session.role === 'collector') {
    if (typeof loadCollectorTasks === "function") loadCollectorTasks();
  } else if (session.role === 'hub') {
    if (typeof loadHubPendingLots === "function") loadHubPendingLots();
    if (typeof renderHubMaterialRows === "function") renderHubMaterialRows();
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
      alertBox.innerHTML = `<strong>Verification Code Generated:</strong> <span style="font-family:monospace; color: var(--accent-adaptive); font-size:16px;">${result.token_preview}</span><br><small class="text-muted">A verification token has been simulated to your registered email (${email}). Enter it below to set your new password.</small>`;
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

// Global state for registry display
let registryDataCache = null;
let showRawCipherMode = false;

// Command Center: Encrypted User Registry Loader (Categorized by Role)
async function loadEncryptedRegistry() {
  try {
    const res = await fetch("/api/auth/registry");
    const data = await res.json();
    registryDataCache = data;

    renderCategorizedRegistry(data);

    const countEl = document.getElementById("registry-count-badge");
    if (countEl) countEl.textContent = `${data.total_records || 0} Encrypted Records`;

    // Update Category Counts
    const cAll = document.getElementById("reg-count-all");
    const cHH = document.getElementById("reg-count-hh");
    const cCoord = document.getElementById("reg-count-coord");
    const cCol = document.getElementById("reg-count-col");
    const cHub = document.getElementById("reg-count-hub");

    if (cAll) cAll.textContent = data.total_records || 0;
    if (cHH) cHH.textContent = (data.households || []).length;
    if (cCoord) cCoord.textContent = (data.coordinators || []).length;
    if (cCol) cCol.textContent = (data.collectors || []).length;
    if (cHub) cHub.textContent = (data.hubs || []).length;
  } catch (err) {
    console.warn("Could not load encrypted registry:", err);
  }
}

function renderCategorizedRegistry(data = registryDataCache) {
  if (!data) return;

  const hhTbody = document.getElementById("registry-households-tbody");
  const coordTbody = document.getElementById("registry-coordinators-tbody");
  const colTbody = document.getElementById("registry-collectors-tbody");
  const hubTbody = document.getElementById("registry-hubs-tbody");

  // 1. Household Citizens
  if (hhTbody) {
    const list = data.households || [];
    hhTbody.innerHTML = list.length ? list.map(u => `
      <tr>
        <td><code>${u.user_id}</code></td>
        <td><strong style="color: var(--text-main);">${showRawCipherMode ? u.raw_display : u.name}</strong></td>
        <td>${showRawCipherMode ? '<code>' + u.raw_display.substring(0, 14) + '...</code>' : u.phone}</td>
        <td>${showRawCipherMode ? '<code>' + u.raw_display.substring(0, 16) + '...</code>' : u.email}</td>
        <td><small style="color: var(--text-muted);">${showRawCipherMode ? u.raw_ciphertext : u.address}</small></td>
        <td><span class="badge-blue" style="font-size: 10px;">${u.custom_id}</span></td>
        <td><span class="registry-encrypted-pill" style="font-size: 10px; font-family: monospace; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 6px; border-radius: 4px; color: #7DD3FC;" title="${u.raw_ciphertext}">${u.raw_display}</span></td>
      </tr>
    `).join("") : '<tr><td colspan="7" class="text-center text-muted">No household records registered.</td></tr>';
  }

  // 2. Field Coordinators
  if (coordTbody) {
    const list = data.coordinators || [];
    coordTbody.innerHTML = list.length ? list.map(u => `
      <tr>
        <td><code>${u.user_id}</code></td>
        <td><strong style="color: var(--accent-adaptive);">${showRawCipherMode ? u.raw_display : u.name}</strong></td>
        <td>${showRawCipherMode ? '<code>' + u.raw_display.substring(0, 14) + '...</code>' : u.phone}</td>
        <td>${showRawCipherMode ? '<code>' + u.raw_display.substring(0, 16) + '...</code>' : u.email}</td>
        <td><small style="color: var(--text-muted);">${showRawCipherMode ? u.raw_ciphertext : u.address}</small></td>
        <td><span class="badge-green" style="font-size: 10px;">${u.custom_id}</span></td>
        <td><span class="registry-encrypted-pill" style="font-size: 10px; font-family: monospace; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 6px; border-radius: 4px; color: #6EE7B7;" title="${u.raw_ciphertext}">${u.raw_display}</span></td>
      </tr>
    `).join("") : '<tr><td colspan="7" class="text-center text-muted">No coordinator records registered.</td></tr>';
  }

  // 3. Field Collectors
  if (colTbody) {
    const list = data.collectors || [];
    colTbody.innerHTML = list.length ? list.map(u => {
      let modeBadge = '<span class="badge-blue">Smartphone</span>';
      if (u.name.includes("SMS") || (u.custom_id && u.custom_id.includes("NS"))) modeBadge = '<span class="badge-gold">SMS 2G</span>';
      else if (u.name.includes("No Phone") || (u.custom_id && u.custom_id.includes("NP"))) modeBadge = '<span class="badge-green">Phoneless</span>';

      return `
        <tr>
          <td><code>${u.user_id}</code></td>
          <td><strong style="color: #FBBF24;">${showRawCipherMode ? u.raw_display : u.name}</strong></td>
          <td>${modeBadge}</td>
          <td>${showRawCipherMode ? '<code>' + u.raw_display.substring(0, 14) + '...</code>' : u.phone}</td>
          <td><small style="color: var(--text-muted);">${showRawCipherMode ? u.raw_ciphertext : u.address}</small></td>
          <td><code style="color: #FDE68A;">${u.custom_id}</code></td>
          <td><span class="registry-encrypted-pill" style="font-size: 10px; font-family: monospace; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 6px; border-radius: 4px; color: #FCD34D;" title="${u.raw_ciphertext}">${u.raw_display}</span></td>
        </tr>
      `;
    }).join("") : '<tr><td colspan="7" class="text-center text-muted">No collector records registered.</td></tr>';
  }

  // 4. Storage Hubs & Recyclers
  if (hubTbody) {
    const list = data.hubs || [];
    hubTbody.innerHTML = list.length ? list.map(u => `
      <tr>
        <td><code>${u.user_id}</code></td>
        <td><strong style="color: #C084FC;">${showRawCipherMode ? u.raw_display : u.name}</strong></td>
        <td><span class="badge-purple" style="font-size: 10px;">${u.role.toUpperCase()}</span></td>
        <td>${showRawCipherMode ? '<code>' + u.raw_display.substring(0, 14) + '...</code>' : u.phone}</td>
        <td><small style="color: var(--text-muted);">${showRawCipherMode ? u.raw_ciphertext : u.address}</small></td>
        <td><code>${u.custom_id}</code></td>
        <td><span class="registry-encrypted-pill" style="font-size: 10px; font-family: monospace; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 2px 6px; border-radius: 4px; color: #D8B4FE;" title="${u.raw_ciphertext}">${u.raw_display}</span></td>
      </tr>
    `).join("") : '<tr><td colspan="7" class="text-center text-muted">No facility records registered.</td></tr>';
  }
}

function toggleRegistryCipherDisplay() {
  showRawCipherMode = !showRawCipherMode;
  const btn = document.getElementById("btn-toggle-cipher-view");
  if (btn) {
    btn.innerHTML = showRawCipherMode ? "🔓 Show Decrypted Values (Authorized View)" : "👁️ Toggle Raw Ciphertext / Decrypted";
    btn.classList.toggle("btn-primary", showRawCipherMode);
    btn.classList.toggle("btn-outline", !showRawCipherMode);
  }
  renderCategorizedRegistry();
}

function filterRegistryCategory(category) {
  const categories = ["household", "coordinator", "collector", "hub"];
  categories.forEach(c => {
    const sec = document.getElementById(`reg-cat-section-${c}`);
    const btn = document.getElementById(`btn-filter-reg-${c}`);
    if (sec) {
      sec.style.display = (category === "all" || category === c) ? "block" : "none";
    }
    if (btn) {
      btn.classList.toggle("active", category === c);
      btn.classList.toggle("btn-primary", category === c);
      btn.classList.toggle("btn-outline", category !== c);
    }
  });

  const btnAll = document.getElementById("btn-filter-reg-all");
  if (btnAll) {
    btnAll.classList.toggle("active", category === "all");
    btnAll.classList.toggle("btn-primary", category === "all");
    btnAll.classList.toggle("btn-outline", category !== "all");
  }
}

// Command Center: Whitelist Management Loader (Inside Top Whitelist Panel)
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
          <strong style="color: var(--text-main);">${w.email}</strong>
          ${w.is_root ? '<span class="status-badge status-verified" style="margin-left:6px; font-size:10px;">👑 ROOT OWNER</span>' : ''}
        </td>
        <td>${w.name}</td>
        <td>
          ${w.has_password ? '<span class="text-success" style="font-size:12px;">🔒 Encrypted (PBKDF2 600k)</span>' : '<span class="text-muted" style="font-size:12px;">⏳ Pending First Setup</span>'}
        </td>
        <td><small class="text-muted">${w.created_at || '—'}</small></td>
        <td>
          <span class="badge-${w.is_root ? 'green' : 'blue'}" style="font-size:10px;">
            ${w.is_root ? 'SOVEREIGN OWNER' : 'AUTHORIZED ADMIN'}
          </span>
        </td>
        <td>
          ${w.is_root 
            ? '<small class="text-muted">Root Protected</small>' 
            : `<button class="btn btn-sm btn-outline" style="color:#EF4444; border-color:#EF4444; font-size:11px; padding:2px 8px;" onclick="deleteWhitelistEmail('${w.email}')">Revoke Access</button>`}
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.warn("Could not load whitelist:", err);
  }
}

function toggleWhitelistCollapse() {
  const body = document.getElementById("admin-whitelist-panel-body");
  const btn = document.getElementById("btn-toggle-whitelist-collapse");
  if (!body || !btn) return;

  const isCollapsed = body.style.display === "none";
  body.style.display = isCollapsed ? "block" : "none";
  btn.textContent = isCollapsed ? "▼ Minimize Whitelist" : "▲ Expand Whitelist";
}

// Role-Based Access Control Rendering for Command Center
function renderAdminAccessControl() {
  const sessionStr = localStorage.getItem("ecoflow_user_session");
  const session = sessionStr ? JSON.parse(sessionStr) : {};
  const isMe = (session.email === "dakssinghi@gmail.com" || session.is_root === true);

  const topWhitelistPanel = document.getElementById("admin-whitelist-top-panel");
  const coordNavBtn = document.getElementById("admin-nav-btn-coordinators");
  const sessionLabel = document.getElementById("admin-logged-in-label");
  const sessionToggleBtn = document.getElementById("btn-toggle-admin-session");

  if (isMe) {
    // 1. Root Owner 'me': Show whitelist at top, show verified coordinators tab
    if (topWhitelistPanel) topWhitelistPanel.style.display = "block";
    if (coordNavBtn) coordNavBtn.style.display = "inline-flex";
    if (sessionLabel) {
      sessionLabel.textContent = "👑 Logged in as: Daksh Singhi (Owner - dakssinghi@gmail.com)";
      sessionLabel.style.color = "#34D399";
    }
    if (sessionToggleBtn) {
      sessionToggleBtn.textContent = "🔄 Simulate Other Officer Login";
      sessionToggleBtn.style.borderColor = "rgba(56, 189, 248, 0.4)";
      sessionToggleBtn.style.color = "#38BDF8";
    }
  } else {
    // 2. Another person with access: Hide whitelist, hide verified coordinators option
    if (topWhitelistPanel) topWhitelistPanel.style.display = "none";
    if (coordNavBtn) coordNavBtn.style.display = "none";
    if (sessionLabel) {
      sessionLabel.textContent = `🛡️ Logged in as: Authorized Admin (${session.email || 'supervisor@ecoflow.ai'})`;
      sessionLabel.style.color = "#38BDF8";
    }
    if (sessionToggleBtn) {
      sessionToggleBtn.textContent = "👑 Switch to Root Owner (Daksh)";
      sessionToggleBtn.style.borderColor = "rgba(16, 185, 129, 0.5)";
      sessionToggleBtn.style.color = "#34D399";
    }

    // If currently on coordinators tab, redirect to map
    if (appState.adminTab === "coordinators") {
      switchAdminTab("map");
    }
  }
}

// Toggle session identity between Root Owner ('me') and Another Authorized Person
function toggleAdminSessionIdentity() {
  const sessionStr = localStorage.getItem("ecoflow_user_session");
  const session = sessionStr ? JSON.parse(sessionStr) : {};
  const isCurrentlyMe = (session.email === "dakssinghi@gmail.com" || session.is_root === true);

  if (isCurrentlyMe) {
    // Switch to another authorized officer
    const otherUser = {
      role: "admin",
      name: "Pranab Barua (Operations Inspector)",
      email: "supervisor@ecoflow.ai",
      is_root: false
    };
    localStorage.setItem("ecoflow_user_session", JSON.stringify(otherUser));
    renderAdminAccessControl();
    if (typeof updateAllInterfaceUserNames === "function") updateAllInterfaceUserNames();
  } else {
    // Switching back to Root Owner ('me') requires Master Password
    promptMasterPassword("Switch to Root Owner Account (Daksh Singhi)", () => {
      const rootUser = {
        role: "admin",
        name: "Daksh Singhi (Owner)",
        email: "dakssinghi@gmail.com",
        is_root: true
      };
      localStorage.setItem("ecoflow_user_session", JSON.stringify(rootUser));
      renderAdminAccessControl();
      if (typeof updateAllInterfaceUserNames === "function") updateAllInterfaceUserNames();
    });
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

  promptMasterPassword(`Authorize New Administrator: ${targetEmail}`, async (masterPwd) => {
    try {
      const res = await fetch("/api/auth/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caller_email: session.email,
          action: "add",
          target_email: targetEmail,
          target_name: targetName,
          master_password: masterPwd
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
  });
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

  promptMasterPassword(`Revoke Command Center Access: ${targetEmail}`, async (masterPwd) => {
    try {
      const res = await fetch("/api/auth/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caller_email: session.email,
          action: "delete",
          target_email: targetEmail,
          master_password: masterPwd
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
  });
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
              <strong style="color: var(--accent-adaptive);">${data.collector_id}</strong>
              <span class="status-pill status-verified" style="font-size: 9px;">ACTIVE</span>
            </div>
            <p class="small text-muted mb-1">Mode: <strong>Basic Phone (SMS Only)</strong></p>
            <p class="small text-muted mb-1">Identity: <span style="color: var(--text-muted); font-family: monospace;">[🔒 RECORD SEALED & ENCRYPTED]</span></p>
            <p class="small text-muted mb-2">Personal Data: <span style="color: var(--text-muted); font-family: monospace;">[ERASED FROM LOCAL STORAGE]</span></p>
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
          <p class="small text-muted mb-1">ID: <code style="color: var(--accent-adaptive); font-weight: 700;">${e.employee_id}</code></p>
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
        <td><code style="color: var(--accent-adaptive); font-weight: 700; font-size: 13px;">${c.employee_id}</code></td>
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

  promptMasterPassword(`Authorize Coordinator: ${name} (${empId})`, async (masterPwd) => {
    try {
      const res = await fetch("/api/admin/coordinators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: empId,
          name: name,
          service_zone: zone,
          email: email,
          master_password: masterPwd
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
  });
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initAuth();

  const masterPwdInput = document.getElementById("master-auth-password");
  if (masterPwdInput) {
    masterPwdInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitMasterPasswordChallenge();
      }
    });
  }
});
