const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listTests, getTest, submitTest, getStatus } = require('../controllers/testController');


router.get('/api/list-tests', auth, listTests);
router.get('/api/test-status', auth, getStatus);
router.get('/api/:testId', auth, getTest);
router.post('/api/:testId/submit', auth, submitTest);

module.exports = router;
