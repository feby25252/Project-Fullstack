// ============================================
// ADMIN PANEL JAVASCRIPT UTILITIES
// ============================================
// Helper untuk autentikasi, API calls, dan UI

const API_BASE = '';

// ============================================
// AUTH UTILITIES
// ============================================

function getToken() {
    return localStorage.getItem('admin_token');
}

function setToken(token) {
    localStorage.setItem('admin_token', token);
}

function removeToken() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
}

function getUser() {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem('admin_user', JSON.stringify(user));
}

function isLoggedIn() {
    return !!getToken();
}

function isAdmin() {
    const user = getUser();
    return user && user.role_id === 1;
}

// Redirect ke login jika tidak autentikasi
function requireAuth() {
    if (!isLoggedIn() || !isAdmin()) {
        removeToken();
        window.location.href = '/admin/login';
        return false;
    }
    return true;
}

// Redirect ke dashboard jika sudah login
function requireGuest() {
    if (isLoggedIn() && isAdmin()) {
        window.location.href = '/admin/dashboard';
        return false;
    }
    return true;
}

// Logout
function logout() {
    removeToken();
    window.location.href = '/admin/login';
}

// ============================================
// API UTILITIES
// ============================================

async function apiGet(url) {
    const res = await fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
        }
    });
    return handleResponse(res);
}

async function apiPost(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function apiPut(url, data) {
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function apiDelete(url) {
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
        }
    });
    return handleResponse(res);
}

async function apiPostForm(url, formData) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },
        body: formData
    });
    return handleResponse(res);
}

async function apiPutForm(url, formData) {
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },
        body: formData
    });
    return handleResponse(res);
}

async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            removeToken();
            window.location.href = '/admin/login';
        }
        throw new Error(data.message || 'Terjadi kesalahan');
    }
    return data;
}

// ============================================
// UI UTILITIES
// ============================================

function showAlert(id, message, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'alert alert-' + type + ' show';
    setTimeout(() => {
        el.classList.remove('show');
    }, 5000);
}

function hideAlert(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatRupiah(num) {
    if (!num) return 'Rp 0';
    return 'Rp ' + parseInt(num).toLocaleString('id-ID');
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}

// ============================================
// SIDEBAR RENDER
// ============================================

function renderSidebar(activePage) {
    const user = getUser();
    const username = user ? user.username : 'Admin';
    const role = user ? (user.role_name || 'Admin') : 'Admin';
    const initial = username.charAt(0).toUpperCase();

    const pages = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin/dashboard' },
        { id: 'users', label: 'Kelola User', icon: '👥', href: '/admin/users' },
        { id: 'products', label: 'Kelola Produk', icon: '👓', href: '/admin/products' },
        { id: 'orders', label: 'Kelola Pesanan', icon: '📦', href: '/admin/orders' },
        { id: 'reviews', label: 'Kelola Review', icon: '⭐', href: '/admin/reviews' },
        { id: 'reports', label: 'Laporan', icon: '📈', href: '/admin/dashboard' },
    ];

    const navItems = pages.map(p => `
        <li>
            <a href="${p.href}" class="${p.id === activePage ? 'active' : ''}">
                <span class="icon">${p.icon}</span>
                <span>${p.label}</span>
            </a>
        </li>
    `).join('');

    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon">👓</div>
                <div>
                    <h2>Lensique</h2>
                    <span>Admin Panel</span>
                </div>
            </div>
            <ul class="nav-menu">
                ${navItems}
            </ul>
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">${initial}</div>
                    <div class="user-details">
                        <div class="name">${username}</div>
                        <div class="role">${role}</div>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="logout()" style="width:100%">
                    🚪 Logout
                </button>
            </div>
        </aside>
    `;

    const container = document.querySelector('.admin-layout');
    if (container) {
        container.insertAdjacentHTML('afterbegin', sidebarHTML);
    }
}

// ============================================
// PAGINATION
// ============================================

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) return;

    let html = '<div style="display:flex;gap:8px;justify-content:center;margin-top:20px;">';

    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="${onPageChange}(${i})" 
            style="padding:8px 14px;border-radius:8px;border:none;cursor:pointer;
            background:${i === currentPage ? 'linear-gradient(135deg,#E8DAEF,#D6EAF8)' : '#fff'};
            color:${i === currentPage ? '#2C3E50' : '#7F8C8D'};
            box-shadow:0 2px 8px rgba(0,0,0,0.05);
            font-weight:${i === currentPage ? '600' : '400'};">
            ${i}
        </button>`;
    }

    html += '</div>';
    container.innerHTML = html;
}
