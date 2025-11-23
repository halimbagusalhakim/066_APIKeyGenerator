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

};