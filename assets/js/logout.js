// function logout() {

//     if (!confirm("Are you sure you want to logout?")) {
//         return;
//     }

//     // Remove everything related to the user
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     // Destroy PHP session
//     fetch("/pharmacy/backend/api/auth/logout.php")
//         .finally(() => {
//             window.location = "/pharmacy/login/sign_in/login.html";
//         });

// }// logout.js - Complete fixed version

function logout() {
    console.log('Logout function called');
    
    if (!confirm("Are you sure you want to logout?")) {
        console.log('Logout cancelled by user');
        return;
    }

    console.log('User confirmed logout, proceeding...');
    
    // Show loading state
    showLogoutStatus('Logging out...');
    
    // Remove everything related to the user from localStorage
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("userRole");
        // Clear everything if needed
        // localStorage.clear();
        console.log('LocalStorage cleared');
    } catch(e) {
        console.error('Error clearing localStorage:', e);
    }
    
    // Remove from sessionStorage as well
    try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("sessionId");
        console.log('SessionStorage cleared');
    } catch(e) {
        console.error('Error clearing sessionStorage:', e);
    }
    
    // Clear cookies
    try {
        clearAllCookies();
        console.log('Cookies cleared');
    } catch(e) {
        console.error('Error clearing cookies:', e);
    }

    // Destroy PHP session with better error handling
    const logoutUrl = "/pharmacy/backend/api/auth/logout.php";
    console.log('Calling logout API:', logoutUrl);
    
    fetch(logoutUrl, {
        method: 'POST', // Use POST for logout
        credentials: 'include', // Important for cookies/sessions
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        console.log('Logout API response status:', response.status);
        return response.json().catch(() => ({})); // Handle non-JSON responses
    })
    .then(data => {
        console.log('Logout API response data:', data);
        // Always redirect regardless of API response
        redirectToLogin();
    })
    .catch(error => {
        console.error('Logout API error:', error);
        // Even if API fails, redirect to login
        redirectToLogin();
    });
    
    // Also set a timeout as fallback in case fetch hangs
    setTimeout(function() {
        console.log('Logout timeout fallback triggered');
        redirectToLogin();
    }, 3000);
}

// Helper function to clear all cookies
function clearAllCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        const trimmedName = name.trim();
        // Clear cookie for all paths and domains
        document.cookie = trimmedName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        document.cookie = trimmedName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/pharmacy';
        document.cookie = trimmedName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=' + window.location.hostname + ';path=/';
    }
}

// Helper function to show logout status
function showLogoutStatus(message) {
    // Check if toast exists, if not create one
    let toast = document.getElementById('logoutToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'logoutToast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a6fc4;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: none;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    
    // Hide after 2 seconds if not redirecting
    setTimeout(() => {
        if (toast.style.display !== 'none') {
            toast.style.display = 'none';
        }
    }, 2000);
}

// Helper function to redirect to login
function redirectToLogin() {
    console.log('Redirecting to login page...');
    const loginUrl = "/pharmacy/login/sign_in/login.html";
    
    // Try multiple redirect methods for compatibility
    try {
        window.location.replace(loginUrl);
    } catch(e) {
        try {
            window.location.href = loginUrl;
        } catch(e2) {
            window.location = loginUrl;
        }
    }
}

// For debugging - expose the logout function globally
window.logout = logout;

// Also handle unload events to ensure logout completes
window.addEventListener('beforeunload', function() {
    // This ensures that if the user closes the tab during logout, 
    // we don't lose the session clearing
    if (window._isLoggingOut) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
});