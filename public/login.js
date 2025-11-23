// File: public/login.js

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan semua ID ini cocok dengan login.html
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username'); // <input id="username">
    const passwordInput = document.getElementById('password'); // <input id="password">
    const messageOut = document.getElementById('messageOut');   // <pre id="messageOut">

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = usernameInput.value;
            const password = passwordInput.value;

            messageOut.textContent = 'Mencoba login...';

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Berhasil: Simpan Token dan Redirect
                    localStorage.setItem('adminToken', data.token);
                    messageOut.textContent = 'Login berhasil! Mengalihkan ke dashboard...';

                    // PENTING: Redirect ke dashboard.html
                    window.location.href = '/public/dashboard.html'; 

                } else {
                    // Gagal: Kredensial tidak valid
                    messageOut.textContent = `Login Gagal: ${data.message || 'Kredensial tidak valid.'}`;
                }
            } catch (error) {
                console.error('Error during fetch:', error);
                messageOut.textContent = 'Terjadi kesalahan koneksi server atau CORS.';
            }
        });
    }
});