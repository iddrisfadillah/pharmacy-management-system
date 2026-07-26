/* ═══════════════════════════════════════════════════
   MEDTRUST SYSTEMS — LOGIN PAGE SCRIPTS
   login.js
═══════════════════════════════════════════════════ */

console.log("🔵 login.js is LOADED!");

/* ── CURRENT SELECTED ROLE ── */
let currentRole = 'customer';

/* ══════════════════════════════════════════════════
   TAB SWITCHING (Sign In / Create Account)
══════════════════════════════════════════════════ */
function switchAuthTab(tab) {
  const isSignIn = tab === 'signin';
  
  // Toggle tab buttons (fixed: case-sensitive IDs)
  document.getElementById('tabSignIn').classList.toggle('active', isSignIn);
  document.getElementById('tabCreate').classList.toggle('active', !isSignIn);
  
  // Toggle forms
  document.getElementById('formSignIn').style.display = isSignIn ? 'block' : 'none';
  document.getElementById('formCreate').style.display = !isSignIn ? 'block' : 'none';
  document.getElementById('formForgot').style.display = 'none';
  
  hideAlerts();
}

/* ══════════════════════════════════════════════════
   ROLE SELECTOR — switches register form fields
══════════════════════════════════════════════════ */
function selectRole(el, role) {
  currentRole = role;
  document.querySelectorAll('.role-option').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('selectedRole').value = role;

  // Fixed: added 's' to match HTML IDs (fieldsCustomer, fieldsPharmacist)
  document.getElementById('fieldsCustomer').style.display = role === 'customer' ? 'block' : 'none';
  document.getElementById('fieldsPharmacist').style.display = role === 'pharmacist' ? 'block' : 'none';
  document.getElementById('phReviewNotice').style.display = role === 'pharmacist' ? 'flex' : 'none';

  // Reset strength bars when switching
  resetStrength();
  hideAlerts();
}

/* ══════════════════════════════════════════════════
   SIGN IN
══════════════════════════════════════════════════ */
function handleSignIn() {
  hideAlerts();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;

  if (!email || !pass) { showError('Please fill in all fields.'); return; }
  if (!email.includes('@')) { showError('Please enter a valid email address.'); return; }

  //   PHP API call:
  
const btn = document.getElementById("btnSignIn");

btn.disabled = true;
btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

fetch("../../backend/api/auth/login.php", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({

        email: email,
        password: pass

    })

})

.then(response => response.json())

.then(data => {

    btn.disabled = false;

    btn.innerHTML =
        'Authenticate <i class="fa-solid fa-arrow-right-to-bracket"></i>';

    if (!data.success) {

        showError(data.message);

        return;

    }
    console.log("login response:", data);
    console.log("user object:", data.user);
    // Save JWT
localStorage.setItem("token", data.token);

// Save logged-in user
localStorage.setItem("user", JSON.stringify(data.user));

    switch (data.role) {

        case "admin":

            window.location =
                "../../admin_dashboard/admin.html";

            break;

        case "customer":

            window.location =
                "../../customer_dashboard/customer.html";

            break;

        case "pharmacist":

            window.location =
                "../../pharmacist/pharmacist-portal.html";

            break;

        default:

            showError("Unknown account role.");

    }

})

.catch(error => {

    console.error(error);

    btn.disabled = false;

    btn.innerHTML =
        'Authenticate <i class="fa-solid fa-arrow-right-to-bracket"></i>';

    showError("Unable to connect to the server.");

});
  
}

function roleRedirect(role) {
  const map = {
    admin:       '../../admin_dashboard/admin.html',
    pharmacist:  '../../pharmacist/pharmacist-portal.html',
    // vendor:      '../../pharmacist/pharmacist-portal.html',
    customer:    '../../customer_dashboard/customer.html',
  };
  return map[role] || '../../customer_dashboard/customer.html';
}

/* ══════════════════════════════════════════════════
   REGISTER
══════════════════════════════════════════════════ */
function handleRegister() {
  hideAlerts();
  const role = document.getElementById('selectedRole').value;

  if (role === 'customer') {
    registerCustomer();
  } else if (role === 'pharmacist') {
    registerPharmacist();
  }
}

