const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const testController = require('../controller/testController');
const isAdmin = require('../middleware/isAdmin')


router.get('/api/list-tests', auth, testController.getAllTest);
router.get('/api/test-status', auth, testController.getStatus);
router.get('/api/:testId', auth, testController.getTest);
router.post('/api/:testId/submit', auth, isAdmin, testController.submitTest);

module.exports = router;
