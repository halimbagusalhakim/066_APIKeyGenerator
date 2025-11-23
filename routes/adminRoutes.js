
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); 

// 1. Rute Login Admin
router.post('/login', adminController.login); 

// 2. Rute GET untuk Dashboard (Baris yang bermasalah)
router.get('/keys', authMiddleware, adminController.getApiKeys); 

module.exports = router;