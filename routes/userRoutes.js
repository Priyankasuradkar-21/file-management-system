const express = require('express');
const { userRegistration, userLogin, verifyOTP, resendOTP } = require('../controller/userController');
const router = express.Router();

router.post('/user/register', userRegistration);
router.post('/user/login', userLogin);
router.post('/user/verify', verifyOTP);
router.patch('/user/otp/resend', resendOTP);
module.exports = router;