const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const beritaController = require('../controller/beritaController');

router.post('/api/create-berita', upload.single('image'), beritaController.createBerita);

module.exports = router;