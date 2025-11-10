const express = require('express');
const router = express.Router();
const login  = require('../controller/login');

router.post('/login', login.login);
router.post('/verify-admin', login.verifyAdmin);

module.exports = router;