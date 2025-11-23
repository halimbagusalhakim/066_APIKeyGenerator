const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware otentikasi JWT


router.delete('/:id', authMiddleware, apiKeyController.deleteApiKey);

// Update API Key (edit fields)
router.put('/:id', authMiddleware, apiKeyController.updateApiKey);

// Hard delete (permanent)
router.delete('/:id/hard', authMiddleware, apiKeyController.deleteApiKeyPermanent);

module.exports = router;