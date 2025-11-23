document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateKey');
    const saveButton = document.getElementById('saveUser');
    const form = document.getElementById('key-form'); 
    
    // Input Fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const apiKeyInput = document.getElementById('apiKey');
    const expiresAtInput = document.getElementById('expiresAt');
    const out = document.getElementById('out'); 

    // --- FUNGSI 1: GENERATE API KEY ---
    generateButton.addEventListener('click', async () => {
        out.textContent = 'Generating key...';
        generateButton.disabled = true;
        saveButton.disabled = true;

        try {
            const response = await fetch('/api/user/generate-key-only', { method: 'POST' });
            const data = await response.json();

            if (response.ok) {
                apiKeyInput.value = data.apiKey;
                apiKeyInput.placeholder = 'Key Generated';
                out.textContent = 'Key berhasil digenerate. Silakan klik "Save Data".';
                saveButton.disabled = false; // AKTIFKAN TOMBOL SAVE
                expiresAtInput.value = '';
            } else {
                out.textContent = `Error: ${data.message || 'Gagal menggenerasi key.'}`;
            }
        } catch (error) {
            out.textContent = `Koneksi Error saat generate key.`;
        } finally {
            generateButton.disabled = false;
        }
    });

    // --- FUNGSI 2: SAVE DATA ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!apiKeyInput.value) {
            out.textContent = 'Error: Harap generate API Key terlebih dahulu.';
            return;
        }
        
        out.textContent = 'Saving data and API key...';
        saveButton.disabled = true;
        generateButton.disabled = true;

        try {
            const payload = {
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: emailInput.value,
                apiKey: apiKeyInput.value 
            };
            
            const response = await fetch('/api/user/save-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                const date = new Date(data.expiresAt);
                expiresAtInput.value = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                out.textContent = `SUCCESS! Data dan API Key berhasil disimpan.`;
                generateButton.disabled = false;
            } else {
                out.textContent = `ERROR (${response.status}): ${data.message || 'Gagal menyimpan data.'}`;
            }
        } catch (error) {
            out.textContent = `Koneksi Error saat menyimpan data.`;
        } finally {
            saveButton.disabled = false;
        }
    });
});