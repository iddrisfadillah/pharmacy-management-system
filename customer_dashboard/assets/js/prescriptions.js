// assets/js/prescriptions.js - Prescriptions specific logic

// ─── API ENDPOINTS ──────────────────────────────────────
// TODO: Replace with your actual API endpoints
const PRESCRIPTION_API = {
    PRESCRIPTIONS: '../../backend/api/customer/prescriptions.php',
    PRESCRIPTION_DETAIL: '../../backend/api/customer/prescription-detail.php',
    REFILL: '../../backend/api/customer/refill.php',
    UPLOAD: '../../backend/api/customer/upload-prescription.php',
    RENEW: '../../backend/api/customer/renew-prescription.php',
    EXPORT: '../../backend/api/customer/export-prescriptions.php'
};

// ─── STATE ──────────────────────────────────────────────
let allPrescriptions = [];
let filteredPrescriptions = [];
let currentTab = 'active';

// ─── TRACKING CONFIG ────────────────────────────────────
const STATUS_BADGE = {
    'active': 'badge-green',
    'pending': 'badge-amber',
    'expired': 'badge-gray',
    'completed': 'badge-blue'
};

// ─── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth('customer')) {
        return;
    }
    
    // Load user info
    loadUserInfo();
    
    // Load prescriptions
    loadPrescriptions();
});

// ─── LOAD PRESCRIPTIONS ─────────────────────────────────
async function loadPrescriptions() {
    try {
        showLoading();
        
        // TODO: Replace with actual API call
        // const data = await apiRequest(PRESCRIPTION_API.PRESCRIPTIONS);
        
        // Mock data - replace with actual API response
        const data = getMockPrescriptions();
        allPrescriptions = data;
        filteredPrescriptions = [...allPrescriptions];
        
        // Update stats
        updateStats(allPrescriptions);
        
        // Render prescriptions
        renderPrescriptions('active');
        
        hideLoading();
    } catch(error) {
        console.error('Error loading prescriptions:', error);
        showToast('Failed to load prescriptions', 'warn');
        hideLoading();
    }
}

