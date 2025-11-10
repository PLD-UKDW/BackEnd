const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listTests, getTest, submitTest, getStatus } = require('../controllers/testController');

router.get('/', auth, listTests);
router.get('/status', auth, getStatus);
router.get('/:testId', auth, getTest);
router.post('/:testId/submit', auth, submitTest);

module.exports = router;
