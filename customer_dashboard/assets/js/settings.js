// assets/js/settings.js - Settings specific logic

// ─── API ENDPOINTS ──────────────────────────────────────
// TODO: Replace with your actual API endpoints
const SETTINGS_API = {
    PROFILE: '../../backend/api/customer/profile.php',
    UPDATE_PROFILE: '../../backend/api/customer/update-profile.php',
    UPDATE_HEALTH: '../../backend/api/customer/update-health.php',
    ADDRESSES: '../../backend/api/customer/addresses.php',
    ADD_ADDRESS: '../../backend/api/customer/add-address.php',
    UPDATE_ADDRESS: '../../backend/api/customer/update-address.php',
    DELETE_ADDRESS: '../../backend/api/customer/delete-address.php',
    PAYMENTS: '../../backend/api/customer/payments.php',
    NOTIFICATIONS: '../../backend/api/customer/notifications.php',
    CHANGE_PASSWORD: '../../backend/api/customer/change-password.php',
    DEACTIVATE: '../../backend/api/customer/deactivate.php',
    DELETE_ACCOUNT: '../../backend/api/customer/delete-account.php'
};

// ─── STATE ──────────────────────────────────────────────
let userProfile = {};
let allergies = [];
let conditions = [];
let medications = [];
let addresses = [];
let payments = [];
let notifications = [];
let securitySettings = [];

// ─── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth('customer')) {
        return;
    }
    
    // Load user info
    loadUserInfo();
    
    // Load settings data
    loadSettings();
});

// ─── LOAD SETTINGS ──────────────────────────────────────
async function loadSettings() {
    try {
        showLoading();
        
        // TODO: Replace with actual API calls
        // const [profile, health, addresses, payments, notifications, security] = await Promise.all([
        //     apiRequest(SETTINGS_API.PROFILE),
        //     apiRequest(SETTINGS_API.HEALTH),
        //     apiRequest(SETTINGS_API.ADDRESSES),
        //     apiRequest(SETTINGS_API.PAYMENTS),
        //     apiRequest(SETTINGS_API.NOTIFICATIONS),
        //     apiRequest(SETTINGS_API.SECURITY)
        // ]);
        
        // Mock data - replace with actual API responses
        loadMockData();
        
        // Render all sections
        renderProfile();
        renderHealthTags();
        renderAddresses();
        renderPayments();
        renderNotifications();
        renderSecurity();
        
        hideLoading();
    } catch(error) {
        console.error('Error loading settings:', error);
        showToast('Failed to load settings', 'warn');
        hideLoading();
    }
}

// ─── LOAD MOCK DATA ─────────────────────────────────────
function loadMockData() {
    userProfile = {
        firstName: 'Radical',
        lastName: 'Mensah',
        email: 'radical@gmail.com',
        phone: '+233 24 567 8901',
        dob: '1990-06-15',
        gender: 'Male',
        language: 'English'
    };
    
    allergies = ['Penicillin', 'Sulfa Drugs'];
    conditions = ['Hypertension', 'Type 2 Diabetes'];
    medications = ['Lisinopril 10mg', 'Atorvastatin 20mg'];
    
    addresses = [
        { id: 1, label: 'Home', name: 'Radical Mensah', street: '12 Accra Ring Road', city: 'Accra', region: 'Greater Accra', phone: '+233 24 567 8901', default: true },
        { id: 2, label: 'Work', name: 'Radical Mensah', street: '45 Independence Ave', city: 'Accra', region: 'Greater Accra', phone: '+233 24 567 8901', default: false }
    ];
    
    payments = [
        { id: 1, type: 'momo', label: 'MTN Mobile Money', detail: '**** **** 8901', icon: 'fa-mobile', iconClass: 'icon-momo', active: true },
        { id: 2, type: 'visa', label: 'Visa Card', detail: '**** **** **** 4242', icon: 'fa-cc-visa', iconClass: 'icon-visa', active: false }
    ];
    
    notifications = [
        { label: 'Order Confirmations', sub: 'Get notified when an order is placed or updated.', checked: true },
        { label: 'Prescription Reminders', sub: 'Alerts when a prescription is due for refill.', checked: true },
        { label: 'Delivery Updates', sub: 'Real-time SMS when your order ships or arrives.', checked: true },
        { label: 'Promotions & Offers', sub: 'Discounts and deals from pharmacy partners.', checked: false },
        { label: 'Health Tips', sub: 'Weekly health articles and medication advice.', checked: false },
        { label: 'Security Alerts', sub: 'Login attempts and account changes.', checked: true }
    ];
    
    securitySettings = [
        { icon: 'fa-shield-halved', cls: 'si-green', label: 'Two-Factor Authentication', sub: 'Adds an extra verification step on login.', checked: false },
        { icon: 'fa-mobile-screen', cls: 'si-blue', label: 'SMS Verification', sub: 'Receive a code on +233 24 567 8901 each login.', checked: true },
        { icon: 'fa-fingerprint', cls: 'si-amber', label: 'Biometric Login', sub: 'Use fingerprint or face ID on supported devices.', checked: false }
    ];
}

