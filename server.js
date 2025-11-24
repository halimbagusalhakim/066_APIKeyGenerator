// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Tambahkan ini untuk parsing body
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Mengimpor instance sequelize dan model Admin dari ./models
// Note: ./models mengimpor instance Sequelize yang sudah diinisialisasi dari config/database.js
const { sequelize, Admin } = require('./models'); 

// Import Routes
const adminRoutes = require('./routes/AdminRoutes');
const userRoutes = require('./routes/userRoutes');
// GANTI BARIS INI (Baris 15)
const apiKeyRoutes = require('./routes/apikeyRoutes'); // PENTING: Untuk fungsi Delete

const app = express();
app.use(express.json());
app.use(bodyParser.json()); // Pastikan body JSON di-parse
app.use('/public', express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/apikey', apiKeyRoutes); // Menggunakan rute API Key

// Default root: mengarahkan ke halaman utama generate key
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const port = process.env.PORT || 3000;

async function start() {
  try {
    // 1. Otentikasi dan Sinkronisasi Database
    await sequelize.authenticate();
    console.log('✅ Database connected!');

    // Sinkronisasi model ke database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced!');

    // 2. Cek dan Buat Admin Default (Jika Belum Ada)
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      const defaultAdminUser = process.env.DEFAULT_ADMIN_USER;
      const defaultAdminPass = process.env.DEFAULT_ADMIN_PASS;

      // Hash password sebelum disimpan (Wajib untuk Login yang Aman)
      const hashedPass = await bcrypt.hash(defaultAdminPass, 10);

      await Admin.create({ username: defaultAdminUser, password: hashedPass });
      console.log(`🔑 Default admin created -> ${defaultAdminUser}/(hashed password)`);
    }

    // 3. Jalankan Server
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();