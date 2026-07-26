// assets/js/order-history.js - Order History specific logic

// ─── API ENDPOINTS ──────────────────────────────────────
// TODO: Replace with your actual API endpoints
const ORDER_API = {
    ORDERS: '../../backend/api/customer/orders.php',
    ORDER_DETAIL: '../../backend/api/customer/order-detail.php',
    REORDER: '../../backend/api/customer/reorder.php',
    EXPORT: '../../backend/api/customer/export-orders.php'
};

// ─── STATE ──────────────────────────────────────────────
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const PER_PAGE = 5;
let selectedOrderId = null;

// ─── TRACKING CONFIG ────────────────────────────────────
const TRACK_LABELS = ['Ordered', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
const STATUS_CLASS = {
    'Delivered': 'badge-green',
    'Shipped': 'badge-blue',
    'Processing': 'badge-amber',
    'Cancelled': 'badge-red',
    'Refunded': 'badge-gray'
};

// ─── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth('customer')) {
        return;
    }
    
    // Load user info
    loadUserInfo();
    
    // Load orders
    loadOrders();
});

// ─── LOAD ORDERS ────────────────────────────────────────
async function loadOrders() {
    try {
        showLoading();
        
        // TODO: Replace with actual API call
        // const data = await apiRequest(ORDER_API.ORDERS);
        
        // Mock data - replace with actual API response
        const data = getMockOrders();
        allOrders = data;
        filteredOrders = [...allOrders];
        
        // Update stats
        updateStats(allOrders);
        
        // Render orders
        renderOrders();
        
        hideLoading();
    } catch(error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'warn');
        hideLoading();
    }
}