function registerCustomer() {
  const fn      = document.getElementById('cFirstName').value.trim();
  const ln      = document.getElementById('cLastName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const phone   = document.getElementById('cPhone').value.trim();
  const pass    = document.getElementById('cPassword').value;
  const confirm = document.getElementById('cConfirmPassword').value;

  if (!fn || !ln || !email || !phone || !pass || !confirm) {
    showError('Please fill in all required fields.'); return;
  }
  if (!email.includes('@')) { showError('Please enter a valid email address.'); return; }
  if (pass.length < 8)      { showError('Password must be at least 8 characters.'); return; }
  if (pass !== confirm)      { showError('Passwords do not match.'); return; }
const btn = document.querySelector("#formCreate .btn-auth");

btn.disabled = true;
btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

fetch("../../backend/api/auth/register_customer.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        first_name: fn,
        last_name: ln,
        email: email,
        phone: phone,
        password: pass
    })
})
.then(response => response.json())
.then(data => {

    btn.disabled = false;
    btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus"></i>';

    if (data.success) {

        showSuccess(data.message);

        setTimeout(() => {
            switchAuthTab("signin");
        }, 1500);

    } else {

        showError(data.message);

    }

})
.catch(error => {

    console.error(error);

    btn.disabled = false;
    btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus"></i>';

    showError("Unable to connect to the server.");

});
  
 
}
function registerPharmacist() {

    console.log("Pharmacist registration started");

    const fn        = document.getElementById('phFirstName').value.trim();
    const ln        = document.getElementById('phLastName').value.trim();
    const email     = document.getElementById('phEmail').value.trim();
    const phone     = document.getElementById('phPhone').value.trim();
    const pharmName = document.getElementById('phPharmacyName').value.trim();
    const pharmAddr = document.getElementById('phPharmacyAddress').value.trim();
    const licNo     = document.getElementById('phLicenseNumber').value.trim();
    const bizReg    = document.getElementById('phBizReg').value.trim();
    const pass      = document.getElementById('phPassword').value;
    const confirm   = document.getElementById('phConfirmPassword').value;
    const certified = document.getElementById('phCertify').checked;
    const logo      = document.getElementById('phLogoInput').files[0];

    if (!fn || !ln || !email || !phone || !pharmName || !pharmAddr || !licNo || !pass || !confirm) {
        showError("Please fill in all required fields.");
        return;
    }

    if (!email.includes("@")) {
        showError("Please enter a valid email address.");
        return;
    }

    if (pass.length < 8) {
        showError("Password must be at least 8 characters.");
        return;
    }

    if (pass !== confirm) {
        showError("Passwords do not match.");
        return;
    }

    if (!certified) {
        showError("You must certify that you are a licensed pharmacist.");
        return;
    }

    const formData = new FormData();

    formData.append("first_name", fn);
    formData.append("last_name", ln);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", pass);
    formData.append("pharmacy_name", pharmName);
    formData.append("pharmacy_address", pharmAddr);
    formData.append("license_number", licNo);
    formData.append("business_registration", bizReg);

    if (logo) {
        formData.append("pharmacy_logo", logo);
    }

    const btn = document.querySelector("#formCreate .btn-auth");

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    fetch("../../backend/api/auth/register_pharmacist.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {

        btn.disabled = false;
        btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus"></i>';

        if (data.success) {

            showSuccess(data.message);

            setTimeout(() => {
                switchAuthTab("signin");
            }, 2000);

        } else {

            showError(data.message);

        }

    })
    .catch(error => {

        console.error(error);

        btn.disabled = false;
        btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus"></i>';

        showError("Unable to connect to the server.");

    });

}


/* ══════════════════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════════════════ */
function showForgot(e) {
  e.preventDefault();
  document.getElementById('formSignIn').style.display = 'none';
  document.getElementById('formForgot').style.display = 'block';
  hideAlerts();
}

function showSignIn() {
  document.getElementById('formForgot').style.display = 'none';
  document.getElementById('formSignIn').style.display = 'block';
  hideAlerts();
}

function handleForgot() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) { showError('Please enter your email address.'); return; }
  if (!email.includes('@')) { showError('Please enter a valid email address.'); return; }

  /* TODO: fetch('api/auth/forgot-password.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  }).then(r => r.json()).then(data => { ... }) */

  showSuccess(`Password reset link sent to ${email}`);
  setTimeout(showSignIn, 2200);
}

/* ══════════════════════════════════════════════════
   PASSWORD UTILITIES
══════════════════════════════════════════════════ */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector('i');
  const hide  = input.type === 'password';
  input.type  = hide ? 'text' : 'password';
  icon.className = hide ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}

function checkStrength(val, prefix) {
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const colors = ['', '#dc2626', '#d97706', '#16a34a', '#16a34a'];
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`${prefix}sb${i}`);
    if (bar) bar.style.background = i <= score ? colors[score] : '#E5E7EB';
  }

  const lbl = document.getElementById(`${prefix}strengthLabel`);
  if (lbl) {
    lbl.textContent  = val.length ? labels[score] : '';
    lbl.style.color  = colors[score];
  }
}

function resetStrength() {
  ['c', 'ph'].forEach(prefix => {
    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById(`${prefix}sb${i}`);
      if (bar) bar.style.background = '#E5E7EB';
    }
    const lbl = document.getElementById(`${prefix}strengthLabel`);
    if (lbl) lbl.textContent = '';
  });
}

/* ══════════════════════════════════════════════════
   LOGO UPLOAD
══════════════════════════════════════════════════ */
function handleLogoUpload(input) {
  const f = input.files[0];
  if (!f) return;
  const zone = document.getElementById('logoUploadZone');
  zone.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color:var(--green);font-size:1.3rem;"></i>
    <div class="uz-title" style="color:var(--green);">${f.name}</div>
    <p>Logo uploaded successfully</p>`;
  zone.style.borderColor = '#16a34a';
  zone.style.background  = '#f0fdf4';
}

/* ══════════════════════════════════════════════════
   ALERTS
══════════════════════════════════════════════════ */
function showError(msg) {
  document.getElementById('alertMsg').textContent = msg;
  document.getElementById('alertError').classList.add('show');
  document.getElementById('alertSuccess').classList.remove('show');
}

function showSuccess(msg) {
  document.getElementById('alertSuccessMsg').textContent = msg;
  document.getElementById('alertSuccess').classList.add('show');
  document.getElementById('alertError').classList.remove('show');
}

function hideAlerts() {
  document.getElementById('alertError').classList.remove('show');
  document.getElementById('alertSuccess').classList.remove('show');
}
// auto login check
const token = localStorage.getItem("token");

if (token) {

    fetch("/pharmacy/backend/api/auth/me.php", {

        headers: {
            Authorization: "Bearer " + token
        }

    })
    .then(res => res.json())
    .then(data => {

        if (!data.success) {
            localStorage.clear();
            return;
        }

        switch (data.user.role) {

            case "admin":
                window.location = "../../admin_dashboard/admin.html";
                break;

            case "customer":
                window.location = "../../customer_dashboard/customer.html";
                break;

            case "pharmacist":
                window.location = "../../pharmacist/pharmacist-portal.html";
                break;
        }

    });

}