const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/generate-key-only', userController.generateKeyOnly); 

router.post('/save-key', userController.saveUserDataAndKey);

module.exports = router;