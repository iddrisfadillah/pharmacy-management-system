// assets/js/customer.js - Shared functions for all customer pages

// ─── CHECK AUTH ──────────────────────────────────────────
function checkAuth(requiredRole) {
    console.log('Checking authentication...');
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!token || !userData) {
        console.log('No authentication found, redirecting to login...');
        window.location.href = '../login/sign_in/login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(userData);
        if (requiredRole && user.role !== requiredRole) {
            console.log('Insufficient permissions, redirecting...');
            window.location.href = '../login/sign_in/login.html';
            return false;
        }
        return true;
    } catch(e) {
        console.error('Invalid user data:', e);
        window.location.href = '../login/sign_in/login.html';
        return false;
    }
}

// ─── GET USER DATA ──────────────────────────────────────
function getUserData() {
    try {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    } catch(e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

// ─── LOGOUT ──────────────────────────────────────────────
function handleLogout(event) {
    if (event) event.preventDefault();
    
    if (!confirm("Are you sure you want to logout?")) {
        return;
    }
    
    showToast('Logging out...');
    
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("patientId");
    localStorage.removeItem("cart");
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Redirect to login
    setTimeout(function() {
        window.location.href = '../login/sign_in/login.html';
    }, 500);
}

// ─── TOGGLE SIDEBAR (Mobile) ────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

// ─── TOAST ────────────────────────────────────────────────
let toastTimer;

function showToast(msg, type = 'success') {
    clearTimeout(toastTimer);
    const t = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    if (!t || !icon) return;
    
    const msgEl = document.getElementById('toastMsg');
    if (msgEl) msgEl.textContent = msg;
    
    icon.style.color = type === 'warn' ? '#fbbf24' : '#4ade80';
    t.classList.add('show');
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ─── SHOW CART TOAST ─────────────────────────────────────
function showCartToast() {
    const count = getCartCountFromStorage();
    showToast(`Cart: ${count} items`);
}

// ─── MODAL ────────────────────────────────────────────────
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
}

// ─── SET TODAY'S DATE ────────────────────────────────────
function setDate() {
    const d = new Date();
    const dateEls = document.querySelectorAll('.today-date');
    const dateStr = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    dateEls.forEach(el => el.textContent = dateStr);
}

// ─── HELPER: GET LOCAL/SESSION CART COUNT ────────────────
function getCartCountFromStorage() {
    const keys = ['cart', 'cartItems', 'userCart', 'medTrustCart'];
    let cartData = null;

    for (let key of keys) {
        cartData = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (cartData) break;
    }

    if (!cartData) return 0;

    try {
        const parsed = JSON.parse(cartData);
        if (Array.isArray(parsed)) {
            return parsed.reduce((sum, item) => sum + (Number(item.quantity || item.qty || item.count) || 1), 0);
        } else if (typeof parsed === 'object' && parsed !== null) {
            if (parsed.items && Array.isArray(parsed.items)) {
                return parsed.items.reduce((sum, item) => sum + (Number(item.quantity || item.qty) || 1), 0);
            }
            return Object.values(parsed).reduce((sum, item) => sum + (Number(item?.quantity || item?.qty) || 1), 0);
        }
    } catch (e) {
        console.error('Error parsing cart data:', e);
    }
    return 0;
}

// ─── UPDATE CART BADGE COUNT ─────────────────────────────
async function updateCartBadge() {
    let count = getCartCountFromStorage();

    // Update DOM badges immediately
    const renderCount = (c) => {
        document.querySelectorAll('.cart-badge, [data-cart-count]').forEach(el => {
            el.textContent = c;
        });
        document.querySelectorAll('a[href*="cart.html"] .badge').forEach(el => {
            el.textContent = c;
        });
    };

    renderCount(count);

    // Fetch live count from backend API if available
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        try {
            const res = await fetch('../backend/api/cart/get_cart.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && (data.cart || data.items || Array.isArray(data))) {
                    const items = data.cart || data.items || data;
                    const apiCount = Array.isArray(items) 
                        ? items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
                        : Object.keys(items).length;
                    
                    renderCount(apiCount);
                    localStorage.setItem('cart', JSON.stringify(items));
                }
            }
        } catch(err) {
            // Silently fall back to storage count
        }
    }
}

// ─── API HELPER ──────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json'
        },
        credentials: 'include'
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(endpoint, mergedOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch(error) {
        console.error('API Request Failed:', error);
        showToast(error.message || 'An error occurred', 'warn');
        throw error;
    }
}

// ─── CLICK OUTSIDE SIDEBAR TO CLOSE (Mobile) ────────────
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.menu-toggle');
    if (window.innerWidth <= 768 && 
        sidebar && toggle &&
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// ─── DOM CONTENT LOADED ──────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.remove('open');
            }
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Set current date
    setDate();
    
    // Load customer account info
    loadUserInfo();

    // Sync cart badge count on page load
    updateCartBadge();
});

// ─── LOAD USER INFO ──────────────────────────────────────
function loadUserInfo() {
    const user = getUserData();
    if (user) {
        const name = user.name || user.username || 'Patient';
        const initial = name.charAt(0).toUpperCase();
        
        document.querySelectorAll('.user-avatar').forEach(el => el.textContent = initial);
        document.querySelectorAll('.user-info .name').forEach(el => el.textContent = name);
        document.querySelectorAll('.avatar').forEach(el => el.textContent = initial);
        document.querySelectorAll('.welcome-title').forEach(el => el.textContent = `Welcome back, ${name}`);
    }
}

// ─── KEYBOARD SHORTCUT: Ctrl+K for search ───────────────
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
});