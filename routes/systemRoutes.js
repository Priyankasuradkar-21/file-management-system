const express = require('express');
const { createSystemConfig, getSystemConfig, updateSystemConfig } = require('../controller/systemController');
const userVerification = require('../middleware/userVerification');
const router = express.Router();


router.post('/system/create', userVerification, createSystemConfig);
router.get('/system/get', userVerification, getSystemConfig);
router.patch('/system/update', userVerification, updateSystemConfig);
module.exports = router;