// ─── RENDER PRESCRIPTIONS ──────────────────────────────
function renderPrescriptions(tab) {
    const grid = document.getElementById('rxGrid');
    if (!grid) return;
    
    let filtered = allPrescriptions;
    
    // Filter by tab
    if (tab === 'active') {
        filtered = allPrescriptions.filter(rx => rx.status === 'active');
    } else if (tab === 'pending') {
        filtered = allPrescriptions.filter(rx => rx.status === 'pending');
    } else if (tab === 'history') {
        // Show all non-active prescriptions
        filtered = allPrescriptions.filter(rx => rx.status !== 'active' && rx.status !== 'pending');
    }
    
    filteredPrescriptions = filtered;
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--muted);">
                <i class="fa-solid fa-prescription-bottle" style="font-size:2rem;display:block;margin-bottom:12px;color:var(--light);"></i>
                No prescriptions found in this category
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(rx => `
        <div class="rx-card" onclick="openPrescriptionDetail(${rx.id})">
            <div class="rx-card-top">
                <div class="rx-icon"><i class="fa-solid fa-pills"></i></div>
                ${getStatusBadge(rx)}
            </div>
            <div class="rx-name">${rx.name}</div>
            <div class="rx-detail"><i class="fa-solid fa-stethoscope" style="margin-right:4px;"></i>${rx.doctor}</div>
            <div class="rx-detail"><i class="fa-solid fa-hospital" style="margin-right:4px;"></i>${rx.pharmacy}</div>
            <hr class="rx-divider"/>
            <div class="rx-meta">
                <div>
                    <div class="rx-meta-label">Condition</div>
                    <div class="rx-meta-val">${rx.condition}</div>
                </div>
                <div>
                    <div class="rx-meta-label">Refills Left</div>
                    <div class="rx-meta-val">${rx.refillsLeft} / ${rx.refills}</div>
                </div>
                <div>
                    <div class="rx-meta-label">Expires</div>
                    <div class="rx-meta-val">${rx.expires}</div>
                </div>
                <div>
                    <div class="rx-meta-label">Days Supply</div>
                    <div class="rx-meta-val" style="color:${getRefillColor(rx.daysLeft)}">${rx.daysLeft} days</div>
                </div>
            </div>
            <div class="refill-bar-wrap">
                <div class="refill-bar" style="width:${Math.min((rx.daysLeft / 90) * 100, 100)}%;background:${getRefillColor(rx.daysLeft)};"></div>
            </div>
            <div class="rx-actions" onclick="event.stopPropagation()">
                ${rx.status !== 'expired' && rx.status !== 'completed'
                    ? `<button class="btn btn-primary" onclick="requestRefill(${rx.id})">
                        <i class="fa-solid fa-rotate"></i> Refill
                       </button>`
                    : `<button class="btn btn-outline" onclick="renewPrescription(${rx.id})">
                        <i class="fa-solid fa-file-medical"></i> Renew
                       </button>`
                }
                <button class="btn btn-ghost" onclick="downloadPrescription(${rx.id})">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ─── RENDER HISTORY TABLE ──────────────────────────────
function renderHistoryTable() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;
    
    const history = allPrescriptions.filter(rx => rx.status === 'completed' || rx.status === 'expired');
    
    if (history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px 20px;color:var(--muted);">
                    No prescription history found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = history.map(h => `
        <tr>
            <td style="padding:12px 20px;font-size:0.83rem;font-weight:600;">${h.name}</td>
            <td style="padding:12px 20px;font-size:0.82rem;color:var(--muted);">${h.doctor}</td>
            <td style="padding:12px 20px;font-size:0.82rem;">${h.issued}</td>
            <td style="padding:12px 20px;">
                <span class="badge ${STATUS_BADGE[h.status] || 'badge-gray'}">${h.status.charAt(0).toUpperCase() + h.status.slice(1)}</span>
            </td>
            <td style="padding:12px 20px;">
                <button class="btn btn-ghost" onclick="renewPrescription(${h.id})">
                    <i class="fa-solid fa-rotate-left"></i> Re-order
                </button>
            </td>
        </tr>
    `).join('');
}

// ─── UPDATE STATS ──────────────────────────────────────
function updateStats(prescriptions) {
    const active = prescriptions.filter(rx => rx.status === 'active').length;
    const pending = prescriptions.filter(rx => rx.status === 'pending').length;
    const dueForRefill = prescriptions.filter(rx => rx.status === 'active' && rx.daysLeft <= 7).length;
    const expired = prescriptions.filter(rx => rx.status === 'expired').length;
    
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = active;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = pending;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = dueForRefill;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = expired;
}

// ─── TAB SWITCH ──────────────────────────────────────────
function switchTab(btn, tab) {
    // Update active tab
    document.querySelectorAll('.rx-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentTab = tab;
    
    // Show/hide panels
    ['active', 'pending', 'history', 'upload'].forEach(p => {
        const panel = document.getElementById(`panel-${p}`);
        if (panel) {
            panel.style.display = p === tab ? 'block' : 'none';
        }
    });
    
    // Render appropriate content
    if (tab === 'active' || tab === 'pending') {
        renderPrescriptions(tab);
    } else if (tab === 'history') {
        renderHistoryTable();
    }
}

// ─── FILTER PRESCRIPTIONS ──────────────────────────────
function filterPrescriptions(condition) {
    if (!condition) {
        renderPrescriptions(currentTab);
        return;
    }
    
    const filtered = allPrescriptions.filter(rx => rx.condition === condition);
    renderPrescriptions(currentTab);
    
    // Re-render with filter applied
    const grid = document.getElementById('rxGrid');
    if (grid) {
        const filteredHtml = filtered.map(rx => getRxCardHtml(rx)).join('');
        grid.innerHTML = filteredHtml || `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">No prescriptions found for this condition</div>`;
    }
}