// ─── TAB SWITCH ──────────────────────────────────────────
function switchTab(btn, tabId) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + tabId).classList.add('active');
}

// ─── PROFILE ─────────────────────────────────────────────
function renderProfile() {
    document.getElementById('fFirstName').value = userProfile.firstName || '';
    document.getElementById('fLastName').value = userProfile.lastName || '';
    document.getElementById('fEmail').value = userProfile.email || '';
    document.getElementById('fPhone').value = userProfile.phone || '';
    document.getElementById('fDOB').value = userProfile.dob || '';
    document.getElementById('fGender').value = userProfile.gender || 'Male';
    
    const fullName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
    document.getElementById('avatarName').textContent = fullName || 'Patient';
    document.getElementById('profileAvatar').childNodes[0].textContent = (userProfile.firstName || 'P')[0];
}

function saveProfile() {
    const firstName = document.getElementById('fFirstName').value.trim();
    const lastName = document.getElementById('fLastName').value.trim();
    const email = document.getElementById('fEmail').value.trim();
    const phone = document.getElementById('fPhone').value.trim();
    
    if (!firstName || !lastName) {
        showToast('Name fields are required', 'warn');
        return;
    }
    
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.UPDATE_PROFILE, {
    //     method: 'POST',
    //     body: JSON.stringify({ firstName, lastName, email, phone })
    // });
    
    userProfile.firstName = firstName;
    userProfile.lastName = lastName;
    userProfile.email = email;
    userProfile.phone = phone;
    
    renderProfile();
    loadUserInfo();
    showToast('Profile updated successfully');
}

function resetProfile() {
    renderProfile();
    showToast('Changes discarded');
}

function handleAvatarChange(input) {
    if (!input.files[0]) return;
    
    // TODO: Replace with actual API call with FormData
    // const formData = new FormData();
    // formData.append('avatar', input.files[0]);
    // const result = await fetch(SETTINGS_API.UPLOAD_AVATAR, {
    //     method: 'POST',
    //     body: formData,
    //     headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    // });
    
    showToast('Profile photo updated');
    input.value = '';
}

// ─── HEALTH TAGS ─────────────────────────────────────────
function renderHealthTags() {
    renderTags('allergy', allergies, 'allergyTags', 'tag-red');
    renderTags('condition', conditions, 'conditionTags', 'tag-blue');
    renderTags('med', medications, 'medTags', 'tag-green');
}

function renderTags(type, list, elementId, className) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (list.length === 0) {
        el.innerHTML = `<span style="font-size:0.78rem;color:var(--muted);">No ${type}s added yet</span>`;
        return;
    }
    
    el.innerHTML = list.map((tag, i) => `
        <span class="tag ${className}">
            ${tag}
            <button class="tag-remove" onclick="removeTag('${type}', ${i})">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </span>
    `).join('');
}

