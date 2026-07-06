
function renderAdminLayout({ activePage = 'dashboard', pageTitle = 'Dashboard' } = {}) {
  const pages = [
    { id: 'dashboard',         label: 'Dashboard',         icon: 'fa-gauge-high',   href: 'admin.html' },
    { id: 'vendor-approvals',  label: 'Vendor Approvals',  icon: 'fa-shop',         href: 'vendor_app.html' },
    { id: 'user-management',   label: 'User Management',   icon: 'fa-users',        href: 'user_management.html' },
    { id: 'marketplace-sales', label: 'Marketplace Sales', icon: 'fa-store',        href: 'market_place_sales.html' },
    { id: 'audit-logs',        label: 'Audit Logs',        icon: 'fa-scroll',       href: 'audit_logs.html' },
    { id: 'settings',          label: 'Settings',          icon: 'fa-gear',         href: 'settings.html' },
  ];

  const navItems = pages.map(p => `
    <a href="${p.href}" class="nav-item ${activePage === p.id ? 'active' : ''}">
      <i class="fa-solid ${p.icon}"></i> ${p.label}
      ${p.id === 'vendor-approvals' ? '<span id="badge-pending" style="margin-left:auto;background:#fee2e2;color:var(--accent-red);font-size:0.65rem;padding:2px 6px;border-radius:20px;font-weight:700;display:none;">0</span>' : ''}
    </a>
  `).join('');

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-brand">
      <h2>PharmaAdmin</h2>
      <span>Platform Owner</span>
    </div>
    <nav class="sidebar-nav">${navItems}</nav>
    <div class="sidebar-footer">
      <button class="btn-generate" onclick="generateReport()">
        <i class="fa-solid fa-file-chart-column"></i> Generate Report
      </button>
      <a href="#" class="nav-item" style="padding:8px 4px;">
        <i class="fa-solid fa-circle-question"></i> Support
      </a>
      <a href="login.html" class="nav-item" style="padding:8px 4px;color:var(--accent-red);">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </a>
    </div>
  `;

  document.getElementById('topbar').innerHTML = `
    <div class="page-title-wrap">
      <h1 class="page-title">${pageTitle}</h1>
      <span class="breadcrumb">Admin / ${pageTitle}</span>
    </div>
    <div class="topbar-right">
      <div class="search-bar">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Search…" id="globalSearch"/>
      </div>
      <button class="notif-btn" onclick="showToast('No new notifications')">
        <i class="fa-solid fa-bell"></i>
        <span class="notif-dot"></span>
      </button>
      <div class="dropdown">
        <div class="user-badge" onclick="toggleDropdown()">
          <div class="user-avatar" id="adminInitial">A</div>
          <div class="user-info">
            <div class="name" id="adminName">Admin User</div>
            <div class="role">Platform Owner</div>
          </div>
          <i class="fa-solid fa-chevron-down" style="font-size:0.7rem;color:var(--text-muted);margin-left:4px;"></i>
        </div>
        <div class="dropdown-menu" id="userDropdown">
          <a href="#"><i class="fa-solid fa-user"></i> Profile</a>
          <a href="settings.html"><i class="fa-solid fa-gear"></i> Settings</a>
          <hr/>
          <a href="login.html" class="danger"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        </div>
      </div>
    </div>
  `;

  // Dropdown close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.getElementById('userDropdown')?.classList.remove('open');
    }
  });
}

function toggleDropdown() {
  document.getElementById('userDropdown').classList.toggle('open');
}

let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  document.getElementById('toastMsg').textContent = msg;
  icon.className = type === 'error'
    ? 'fa-solid fa-circle-xmark' : type === 'warn'
    ? 'fa-solid fa-triangle-exclamation'
    : 'fa-solid fa-circle-check';
  icon.style.color = type === 'error' ? '#f87171' : type === 'warn' ? '#fbbf24' : '#4ade80';
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

function generateReport() {
  showToast('Generating report… (will download as PDF)');
}