const { ApiKey } = require('../models'); 

module.exports = {
    async deleteApiKey(req, res) {
        try {
            const { id } = req.params;
            
            const result = await ApiKey.update(
                { isActive: false }, 
                { where: { id: id } }
            );

            if (result[0] === 0) {
                return res.status(404).json({ message: 'API Key tidak ditemukan.' });
            }

            res.json({ message: 'API Key berhasil dinonaktifkan.' });
        } catch (err) {
            console.error('Error deleting API Key:', err);
            res.status(500).json({ message: 'Gagal menghapus API Key.' });
        }
    }

    ,
    async updateApiKey(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, expiresAt, isActive } = req.body;

            const updateFields = {};
            if (firstName !== undefined) updateFields.firstName = firstName;
            if (lastName !== undefined) updateFields.lastName = lastName;
            if (email !== undefined) updateFields.email = email;
            if (expiresAt !== undefined) updateFields.expiresAt = expiresAt;
            if (isActive !== undefined) updateFields.isActive = isActive;

            // If no fields to update
            if (Object.keys(updateFields).length === 0) {
                return res.status(400).json({ message: 'Tidak ada data yang dikirim untuk diupdate.' });
            }

            const [updatedCount] = await ApiKey.update(updateFields, { where: { id } });

            if (updatedCount === 0) {
                return res.status(404).json({ message: 'API Key tidak ditemukan.' });
            }

            const updated = await ApiKey.findByPk(id, {
                attributes: ['id', 'key', 'firstName', 'lastName', 'email', 'expiresAt', 'isActive', 'createdAt']
            });

            res.json({ message: 'API Key berhasil diperbarui.', data: updated });
        } catch (err) {
            console.error('Error updating API Key:', err);
            res.status(500).json({ message: 'Gagal memperbarui API Key.' });
        }
    }

    ,
    async deleteApiKeyPermanent(req, res) {
        try {
            const { id } = req.params;
            const deletedCount = await ApiKey.destroy({ where: { id } });

            if (deletedCount === 0) {
                return res.status(404).json({ message: 'API Key tidak ditemukan.' });
            }

            res.json({ message: 'API Key berhasil dihapus permanen.' });
        } catch (err) {
            console.error('Error permanently deleting API Key:', err);
            res.status(500).json({ message: 'Gagal menghapus API Key secara permanen.' });
        }
    }

};