function addTag(type) {
    const inputMap = {
        'allergy': 'allergyInput',
        'condition': 'conditionInput',
        'med': 'medInput'
    };
    
    const listMap = {
        'allergy': allergies,
        'condition': conditions,
        'med': medications
    };
    
    const input = document.getElementById(inputMap[type]);
    if (!input) return;
    
    const value = input.value.trim();
    if (!value) return;
    
    listMap[type].push(value);
    input.value = '';
    renderHealthTags();
}

function removeTag(type, index) {
    const listMap = {
        'allergy': allergies,
        'condition': conditions,
        'med': medications
    };
    
    listMap[type].splice(index, 1);
    renderHealthTags();
}

function saveHealth() {
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.UPDATE_HEALTH, {
    //     method: 'POST',
    //     body: JSON.stringify({ allergies, conditions, medications })
    // });
    
    showToast('Health information saved');
}

// ─── ADDRESSES ───────────────────────────────────────────
function renderAddresses() {
    const grid = document.getElementById('addressGrid');
    if (!grid) return;
    
    if (addresses.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--muted);">
                <i class="fa-solid fa-location-dot" style="font-size:1.5rem;display:block;margin-bottom:8px;color:var(--light);"></i>
                No addresses saved yet
            </div>
        `;
        return;
    }
    
    grid.innerHTML = addresses.map(a => `
        <div class="address-card ${a.default ? 'default' : ''}">
            <div class="address-card-title">
                <i class="fa-solid fa-location-dot" style="color:var(--primary);"></i>
                ${a.label}
                ${a.default ? '<span class="default-badge">Default</span>' : ''}
            </div>
            <div class="address-card-body">
                <strong>${a.name}</strong><br/>
                ${a.street}<br/>
                ${a.city}, ${a.region}<br/>
                ${a.phone}
            </div>
            <div class="address-actions">
                ${!a.default ? `<button class="btn btn-ghost btn-sm" onclick="setDefaultAddress(${a.id})">Set Default</button>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="editAddress(${a.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-ghost btn-sm" style="color:var(--red);" onclick="deleteAddress(${a.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function setDefaultAddress(id) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.UPDATE_ADDRESS, {
    //     method: 'POST',
    //     body: JSON.stringify({ id, default: true })
    // });
    
    addresses.forEach(a => a.default = a.id === id);
    renderAddresses();
    showToast('Default address updated');
}

function deleteAddress(id) {
    if (!confirm('Are you sure you want to remove this address?')) return;
    
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.DELETE_ADDRESS, {
    //     method: 'DELETE',
    //     body: JSON.stringify({ id })
    // });
    
    const index = addresses.findIndex(a => a.id === id);
    if (index > -1) {
        addresses.splice(index, 1);
        renderAddresses();
        showToast('Address removed');
    }
}

function editAddress(id) {
    const address = addresses.find(a => a.id === id);
    if (!address) return;
    
    document.getElementById('aLabel').value = address.label || '';
    document.getElementById('aName').value = address.name || '';
    document.getElementById('aStreet').value = address.street || '';
    document.getElementById('aCity').value = address.city || '';
    document.getElementById('aRegion').value = address.region || 'Greater Accra';
    document.getElementById('aPhone').value = address.phone || '';
    document.getElementById('aDefault').checked = address.default || false;
    
    openModal('addressModal');
}

function openAddAddress() {
    document.getElementById('aLabel').value = '';
    document.getElementById('aName').value = '';
    document.getElementById('aStreet').value = '';
    document.getElementById('aCity').value = '';
    document.getElementById('aRegion').value = 'Greater Accra';
    document.getElementById('aPhone').value = '';
    document.getElementById('aDefault').checked = false;
    
    openModal('addressModal');
}

function saveAddress() {
    const label = document.getElementById('aLabel').value.trim();
    const name = document.getElementById('aName').value.trim();
    const street = document.getElementById('aStreet').value.trim();
    const city = document.getElementById('aCity').value.trim();
    
    if (!label || !street || !city) {
        showToast('Please fill required fields', 'warn');
        return;
    }
    
    const isDefault = document.getElementById('aDefault').checked;
    
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.ADD_ADDRESS, {
    //     method: 'POST',
    //     body: JSON.stringify({ label, name, street, city, region, phone, default: isDefault })
    // });
    
    if (isDefault) {
        addresses.forEach(a => a.default = false);
    }
    
    addresses.push({
        id: Date.now(),
        label,
        name: name || 'Patient',
        street,
        city,
        region: document.getElementById('aRegion').value,
        phone: document.getElementById('aPhone').value || '+233 24 000 0000',
        default: isDefault
    });
    
    closeModal('addressModal');
    renderAddresses();
    showToast('Address saved successfully');
}

// ─── PAYMENTS ─────────────────────────────────────────────
function renderPayments() {
    const list = document.getElementById('paymentsList');
    if (!list) return;
    
    if (payments.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--muted);">
                <i class="fa-solid fa-credit-card" style="font-size:1.5rem;display:block;margin-bottom:8px;color:var(--light);"></i>
                No payment methods saved
            </div>
        `;
        return;
    }
    
    list.innerHTML = payments.map(p => `
        <div class="payment-card ${p.active ? 'active' : ''}">
            <div style="display:flex;align-items:center;gap:12px;">
                <div class="payment-icon ${p.iconClass}">
                    <i class="fa-brands ${p.icon}"></i>
                </div>
                <div class="payment-info">
                    <div class="name">${p.label}</div>
                    <div class="detail">${p.detail}</div>
                </div>
                ${p.active ? '<span style="font-size:0.65rem;font-weight:700;background:var(--primary-light);color:var(--primary);padding:2px 7px;border-radius:20px;margin-left:8px;">Default</span>' : ''}
            </div>
            <div style="display:flex;gap:6px;">
                ${!p.active ? `<button class="btn btn-ghost btn-sm" onclick="setDefaultPayment(${p.id})">Set Default</button>` : ''}
                <button class="btn btn-ghost btn-sm" style="color:var(--red);" onclick="removePayment(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function setDefaultPayment(id) {
    // TODO: Replace with actual API call
    payments.forEach(p => p.active = p.id === id);
    renderPayments();
    showToast('Default payment method updated');
}

function removePayment(id) {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    const index = payments.findIndex(p => p.id === id);
    if (index > -1) {
        payments.splice(index, 1);
        renderPayments();
        showToast('Payment method removed');
    }
}

// ─── NOTIFICATIONS ───────────────────────────────────────
function renderNotifications() {
    const container = document.getElementById('notifToggles');
    if (!container) return;
    
    container.innerHTML = notifications.map((n, i) => `
        <div class="toggle-row">
            <div>
                <div class="toggle-label">${n.label}</div>
                <div class="toggle-sub">${n.sub}</div>
            </div>
            <label class="toggle">
                <input type="checkbox" ${n.checked ? 'checked' : ''} 
                       onchange="notifications[${i}].checked = this.checked; updateNotification(${i})"/>
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

function updateNotification(index) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.NOTIFICATIONS, {
    //     method: 'POST',
    //     body: JSON.stringify({ notifications })
    // });
    
    showToast('Notification preference updated');
}

function saveNotifications() {
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.NOTIFICATIONS, {
    //     method: 'PUT',
    //     body: JSON.stringify({ notifications })
    // });
    
    showToast('Notification preferences saved');
}

// ─── SECURITY ─────────────────────────────────────────────
function renderSecurity() {
    const container = document.getElementById('securityItems');
    if (!container) return;
    
    container.innerHTML = securitySettings.map((s, i) => `
        <div class="security-item">
            <div style="display:flex;align-items:center;gap:12px;">
                <div class="security-icon ${s.cls}">
                    <i class="fa-solid ${s.icon}"></i>
                </div>
                <div>
                    <div class="security-label">${s.label}</div>
                    <div class="security-sub">${s.sub}</div>
                </div>
            </div>
            <label class="toggle">
                <input type="checkbox" ${s.checked ? 'checked' : ''} 
                       onchange="securitySettings[${i}].checked = this.checked; updateSecurity(${i})"/>
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

function updateSecurity(index) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.SECURITY, {
    //     method: 'POST',
    //     body: JSON.stringify({ setting: securitySettings[index] })
    // });
    
    const setting = securitySettings[index];
    showToast(`${setting.label} ${setting.checked ? 'enabled' : 'disabled'}`);
}

// ─── PASSWORD ─────────────────────────────────────────────
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    const isHidden = input.type === 'password';
    
    input.type = isHidden ? 'text' : 'password';
    icon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}

function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const colors = ['', '#dc2626', '#d97706', '#16a34a', '#16a34a'];
    const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    
    for (let i = 1; i <= 4; i++) {
        const bar = document.getElementById('sb' + i);
        if (bar) {
            bar.style.background = i <= score ? colors[score] : 'var(--border)';
        }
    }
    
    const label = document.getElementById('strengthLabel');
    if (label) {
        label.textContent = password.length ? labels[score] : '';
        label.style.color = colors[score];
    }
}

function changePassword() {
    const current = document.getElementById('curPw').value;
    const newPw = document.getElementById('newPw').value;
    const confirm = document.getElementById('confPw').value;
    
    if (!current || !newPw || !confirm) {
        showToast('Please fill all password fields', 'warn');
        return;
    }
    
    if (newPw.length < 8) {
        showToast('New password must be at least 8 characters', 'warn');
        return;
    }
    
    if (newPw !== confirm) {
        showToast('Passwords do not match', 'warn');
        return;
    }
    
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.CHANGE_PASSWORD, {
    //     method: 'POST',
    //     body: JSON.stringify({ current, newPassword: newPw })
    // });
    
    document.getElementById('curPw').value = '';
    document.getElementById('newPw').value = '';
    document.getElementById('confPw').value = '';
    document.getElementById('strengthLabel').textContent = '';
    
    for (let i = 1; i <= 4; i++) {
        const bar = document.getElementById('sb' + i);
        if (bar) bar.style.background = 'var(--border)';
    }
    
    showToast('Password updated successfully');
}

// ─── DANGER ZONE ─────────────────────────────────────────
function openDeactivate() {
    document.getElementById('confirmTitle').textContent = 'Deactivate Account';
    document.getElementById('confirmBody').textContent = 'Your account will be temporarily disabled. You can reactivate it at any time by logging back in.';
    document.getElementById('confirmBtn').textContent = 'Deactivate';
    document.getElementById('confirmBtn').className = 'btn btn-amber';
    document.getElementById('confirmBtn').onclick = confirmDeactivate;
    openModal('confirmModal');
}

function confirmDeactivate() {
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.DEACTIVATE, { method: 'POST' });
    
    closeModal('confirmModal');
    showToast('Account deactivated', 'warn');
    setTimeout(() => {
        window.location.href = window.location.href = "/pharmacy/login/sign_in/login.html";
    }, 1500);
}

function openDelete() {
    document.getElementById('confirmTitle').textContent = 'Delete Account';
    document.getElementById('confirmBody').textContent = 'This will permanently delete your account, orders, prescriptions, and all associated data. This cannot be undone.';
    document.getElementById('confirmBtn').textContent = 'Yes, Delete Forever';
    document.getElementById('confirmBtn').className = 'btn btn-danger';
    document.getElementById('confirmBtn').onclick = confirmDelete;
    openModal('confirmModal');
}

function confirmDelete() {
    // TODO: Replace with actual API call
    // const result = await apiRequest(SETTINGS_API.DELETE_ACCOUNT, { method: 'DELETE' });
    
    closeModal('confirmModal');
    showToast('Account deleted', 'error');
    setTimeout(() => {
        window.location.href = '../../login/sign_in/login.html';
    }, 1500);
}

// ─── HELPERS ─────────────────────────────────────────────
function showLoading() {
    console.log('Loading settings...');
}

function hideLoading() {
    console.log('Settings loaded');
}