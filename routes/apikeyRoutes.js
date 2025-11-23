const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware otentikasi JWT


router.delete('/:id', authMiddleware, apiKeyController.deleteApiKey);

module.exports = router;