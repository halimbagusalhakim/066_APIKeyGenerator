document.addEventListener('DOMContentLoaded', () => {
    const keysTableBody = document.getElementById('keysTableBody');
    const messageElement = document.getElementById('message');
    const logoutButton = document.getElementById('logoutButton');
    const token = localStorage.getItem('adminToken');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // --- Pastikan Logout Bekerja ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        });
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const renderKeys = (keys) => {
        keysTableBody.innerHTML = '';
        if (keys.length === 0) {
            keysTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Tidak ada API Key yang terdaftar.</td></tr>';
            return;
        }
        keys.forEach(key => {
            const row = keysTableBody.insertRow();
            let statusClass = '';
            if (key.status === 'Active') statusClass = 'status-active';
            else if (key.status === 'Expired') statusClass = 'status-expired';
            else if (key.status === 'Inactive') statusClass = 'status-inactive';

            row.insertCell().textContent = key.id;
            row.insertCell().textContent = `${key.firstName} ${key.lastName}`;
            row.insertCell().textContent = key.email;
            row.insertCell().innerHTML = `<span class="${statusClass}">${key.status}</span>`;
            
            const maskedKey = key.key.substring(0, 8) + '...';
            row.insertCell().textContent = maskedKey; 
            
            row.insertCell().textContent = formatDate(key.createdAt);
            row.insertCell().textContent = formatDate(key.expiresAt);

            const actionCell = row.insertCell();
            if (key.status !== 'Inactive') {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Nonaktifkan';
                deleteBtn.onclick = () => handleDelete(key.id);
                actionCell.appendChild(deleteBtn);
            }
        });
    };

    // --- FUNGSI UTAMA FETCH DATA ---
    const fetchKeys = async () => {
        messageElement.textContent = 'Memuat data...';
        try {
            const response = await fetch('/api/admin/keys', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // TOKEN Wajib
                }
            });

            const data = await response.json();

            if (response.ok) {
                renderKeys(data);
                messageElement.textContent = `Ditemukan ${data.length} API Keys.`;
            } else if (response.status === 401 || response.status === 403) {
                console.error("Authentication Failed:", data.message);
                messageElement.textContent = 'Gagal otorisasi. Token tidak valid.';
                localStorage.removeItem('adminToken');
                window.location.href = 'login.html';
            } else {
                console.error('API Error:', data.message || response.statusText);
                messageElement.textContent = `Gagal memuat data: ${data.message || 'Error server.'}`;
            }
        } catch (err) {
            console.error('Network Error:', err);
            messageElement.textContent = 'Kesalahan koneksi jaringan.';
        }
    };

    const handleDelete = async (keyId) => {
        // ... (Logika delete sama, cukup panggil fetchKeys() di akhir)
        if (!confirm(`Yakin nonaktifkan Key ID: ${keyId}?`)) return;

        try {
            const response = await fetch(`/api/apikey/${keyId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('API Key berhasil dinonaktifkan.');
                fetchKeys(); // Refresh data
            } else {
                const data = await response.json();
                alert(`Gagal menghapus: ${data.message}`);
            }
        } catch (err) {
            alert('Kesalahan koneksi saat menghapus.');
        }
    };

    // Muat data saat halaman dimuat
    fetchKeys();
});