// --- FUNGSI UTILITY ---
function getToken() { 
    // Mengambil token dari localStorage (asumsi disimpan setelah login admin)
    return localStorage.getItem("adminToken"); // Pastikan namanya 'adminToken' atau sesuaikan
}
// Redirect jika tidak ada token (Guardrail)
if (!getToken()) {
    location.href = "/public/login.html";
}

const out = document.getElementById("out"); // Untuk menampilkan pesan JSON mentah/respons

// --- EVENT LISTENERS ---

// 1. Load User dan API Keys
document.getElementById("loadUsers").addEventListener("click", async () => {
    out.textContent = 'Loading...';
    const token = getToken();
    try {
        // Endpoint untuk mengambil semua user dan API Keys (asumsi endpoint: /api/admin/users)
        const res = await fetch("/api/admin/apikeys", { // Menggunakan endpoint apikeys yang sudah kita buat
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
            out.textContent = JSON.stringify(data, null, 2);
            renderApiKeysTable(data); // Memanggil fungsi render untuk data API Key
        } else {
            out.textContent = `Error: ${data.message || 'Gagal memuat data.'}`;
        }
    } catch (error) {
        console.error(error);
        out.textContent = `Koneksi Error: ${error.message}`;
    }
});

// 2. Membersihkan API Key yang Kedaluwarsa
// Catatan: Fungsi ini perlu diimplementasikan di backend (apikeyController.js/adminController.js)
document.getElementById("cleanExpired").addEventListener("click", async () => {
    out.textContent = 'Cleaning expired keys...';
    const token = getToken();
    try {
        const res = await fetch("/api/admin/apikeys/expired", {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
            out.textContent = JSON.stringify(data, null, 2);
            // Muat ulang data setelah pembersihan
            document.getElementById("loadUsers").click(); 
        } else {
            out.textContent = `Error: ${data.message || 'Gagal membersihkan keys.'}`;
        }
    } catch (error) {
        console.error(error);
        out.textContent = `Koneksi Error: ${error.message}`;
    }
});

// 3. Logout
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("adminToken"); // Gunakan nama token yang sama
    location.href = "/public/login.html";
});

// --- FUNGSI RENDERING ---

/**
 * @param {Array<Object>} apiKeys - Daftar dokumen API Key dari backend.
 */
function renderApiKeysTable(apiKeys) {
    const wrap = document.getElementById('tableWrap');
    if (!apiKeys || apiKeys.length === 0) {
        wrap.innerHTML = '<div class="alert alert-info">Tidak ada API Key yang terdaftar.</div>';
        return;
    }
    
    // Header Tabel yang Diperlukan Admin
    let html = '<table class="table table-bordered table-striped"><thead><tr><th>ID Dokumen</th><th>Nama User</th><th>Email</th><th>API Key</th><th>Dibuat</th><th>Kedaluwarsa</th><th>Aksi</th></tr></thead><tbody>';
    
    apiKeys.forEach(k => {
        // 💡 Penyesuaian: Menggunakan field 'firstName', 'lastName', 'email', dan 'expiresAt'
        const keySnippet = k.key.substring(0, 10) + '...'; // Potongan key
        const expiresDate = new Date(k.expiresAt).toLocaleDateString();
        const createdDate = new Date(k.createdAt).toLocaleDateString();

        html += `
        <tr>
            <td><small>${k._id || k.id}</small></td>
            <td>${k.firstName} ${k.lastName}</td>
            <td>${k.email}</td>
            <td>${keySnippet}</td>
            <td>${createdDate}</td>
            <td><strong>${expiresDate}</strong></td>
            <td>
                <button class="btn btn-sm btn-danger delete-btn" data-key-id="${k._id || k.id}">Hapus</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    wrap.innerHTML = html;
    
    // Setelah tabel dirender, tambahkan event listener ke tombol Hapus
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteKey);
    });
}

// --- FUNGSI HAPUS SATU KEY ---

async function handleDeleteKey(event) {
    const keyId = event.target.dataset.keyId; // Mengambil ID dari atribut data-key-id
    if (!confirm(`Yakin ingin menghapus API Key ID: ${keyId}?`)) return;

    out.textContent = `Menghapus key ${keyId}...`;
    const token = getToken();

    try {
        // Menggunakan endpoint DELETE yang sudah kita buat: /api/admin/apikeys/:id
        const res = await fetch(`/api/admin/apikeys/${keyId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
            out.textContent = `Sukses: ${data.message}`;
            // Muat ulang data setelah penghapusan berhasil
            document.getElementById("loadUsers").click(); 
        } else {
            out.textContent = `Gagal menghapus: ${data.message || 'Server error.'}`;
        }
    } catch (error) {
        console.error(error);
        out.textContent = `Koneksi Error saat menghapus: ${error.message}`;
    }
}

