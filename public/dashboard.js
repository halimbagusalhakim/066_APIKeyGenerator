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
            // Edit button (always available)
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.style.marginRight = '8px';
            editBtn.onclick = () => handleEdit(key);
            actionCell.appendChild(editBtn);

            // Nonaktifkan / Delete button (hanya jika aktif)
            if (key.status !== 'Inactive') {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Nonaktifkan';
                deleteBtn.onclick = () => handleDelete(key.id);
                actionCell.appendChild(deleteBtn);
            }

            // Permanently delete button
            const hardDeleteBtn = document.createElement('button');
            hardDeleteBtn.textContent = 'Hapus';
            hardDeleteBtn.style.marginLeft = '8px';
            hardDeleteBtn.onclick = () => handleHardDelete(key.id);
            actionCell.appendChild(hardDeleteBtn);
        });
    };

    // --- HANDLE EDIT ---
    const handleEdit = async (key) => {
        // Simple prompts for quick edit UX. Keep existing value as default.
        const firstName = prompt('First name:', key.firstName) || key.firstName;
        const lastName = prompt('Last name:', key.lastName) || key.lastName;
        const email = prompt('Email:', key.email) || key.email;

        // expire input: show date part if possible
        const currentExpires = key.expiresAt ? new Date(key.expiresAt).toISOString().slice(0,10) : '';
        const expiresInput = prompt('Expires at (YYYY-MM-DD) leave empty to keep:', currentExpires);
        let expiresAt = undefined;
        if (expiresInput && expiresInput.trim() !== '') {
            // convert to ISO datetime
            const dt = new Date(expiresInput + 'T23:59:59Z');
            expiresAt = dt.toISOString();
        }

        const payload = { firstName, lastName, email };
        if (expiresAt !== undefined) payload.expiresAt = expiresAt;

        try {
            const response = await fetch(`/api/apikey/${key.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                alert('API Key berhasil diperbarui.');
                fetchKeys();
            } else {
                alert(`Gagal update: ${data.message || response.statusText}`);
            }
        } catch (err) {
            console.error('Network Error (edit):', err);
            alert('Kesalahan koneksi saat memperbarui.');
        }
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

    const handleHardDelete = async (keyId) => {
        if (!confirm(`Yakin Hapus permanen Key ID: ${keyId}? Ini tidak bisa dikembalikan.`)) return;

        try {
            const response = await fetch(`/api/apikey/${keyId}/hard`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (response.ok) {
                alert('API Key berhasil dihapus permanen.');
                fetchKeys();
            } else {
                alert(`Gagal menghapus permanen: ${data.message || response.statusText}`);
            }
        } catch (err) {
            console.error('Network Error (hard delete):', err);
            alert('Kesalahan koneksi saat menghapus permanen.');
        }
    };

    // Muat data saat halaman dimuat
    fetchKeys();
});