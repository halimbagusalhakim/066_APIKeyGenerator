const crypto = require('crypto');
const { User, ApiKey } = require('../models'); 
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

module.exports = {
    async generateKeyOnly(req, res) {
        try {
            const keyString = crypto.randomBytes(32).toString("hex");
            res.json({ apiKey: keyString });
        } catch (err) {
            res.status(500).json({ message: "Gagal menggenerasi API Key." });
        }
    },


    async saveUserDataAndKey(req, res) {
        try {
            const { firstName, lastName, email, apiKey } = req.body;

            if (!firstName || !lastName || !email || !apiKey) {
                return res.status(400).json({ message: 'Semua field wajib diisi.' });
            }

            const existingKey = await ApiKey.findOne({ where: { email } });
            if (existingKey) {
                return res.status(409).json({ message: 'API Key sudah terdaftar untuk email ini.' });
            }

            let user = await User.findOne({ where: { email } });
            if (!user) {
                user = await User.create({ firstName, lastName, email });
            } else {
                user.firstName = firstName;
                user.lastName = lastName;
                await user.save();
            }

            const expiresAt = new Date(Date.now() + THIRTY_DAYS_IN_MS);

            const newApiKey = await ApiKey.create({
                userId: user.id, 
                key: apiKey, 
                firstName, 
                lastName, 
                email,
                expiresAt,
            });

            res.status(201).json({
                message: "Data user dan API Key berhasil disimpan.",
                apiKey: newApiKey.key,
                expiresAt: newApiKey.expiresAt
            });

        } catch (err) {
            console.error('FATAL ERROR IN saveUserDataAndKey:', err);
            res.status(500).json({ message: "Gagal menyimpan data (Server error)." });
        }
    }
};