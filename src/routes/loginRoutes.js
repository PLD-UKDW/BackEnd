const express = require('express');
const router = express.Router();
const login  = require('../controller/login');

router.post('/api/login', login.login);
router.post('/api/verify-admin', login.verifyAdmin);
router.post('/api/resend-otp', login.resendOtp);

module.exports = router;