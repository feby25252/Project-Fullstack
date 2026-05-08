// ============================================
// LENSIQUE - JAVASCRIPT UTAMA
// ============================================
// File ini berisi fungsi-fungsi global yang
// digunakan di seluruh halaman aplikasi

// Alamat base URL API
const API_BASE = '/api';

// ============================================
// HELPER: MANAJEMEN TOKEN JWT
// ============================================

// Simpan token ke localStorage setelah login
function setToken(token) {
    localStorage.setItem('lensique_token', token);
}

// Ambil token dari localStorage
function getToken() {
    return localStorage.getItem('lensique_token');
}

// Hapus token saat logout
function removeToken() {
    localStorage.removeItem('lensique_token');
    localStorage.removeItem('lensique_user');
}

// Simpan data user ke localStorage
function setUser(user) {
    localStorage.setItem('lensique_user', JSON.stringify(user));
}

// Ambil data user dari localStorage
function getUser() {
    const user = localStorage.getItem('lensique_user');
    return user ? JSON.parse(user) : null;
}

// Cek apakah user sudah login
function isLoggedIn() {
    return !!getToken();
}

// Cek apakah user adalah admin
function isAdmin() {
    const user = getUser();
    return user && user.role_id === 1;
}

// ============================================
// HELPER: FETCH API DENGAN AUTENTIKASI
// ============================================

// Fungsi fetch yang otomatis menyertakan token JWT
async function fetchAPI(url, options = {}) {
    const token = getToken();
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // Tambahkan token ke header jika ada
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Jika mengirim FormData, hapus Content-Type agar browser set sendiri
    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE}${url}`, config);
        const data = await response.json();

        // Jika token expired, redirect ke login
        if (response.status === 401 || response.status === 403) {
            removeToken();
            if (window.location.pathname !== '/login') {
                showAlert('Sesi Anda telah berakhir. Silakan login kembali.', 'danger');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
            return data;
        }

        return data;
    } catch (error) {
        console.error('Fetch Error:', error);
        showAlert('Terjadi kesalahan koneksi. Silakan coba lagi.', 'danger');
        return { success: false, message: 'Koneksi gagal' };
    }
}

// ============================================
// HELPER: FORMAT MATA UANG RUPIAH
// ============================================

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(angka);
}

// ============================================
// HELPER: ALERT / NOTIFIKASI
// ============================================

// Tampilkan alert notifikasi di atas halaman
function showAlert(message, type = 'info') {
    // Hapus alert sebelumnya jika ada
    const existingAlert = document.querySelector('.alert-floating');
    if (existingAlert) existingAlert.remove();

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-lensique alert-lensique-${type} alert-floating`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 450px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    `;
    alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(alertDiv);

    // Hapus otomatis setelah 3 detik
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Tambahkan style animasi alert
const alertStyle = document.createElement('style');
alertStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(alertStyle);

// ============================================
// HELPER: FORMAT TANGGAL
// ============================================

function formatTanggal(dateString) {
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// ============================================
// HELPER: BADGE STATUS PESANAN
// ============================================

function getStatusBadge(status) {
    const statusMap = {
        'pending': { class: 'badge-pending', text: 'Menunggu' },
        'processing': { class: 'badge-processing', text: 'Diproses' },
        'shipped': { class: 'badge-shipped', text: 'Dikirim' },
        'delivered': { class: 'badge-delivered', text: 'Diterima' },
        'cancelled': { class: 'badge-cancelled', text: 'Dibatalkan' }
    };
    const s = statusMap[status] || { class: 'badge-pending', text: status };
    return `<span class="badge-status ${s.class}">${s.text}</span>`;
}

// ============================================
// NAVBAR: UPDATE TAMPILAN SESUAI STATUS LOGIN
// ============================================

function updateNavbar() {
    const navbarRight = document.getElementById('navbarRight');
    if (!navbarRight) return;

    const user = getUser();

    if (isLoggedIn() && user) {
        // Jika admin, tampilkan menu admin-only
        if (user.role_id === 1) {
            navbarRight.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/admin/dashboard">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle"></i> ${user.username}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" style="border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <li><a class="dropdown-item" href="/admin/dashboard"><i class="bi bi-speedometer2"></i> Dashboard</a></li>
                        <li><a class="dropdown-item" href="/admin/users"><i class="bi bi-people"></i> Kelola User</a></li>
                        <li><a class="dropdown-item" href="/admin/products"><i class="bi bi-box-seam"></i> Kelola Produk</a></li>
                        <li><a class="dropdown-item" href="/admin/orders"><i class="bi bi-truck"></i> Kelola Pesanan</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
                    </ul>
                </li>
            `;
        } else {
            navbarRight.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/">
                        <i class="bi bi-house"></i> Beranda
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/katalog">
                        <i class="bi bi-grid"></i> Katalog
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/wishlist">
                        <i class="bi bi-heart"></i> Wishlist
                    </a>
                </li>
                <li class="nav-item position-relative">
                    <a class="nav-link" href="/keranjang">
                        <i class="bi bi-cart3"></i> Keranjang
                        <span class="badge-cart" id="cartCount" style="display:none">0</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/user/orders">
                        <i class="bi bi-receipt"></i> Pesanan
                    </a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle"></i> ${user.username}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" style="border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <li><a class="dropdown-item" href="/profile"><i class="bi bi-person"></i> Profil Saya</a></li>
                        <li><a class="dropdown-item" href="/user/orders"><i class="bi bi-receipt"></i> Riwayat Pesanan</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
                    </ul>
                </li>
            `;
        }
    } else {
        navbarRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/katalog">
                    <i class="bi bi-grid"></i> Katalog
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/login">
                    <i class="bi bi-box-arrow-in-right"></i> Login
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn-lensique text-white px-3" href="/register">
                    Daftar
                </a>
            </li>
        `;
    }

    // Update jumlah item keranjang
    if (isLoggedIn()) {
        updateCartCount();
    }
}

// Update jumlah item di badge keranjang
async function updateCartCount() {
    try {
        const data = await fetchAPI('/keranjang');
        if (data.success && data.data) {
            const count = data.data.items ? data.data.items.length : 0;
            const badge = document.getElementById('cartCount');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline' : 'none';
            }
        }
    } catch (e) {
        // Abaikan error saat update cart count
    }
}

// ============================================
// FUNGSI LOGOUT
// ============================================

function logout() {
    removeToken();
    showAlert('Berhasil logout!', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// ============================================
// INISIALISASI SAAT HALAMAN DIMUAT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
