// assets/js/customer-dashboard.js - Dashboard page specific

// ─── API ENDPOINTS ──────────────────────────────────────
// TODO: Replace these with your actual API endpoints
const API = {
    DASHBOARD: '../../backend/api/customer/dashboard.php',
    PROFILE: '../../backend/api/customer/profile.php',
    ORDERS: '../../backend/api/customer/orders.php',
    ACTIVITY: '../../backend/api/customer/activity.php',
    REFILLS: '../../backend/api/customer/refills.php',
    UPLOAD_PRESCRIPTION: '../../backend/api/customer/upload-prescription.php',
    NEW_PRESCRIPTION: '../../backend/api/customer/new-prescription.php'
};

// ─── LOAD DASHBOARD DATA ────────────────────────────────
async function loadDashboard() {
    try {
        // Show loading state
        showLoading();
        
        // Load all dashboard data in parallel
        const [profile, orders, activity, refills] = await Promise.all([
            loadProfile(),
            loadOrders(),
            loadActivity(),
            loadRefills()
        ]);
        
        // Hide loading state
        hideLoading();
        
    } catch(error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'warn');
        hideLoading();
    }
}

// ─── LOAD PROFILE ────────────────────────────────────────
async function loadProfile() {
    // TODO: Replace with actual API call
    // const data = await apiRequest(API.PROFILE);
    
    // Mock data structure - replace with actual API response
    const data = {
        allergies: ['Penicillin', 'Sulfa Drugs'],
        conditions: ['Hypertension', 'Type 2 Diabetes'],
        provider: 'Verified Provider #8821',
        providerSync: 'Last sync with Central Pharmacy: 2 hours ago'
    };
    
    // Render profile
    document.getElementById('allergyTags').innerHTML = 
        data.allergies.map(a => `<span class="tag tag-red">${a}</span>`).join('');
    
    document.getElementById('conditionTags').innerHTML = 
        data.conditions.map(c => `<span class="tag tag-blue">${c}</span>`).join('');
    
    document.getElementById('verifiedBox').innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <div>
            <div class="vb-title">${data.provider}</div>
            <div class="vb-sub">${data.providerSync}</div>
        </div>
    `;
    
    return data;
}

// ─── LOAD ORDERS ─────────────────────────────────────────
async function loadOrders() {
    // TODO: Replace with actual API call
    // const data = await apiRequest(API.ORDERS);
    
    // Mock data - replace with actual API response
    const orders = [
        { id: '#MT-9021', prescription: 'Lisinopril 10mg (30ct)', status: 'Shipped', delivery: 'Oct 26, 2024', action: 'track' },
        { id: '#MT-8955', prescription: 'Atorvastatin 20mg (90ct)', status: 'Pending', delivery: 'Processing', action: 'details' },
        { id: '#MT-8812', prescription: 'Amoxicillin 500mg', status: 'Delivered', delivery: 'Oct 12, 2024', action: 'reorder' }
    ];
    
    // Render orders
    const statusMap = {
        Shipped: { pill: 'pill-shipped', dot: 'dot-shipped' },
        Pending: { pill: 'pill-pending', dot: 'dot-pending' },
        Delivered: { pill: 'pill-delivered', dot: 'dot-delivered' },
        Cancelled: { pill: 'pill-cancelled', dot: 'dot-cancelled' }
    };
    
    const actionMap = {
        track: `<button class="link-btn" onclick="openOrder('${orders[0].id}')">Track</button>`,
        details: `<button class="link-btn" onclick="openOrder('${orders[1].id}')">Details</button>`,
        reorder: `<button class="link-btn" onclick="reorderOrder('${orders[2].id}')">Reorder</button>`
    };
    
    document.getElementById('ordersBody').innerHTML = orders.map(o => {
        const s = statusMap[o.status] || statusMap.Pending;
        return `<tr data-id="${o.id}" data-rx="${o.prescription}" data-status="${o.status}" data-delivery="${o.delivery}">
            <td style="font-weight:700;font-size:0.8rem;">${o.id}</td>
            <td>${o.prescription}</td>
            <td>
                <span class="status-pill ${s.pill}">
                    <span class="status-dot ${s.dot}"></span>${o.status}
                </span>
            </td>
            <td style="font-size:0.78rem;color:var(--muted);">${o.delivery}</td>
            <td>${actionMap[o.action] || ''}</td>
        </tr>`;
    }).join('');
    
    return orders;
}

// ─── LOAD ACTIVITY ────────────────────────────────────────
async function loadActivity() {
    // TODO: Replace with actual API call
    // const data = await apiRequest(API.ACTIVITY);
    
    // Mock data - replace with actual API response
    const activity = [
        { icon: 'fa-box', iconClass: 'act-icon-blue', title: 'Order #MT-9021 shipped', sub: 'Lisinopril 10mg – Estimated delivery Oct 26' },
        { icon: 'fa-file-medical', iconClass: 'act-icon-green', title: 'New Prescription Uploaded', sub: 'Metformin HCL – Pending verification' },
        { icon: 'fa-credit-card', iconClass: 'act-icon-gray', title: 'Payment Successful', sub: 'Auto-refill for Atorvastatin processed' }
    ];
    
    document.getElementById('activityList').innerHTML = activity.map(a => `
        <div class="activity-item">
            <div class="act-icon ${a.iconClass}"><i class="fa-solid ${a.icon}"></i></div>
            <div>
                <div class="act-title">${a.title}</div>
                <div class="act-sub">${a.sub}</div>
            </div>
        </div>
    `).join('');
    
    return activity;
}

// ─── LOAD REFILLS ────────────────────────────────────────
async function loadRefills() {
    // TODO: Replace with actual API call
    // const data = await apiRequest(API.REFILLS);
    
    // Mock data - replace with actual API response
    const refills = [
        { name: 'Metformin HCL', days: '5 days supply remaining', urgent: true },
        { name: 'Vitamin D3', days: '12 days supply remaining', urgent: false }
    ];
    
    document.getElementById('refillList').innerHTML = refills.map(r => `
        <div class="refill-item">
            <div>
                <div class="refill-name">${r.name}</div>
                <div class="refill-days">${r.days}</div>
            </div>
            ${r.urgent
                ? `<button class="refill-btn-fill" onclick="requestRefill('${r.name}')">Refill</button>`
                : `<button class="refill-btn-auto" onclick="toggleAutoRefill('${r.name}')">Auto-refill On</button>`
            }
        </div>
    `).join('');
    
    document.getElementById('subCount').textContent = `Total active subscriptions: ${refills.length}`;
    document.getElementById('rxCount').textContent = refills.length + 2;
    
    return refills;
}

// ─── SEARCH ORDERS ──────────────────────────────────────
function searchOrders(query) {
    // TODO: Replace with actual API call
    // const results = await apiRequest(`${API.ORDERS}?q=${encodeURIComponent(query)}`);
    
    const rows = document.querySelectorAll('#ordersBody tr');
    rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ─── ORDER MODAL ──────────────────────────────────────────
function openOrder(orderId) {
    // TODO: Replace with actual API call
    // const data = await apiRequest(`${API.ORDERS}?id=${orderId}`);
    
    // Mock data - replace with actual API response
    const orderData = {
        id: orderId,
        status: 'Shipped',
        prescription: 'Lisinopril 10mg (30ct)',
        delivery: 'Oct 26, 2024',
        pharmacy: 'City Health Pharma',
        payment: 'Mobile Money – GH₵ 128.00'
    };
    
    document.getElementById('orderModalTitle').textContent = orderData.id;
    document.getElementById('orderDetailGrid').innerHTML = `
        <div><div class="detail-label">Order ID</div>${orderData.id}</div>
        <div><div class="detail-label">Status</div>
            <span class="status-pill pill-shipped">
                <span class="status-dot dot-shipped"></span>${orderData.status}
            </span>
        </div>
        <div><div class="detail-label">Prescription</div>${orderData.prescription}</div>
        <div><div class="detail-label">Estimated Delivery</div>${orderData.delivery}</div>
        <div><div class="detail-label">Pharmacy</div>${orderData.pharmacy}</div>
        <div><div class="detail-label">Payment</div>${orderData.payment}</div>
    `;
    
    openModal('orderModal');
}

// ─── REORDER ORDER ──────────────────────────────────────
function reorderOrder(orderId) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(API.REORDER, {
    //     method: 'POST',
    //     body: JSON.stringify({ orderId })
    // });
    
    showToast(`Adding ${orderId} to cart...`);
}

// ─── REQUEST REFILL ──────────────────────────────────────
function requestRefill(medicationName) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(API.REFILL_REQUEST, {
    //     method: 'POST',
    //     body: JSON.stringify({ medication: medicationName })
    // });
    
    showToast(`Ordering refill for ${medicationName}...`);
}

// ─── TOGGLE AUTO-REFILL ─────────────────────────────────
function toggleAutoRefill(medicationName) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(API.TOGGLE_AUTO_REFILL, {
    //     method: 'POST',
    //     body: JSON.stringify({ medication: medicationName })
    // });
    
    showToast(`Auto-refill toggled for ${medicationName}`);
}

// ─── NEW PRESCRIPTION ────────────────────────────────────
function openNewRx() {
    openModal('rxModal');
}

function submitRx() {
    const med = document.getElementById('rxMedName').value.trim();
    const doctor = document.getElementById('rxDoctor').value.trim();
    
    if (!med) {
        showToast('Please enter a medication name', 'warn');
        return;
    }
    
    // TODO: Replace with actual API call
    // const result = await apiRequest(API.NEW_PRESCRIPTION, {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         medication: med,
    //         doctor: doctor,
    //         file: fileData // Handle file upload separately
    //     })
    // });
    
    closeModal('rxModal');
    showToast(`Request for "${med}" submitted successfully`);
    document.getElementById('rxMedName').value = '';
    document.getElementById('rxDoctor').value = '';
}

// ─── UPLOAD PRESCRIPTION ────────────────────────────────
function dragOver(e) {
    e.preventDefault();
    document.getElementById('uploadZone').classList.add('dragover');
}

function dragLeave() {
    document.getElementById('uploadZone').classList.remove('dragover');
}

function dropFile(e) {
    e.preventDefault();
    dragLeave();
    const file = e.dataTransfer.files[0];
    if (file) processFileUpload(file);
}

function handleFile(input) {
    if (input.files[0]) processFileUpload(input.files[0]);
}

async function processFileUpload(file) {
    // TODO: Replace with actual API call with FormData
    // const formData = new FormData();
    // formData.append('prescription', file);
    // const result = await fetch(API.UPLOAD_PRESCRIPTION, {
    //     method: 'POST',
    //     body: formData,
    //     headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    // });
    
    showToast(`Prescription "${file.name}" uploaded — pending verification`);
    document.getElementById('uploadZone').innerHTML = `
        <i class="fa-solid fa-file-circle-check" style="color:var(--green);"></i>
        <p style="font-weight:600;color:var(--green);margin-top:6px;">${file.name}</p>
        <p style="margin-top:3px;font-size:0.72rem;">Uploading for verification…</p>
    `;
}

// ─── SHOW/HIDE LOADING ──────────────────────────────────
function showLoading() {
    // You can add a loading overlay or spinner here
    console.log('Loading dashboard data...');
}

function hideLoading() {
    console.log('Dashboard data loaded');
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth('customer')) {
        return;
    }
    
    // Load dashboard data
    loadDashboard();
});