// ─── RENDER ORDERS ──────────────────────────────────────
function renderOrders() {
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pageOrders = filteredOrders.slice(start, end);
    
    const tbody = document.getElementById('ordersBody');
    if (!tbody) return;
    
    if (pageOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:40px 20px;color:var(--muted);">
                    <i class="fa-solid fa-inbox" style="font-size:2rem;display:block;margin-bottom:12px;color:var(--light);"></i>
                    No orders found
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageOrders.map(o => `
            <tr>
                <td>
                    <div style="font-weight:700;font-size:0.82rem;">${o.id}</div>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div class="order-product-img">
                            ${o.image ? `<img src="${o.image}" alt="${o.items}" onerror="this.style.display='none'"/>` : ''}
                            ${!o.image ? `<i class="fa-solid fa-pills"></i>` : ''}
                        </div>
                        <span style="font-size:0.82rem;">${o.items}</span>
                    </div>
                </td>
                <td style="font-size:0.82rem;color:var(--muted);">${o.pharmacy}</td>
                <td style="font-weight:700;">${o.total}</td>
                <td><span class="badge ${STATUS_CLASS[o.status] || 'badge-gray'}">${o.status}</span></td>
                <td style="font-size:0.78rem;color:var(--muted);">${o.date}</td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-outline" onclick="openOrder('${o.id}')">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button class="btn btn-ghost" onclick="reorderOrder('${o.id}')">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Update pagination
    const total = filteredOrders.length;
    const showing = Math.min(end, total);
    document.getElementById('pageInfo').textContent = 
        total > 0 ? `Showing ${start + 1}-${showing} of ${total} orders` : 'No orders';
}

// ─── UPDATE STATS ────────────────────────────────────────
function updateStats(orders) {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => {
        const amount = parseFloat(o.total.replace(/[^0-9.]/g, ''));
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const inTransit = orders.filter(o => o.status === 'Shipped' || o.status === 'Processing').length;
    const refunds = orders.filter(o => o.status === 'Refunded').length;
    
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = totalOrders;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = `GH₵ ${totalSpent.toFixed(2)}`;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = inTransit;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = refunds;
}

// ─── FILTER ORDERS ──────────────────────────────────────
function filterOrders() {
    const status = document.getElementById('filterStatus')?.value || '';
    const search = document.getElementById('searchOrder')?.value?.toLowerCase() || '';
    const date = document.getElementById('filterDate')?.value || '';
    
    filteredOrders = allOrders.filter(o => {
        // Filter by status
        if (status && o.status !== status) return false;
        
        // Filter by search
        if (search && !o.id.toLowerCase().includes(search) && 
            !o.items.toLowerCase().includes(search)) return false;
        
        // Filter by date (simplified - just check if date contains the selected date)
        if (date && !o.date.includes(date)) return false;
        
        return true;
    });
    
    currentPage = 1;
    renderOrders();
}

// ─── PAGINATION ──────────────────────────────────────────
function changePage(delta) {
    const maxPage = Math.ceil(filteredOrders.length / PER_PAGE);
    currentPage = Math.max(1, Math.min(currentPage + delta, maxPage));
    renderOrders();
}

// ─── OPEN ORDER MODAL ────────────────────────────────────
function openOrder(orderId) {
    // TODO: Replace with actual API call
    // const data = await apiRequest(`${ORDER_API.ORDER_DETAIL}?id=${orderId}`);
    
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('Order not found', 'warn');
        return;
    }
    
    selectedOrderId = orderId;
    
    // Build tracking steps
    const trackStep = order.trackStep || 0;
    const steps = TRACK_LABELS.map((label, i) => {
        const cls = i < trackStep ? 'done' : i === trackStep ? 'current' : 'pending';
        const lineCls = i < trackStep ? 'done' : '';
        return `
            ${i > 0 ? `<div class="track-line ${lineCls}"></div>` : ''}
            <div class="track-step">
                <div class="track-dot ${cls}">
                    <i class="fa-solid ${cls === 'done' || cls === 'current' ? 'fa-check' : 'fa-circle'}" style="font-size:0.65rem;"></i>
                </div>
                <div class="track-label">${label}</div>
            </div>
        `;
    }).join('');
    
    // Set modal content
    document.getElementById('orderModalTitle').textContent = `Order ${order.id}`;
    document.getElementById('orderModalBody').innerHTML = `
        <div class="detail-grid">
            <div>
                <div class="dl">Order ID</div>
                ${order.id}
            </div>
            <div>
                <div class="dl">Status</div>
                <span class="badge ${STATUS_CLASS[order.status] || 'badge-gray'}">${order.status}</span>
            </div>
            <div>
                <div class="dl">Items</div>
                ${order.items}
            </div>
            <div>
                <div class="dl">Pharmacy</div>
                ${order.pharmacy}
            </div>
            <div>
                <div class="dl">Order Date</div>
                ${order.date}
            </div>
            <div>
                <div class="dl">Total Paid</div>
                <strong>${order.total}</strong>
            </div>
            <div>
                <div class="dl">Payment</div>
                Mobile Money
            </div>
            <div>
                <div class="dl">Delivery</div>
                Standard – 3 days
            </div>
        </div>
        <div style="font-size:0.78rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;">
            Tracking
        </div>
        <div class="track-steps">${steps}</div>
    `;
    
    // Show/hide track button based on status
    const trackBtn = document.getElementById('trackBtn');
    if (trackBtn) {
        trackBtn.style.display = (order.status === 'Shipped' || order.status === 'Processing') ? 'flex' : 'none';
    }
    
    openModal('orderModal');
}

// ─── REORDER ORDER ──────────────────────────────────────
async function reorderOrder(orderId) {
    // TODO: Replace with actual API call
    // const result = await apiRequest(ORDER_API.REORDER, {
    //     method: 'POST',
    //     body: JSON.stringify({ order_id: orderId })
    // });
    
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        showToast(`Reordering ${order.items}…`);
    } else {
        showToast(`Reordering order ${orderId}…`);
    }
}

// ─── EXPORT ORDERS ──────────────────────────────────────
function exportOrders() {
    // TODO: Replace with actual API call
    // window.location.href = ORDER_API.EXPORT;
    showToast('Exporting order history…');
}

// ─── HELPERS ────────────────────────────────────────────
function showLoading() {
    console.log('Loading orders...');
}

function hideLoading() {
    console.log('Orders loaded');
}

// ─── MOCK DATA (remove when API is ready) ─────────────
function getMockOrders() {
    return [
        { id: '#MT-9021', items: 'Lisinopril 10mg (30ct)', pharmacy: 'City Health Pharma', total: 'GH₵ 128.00', status: 'Shipped', date: 'Oct 24, 2024', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=80&h=80&fit=crop', trackStep: 2 },
        { id: '#MT-8955', items: 'Atorvastatin 20mg (90ct)', pharmacy: 'City Health Pharma', total: 'GH₵ 240.00', status: 'Processing', date: 'Oct 25, 2024', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&h=80&fit=crop', trackStep: 1 },
        { id: '#MT-8812', items: 'Amoxicillin 500mg', pharmacy: 'PharmaLink Ghana', total: 'GH₵ 58.00', status: 'Delivered', date: 'Oct 12, 2024', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=80&h=80&fit=crop', trackStep: 4 },
        { id: '#MT-8640', items: 'Vitamin D3 + Omega-3', pharmacy: 'GoldCoast Health', total: 'GH₵ 160.00', status: 'Delivered', date: 'Sep 30, 2024', image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=80&h=80&fit=crop', trackStep: 4 },
        { id: '#MT-8501', items: 'First Aid Kit Deluxe', pharmacy: 'SafeMeds Africa', total: 'GH₵ 120.00', status: 'Delivered', date: 'Sep 15, 2024', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=80&h=80&fit=crop', trackStep: 4 },
        { id: '#MT-8320', items: 'Metformin HCL 500mg (60ct)', pharmacy: 'North Star Meds', total: 'GH₵ 44.00', status: 'Cancelled', date: 'Sep 02, 2024', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=80&h=80&fit=crop', trackStep: 0 },
        { id: '#MT-8100', items: 'Multivitamin Complex', pharmacy: 'City Health Pharma', total: 'GH₵ 110.00', status: 'Refunded', date: 'Aug 20, 2024', image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=80&h=80&fit=crop', trackStep: 0 },
    ];
}