// ─── SEARCH PRESCRIPTIONS ──────────────────────────────
function searchPrescriptions(query) {
    if (!query || query.trim() === '') {
        renderPrescriptions(currentTab);
        return;
    }
    
    const filtered = allPrescriptions.filter(rx => 
        rx.name.toLowerCase().includes(query.toLowerCase()) ||
        rx.doctor.toLowerCase().includes(query.toLowerCase()) ||
        rx.condition.toLowerCase().includes(query.toLowerCase())
    );
    
    const grid = document.getElementById('rxGrid');
    if (grid) {
        const filteredHtml = filtered.map(rx => getRxCardHtml(rx)).join('');
        grid.innerHTML = filteredHtml || `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">No prescriptions found for "${query}"</div>`;
    }
}

// ─── OPEN PRESCRIPTION DETAIL ──────────────────────────
function openPrescriptionDetail(id) {
    // TODO: Replace with actual API call
    // const data = await apiRequest(`${PRESCRIPTION_API.PRESCRIPTION_DETAIL}?id=${id}`);
    
    const rx = allPrescriptions.find(r => r.id === id);
    if (!rx) {
        showToast('Prescription not found', 'warn');
        return;
    }
    
    document.getElementById('rxModalTitle').textContent = rx.name;
    document.getElementById('rxModalBody').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.83rem;">
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Medication</div>
                ${rx.name}
            </div>
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Condition</div>
                ${rx.condition}
            </div>
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Doctor</div>
                ${rx.doctor}
            </div>
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Pharmacy</div>
                ${rx.pharmacy}
            </div>
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Issued</div>
                ${rx.issued}
            </div>
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Expires</div>
                ${rx.expires}
            </div>
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Refills Left</div>
                ${rx.refillsLeft} of ${rx.refills}
            </div>
            <div>
                <div style="font-size:0.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:3px;">Days Remaining</div>
                <span style="color:${getRefillColor(rx.daysLeft)};font-weight:700;">${rx.daysLeft} days</span>
            </div>
        </div>
        ${rx.status === 'pending' ? `
            <div style="background:#fef9c3;border-radius:8px;padding:10px 12px;font-size:0.78rem;color:#854d0e;margin-top:16px;">
                <i class="fa-solid fa-clock"></i> Estimated review time: 2-4 hours. You'll receive an SMS confirmation.
            </div>
        ` : ''}
    `;
    
    // Show/hide refill button based on status
    const refillBtn = document.querySelector('#rxModal .modal-actions .btn-primary');
    if (refillBtn) {
        refillBtn.style.display = (rx.status === 'active') ? 'inline-flex' : 'none';
    }
    
    openModal('rxModal');
}

// ─── REQUEST REFILL ──────────────────────────────────────
async function requestRefill(id) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(PRESCRIPTION_API.REFILL, {
    //     method: 'POST',
    //     body: JSON.stringify({ prescription_id: id })
    // });
    
    const rx = allPrescriptions.find(r => r.id === id);
    if (rx) {
        showToast(`Ordering refill for ${rx.name}…`);
    }
}

// ─── RENEW PRESCRIPTION ──────────────────────────────────
async function renewPrescription(id) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(PRESCRIPTION_API.RENEW, {
    //     method: 'POST',
    //     body: JSON.stringify({ prescription_id: id })
    // });
    
    const rx = allPrescriptions.find(r => r.id === id);
    if (rx) {
        showToast(`Requesting renewal for ${rx.name}…`);
    }
}

// ─── DOWNLOAD PRESCRIPTION ──────────────────────────────
function downloadPrescription(id) {
    // TODO: Replace with actual API call
    // window.location.href = `${PRESCRIPTION_API.PRESCRIPTION_DETAIL}?id=${id}&download=true`;
    showToast('Downloading prescription…');
}

// ─── OPEN NEW PRESCRIPTION ──────────────────────────────
function openNewRx() {
    const uploadTab = document.querySelectorAll('.rx-tab')[3];
    if (uploadTab) {
        switchTab(uploadTab, 'upload');
    }
}

// ─── HANDLE FILE UPLOAD ─────────────────────────────────
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // TODO: Replace with actual API call with FormData
    // const formData = new FormData();
    // formData.append('prescription', file);
    // const result = await fetch(PRESCRIPTION_API.UPLOAD, {
    //     method: 'POST',
    //     body: formData,
    //     headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    // });
    
    const wrap = document.getElementById('uploadedFile');
    if (wrap) {
        document.getElementById('uploadedFileName').textContent = file.name;
        wrap.style.display = 'flex';
        wrap.style.background = 'var(--green-light)';
    }
    
    showToast(`Prescription "${file.name}" uploaded successfully`);
}

// ─── DRAG AND DROP ──────────────────────────────────────
function dragOver(e) {
    e.preventDefault();
    document.getElementById('uploadZone').classList.add('dragover');
}

function dragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
}

function dropFile(e) {
    e.preventDefault();
    const zone = document.getElementById('uploadZone');
    zone.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        const input = document.getElementById('fileUpload');
        if (input) {
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFileUpload(input);
        }
    }
}

// ─── SUBMIT UPLOAD ──────────────────────────────────────
function submitUpload() {
    const med = document.getElementById('upMedName')?.value.trim();
    if (!med) {
        showToast('Please enter a medication name', 'warn');
        return;
    }
    
    // TODO: Replace with actual API call
    // const result = await apiRequest(PRESCRIPTION_API.UPLOAD, {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         medication: med,
    //         doctor: document.getElementById('upDoctor')?.value,
    //         date: document.getElementById('upDate')?.value,
    //         notes: document.getElementById('upNotes')?.value
    //     })
    // });
    
    showToast(`"${med}" submitted for verification`);
    
    // Switch to pending tab
    const pendingTab = document.querySelectorAll('.rx-tab')[1];
    if (pendingTab) {
        switchTab(pendingTab, 'pending');
    }
    
    // Clear form
    document.getElementById('upMedName').value = '';
    document.getElementById('upDoctor').value = '';
    document.getElementById('upDate').value = '';
    if (document.getElementById('upNotes')) {
        document.getElementById('upNotes').value = '';
    }
    document.getElementById('fileUpload').value = '';
    document.getElementById('uploadedFile').style.display = 'none';
}

// ─── HELPER FUNCTIONS ────────────────────────────────────
function getStatusBadge(rx) {
    if (rx.status === 'expired') {
        return '<span class="badge badge-gray">Expired</span>';
    }
    if (rx.daysLeft <= 7) {
        return '<span class="badge badge-red">Refill Soon</span>';
    }
    if (rx.daysLeft <= 14) {
        return '<span class="badge badge-amber">Low Supply</span>';
    }
    return '<span class="badge badge-green">Active</span>';
}

function getRefillColor(days) {
    if (days <= 7) return '#dc2626';
    if (days <= 14) return '#d97706';
    return '#16a34a';
}

function getRxCardHtml(rx) {
    return `
        <div class="rx-card" onclick="openPrescriptionDetail(${rx.id})">
            <div class="rx-card-top">
                <div class="rx-icon"><i class="fa-solid fa-pills"></i></div>
                ${getStatusBadge(rx)}
            </div>
            <div class="rx-name">${rx.name}</div>
            <div class="rx-detail"><i class="fa-solid fa-stethoscope" style="margin-right:4px;"></i>${rx.doctor}</div>
            <div class="rx-detail"><i class="fa-solid fa-hospital" style="margin-right:4px;"></i>${rx.pharmacy}</div>
            <hr class="rx-divider"/>
            <div class="rx-meta">
                <div>
                    <div class="rx-meta-label">Condition</div>
                    <div class="rx-meta-val">${rx.condition}</div>
                </div>
                <div>
                    <div class="rx-meta-label">Refills Left</div>
                    <div class="rx-meta-val">${rx.refillsLeft} / ${rx.refills}</div>
                </div>
                <div>
                    <div class="rx-meta-label">Expires</div>
                    <div class="rx-meta-val">${rx.expires}</div>
                </div>
                <div>
                    <div class="rx-meta-label">Days Supply</div>
                    <div class="rx-meta-val" style="color:${getRefillColor(rx.daysLeft)}">${rx.daysLeft} days</div>
                </div>
            </div>
            <div class="refill-bar-wrap">
                <div class="refill-bar" style="width:${Math.min((rx.daysLeft / 90) * 100, 100)}%;background:${getRefillColor(rx.daysLeft)};"></div>
            </div>
            <div class="rx-actions" onclick="event.stopPropagation()">
                ${rx.status !== 'expired' && rx.status !== 'completed'
                    ? `<button class="btn btn-primary" onclick="requestRefill(${rx.id})">
                        <i class="fa-solid fa-rotate"></i> Refill
                       </button>`
                    : `<button class="btn btn-outline" onclick="renewPrescription(${rx.id})">
                        <i class="fa-solid fa-file-medical"></i> Renew
                       </button>`
                }
                <button class="btn btn-ghost" onclick="downloadPrescription(${rx.id})">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>
        </div>
    `;
}

function showLoading() {
    console.log('Loading prescriptions...');
}

function hideLoading() {
    console.log('Prescriptions loaded');
}

// ─── MOCK DATA  ─────────────
function getMockPrescriptions() {
    return [
        { id: 1, name: 'Lisinopril 10mg', condition: 'Hypertension', doctor: 'Dr. Asante Boateng', issued: 'Sep 01, 2024', expires: 'Mar 01, 2025', refills: 3, refillsLeft: 2, daysLeft: 45, status: 'active', pharmacy: 'City Health Pharma' },
        { id: 2, name: 'Atorvastatin 20mg', condition: 'Hypertension', doctor: 'Dr. Asante Boateng', issued: 'Oct 01, 2024', expires: 'Apr 01, 2025', refills: 5, refillsLeft: 4, daysLeft: 5, status: 'active', pharmacy: 'City Health Pharma' },
        { id: 3, name: 'Metformin HCL 500mg', condition: 'Diabetes', doctor: 'Dr. Ama Frimpong', issued: 'Aug 15, 2024', expires: 'Feb 15, 2025', refills: 6, refillsLeft: 1, daysLeft: 7, status: 'active', pharmacy: 'North Star Meds' },
        { id: 4, name: 'Vitamin D3 5000IU', condition: 'General', doctor: 'Dr. Ama Frimpong', issued: 'Jul 10, 2024', expires: 'Jan 10, 2025', refills: 2, refillsLeft: 2, daysLeft: 28, status: 'active', pharmacy: 'GoldCoast Health' },
        { id: 5, name: 'Amoxicillin 500mg', condition: 'General', doctor: 'Dr. Kweku Mensah', issued: 'Jun 01, 2024', expires: 'Jun 14, 2024', refills: 1, refillsLeft: 0, daysLeft: 0, status: 'expired', pharmacy: 'PharmaLink Ghana' },
        { id: 6, name: 'Metformin HCL 500mg', condition: 'Diabetes', doctor: 'Dr. Ama Frimpong', issued: 'Nov 15, 2024', expires: 'May 15, 2025', refills: 6, refillsLeft: 6, daysLeft: 90, status: 'pending', pharmacy: 'North Star Meds' },
        { id: 7, name: 'Metformin 250mg', condition: 'Diabetes', doctor: 'Dr. Ama Frimpong', issued: 'Jan 15, 2024', expires: 'Jul 15, 2024', refills: 3, refillsLeft: 0, daysLeft: 0, status: 'completed', pharmacy: 'North Star Meds' },
        { id: 8, name: 'Paracetamol 500mg', condition: 'General', doctor: 'Dr. Kweku Mensah', issued: 'Mar 10, 2024', expires: 'Sep 10, 2024', refills: 2, refillsLeft: 0, daysLeft: 0, status: 'completed', pharmacy: 'PharmaLink Ghana' }
    ];
}