// ═══════════════════════════════════════════════════
//  PHARMACIST PORTAL — SHARED SIDEBAR + TOPBAR
// ═══════════════════════════════════════════════════

function renderPharmacistLayout({ activePage = 'dashboard', pageTitle = 'Dashboard Overview' } = {}) {
  const pages = [
    { id:'dashboard', label:'Dashboard',  icon:'fa-gauge-high',    href:'pharmacist-portal.html', badge:0  },
    { id:'inventory', label:'Inventory',  icon:'fa-boxes-stacked', href:'ph-inventory.html',      badge:3  },
    { id:'orders',    label:'Orders',     icon:'fa-bag-shopping',  href:'ph-orders.html',         badge:14 },
    { id:'reports',   label:'Reports',    icon:'fa-chart-line',    href:'ph-reports.html',        badge:0  },
    { id:'customers', label:'Customers',  icon:'fa-users',         href:'ph-customers.html',      badge:0  },
    { id:'settings',  label:'Settings',   icon:'fa-gear',          href:'ph-settings.html',       badge:0  },
  ];

  document.getElementById('phSidebar').innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-name">MedTrust Systems</div>
    </div>
    <div class="pharmacy-info">
      <div class="ph-avatar">CP</div>
      <div>
        <div class="ph-name">Central Pharmacy</div>
        <div class="ph-id">Verified Provider #8821</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${pages.map(p => `
        <a class="nav-item ${activePage === p.id ? 'active' : ''}" href="${p.href}">
          <i class="fa-solid ${p.icon}"></i> ${p.label}
          ${p.badge > 0 ? `<span class="nav-badge">${p.badge}</span>` : ''}
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <button class="btn-new-rx" onclick="openNewRxModal()">
        <i class="fa-solid fa-plus"></i> New Prescription
      </button>
      <a class="nav-item" href="#" style="padding:7px 4px;font-size:0.8rem;"><i class="fa-solid fa-circle-question"></i> Support</a>
      <!-- UPDATED LOGOUT BUTTON IN SIDEBAR -->
      <a class="nav-item" href="javascript:void(0)" onclick="logout()" style="padding:7px 4px;font-size:0.8rem;color:var(--red);"><i class="fa-solid fa-right-from-bracket"></i> Log Out</a>
    </div>
  `;

  document.getElementById('phTopbar').innerHTML = `
    <div>
      <div class="topbar-title">${pageTitle}</div>
    </div>
    <div class="topbar-right">
      <div class="search-bar">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Search orders, medicines, patients…" id="globalSearch" oninput="handleGlobalSearch(this.value)"/>
      </div>
      <button class="icon-btn" onclick="showToast('3 new alerts')">
        <i class="fa-solid fa-bell"></i><span class="notif-dot"></span>
      </button>
      <div class="user-chip">
        <div class="user-avatar">SC</div>
        <div class="user-info">
          <div class="uname">Dr. Sarah Chen</div>
          <div class="urole">Administrator</div>
        </div>
        <!-- ADDED QUICK LOGOUT BUTTON IN TOPBAR -->
        <button class="icon-btn" onclick="logout()" title="Log Out" style="margin-left:6px; color:#f87171;">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </div>
  `;
}

// Global Logout Handler
function logout() {
  // Clear authentication tokens from browser memory
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  localStorage.clear();
  sessionStorage.clear();

  // Redirect specifically to the relative login URL
  // Adjust this URL to match your exact login page location:
  window.location.href = "../login/sign_in/login.html"; 
}

// Shared toast
let _phToastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(_phToastTimer);
  const t = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  if (!t) return;
  document.getElementById('toastMsg').textContent = msg;
  icon.style.color = type === 'warn' ? '#fbbf24' : type === 'error' ? '#f87171' : '#4ade80';
  t.classList.add('show');
  _phToastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// Shared modal helpers
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
function openModal(id)  { document.getElementById(id)?.classList.add('open');    }

// Placeholder — overridden per-page
function handleGlobalSearch(q) {}
function openNewRxModal() { showToast('New Prescription modal — implement per page'); }