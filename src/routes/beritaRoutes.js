const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const beritaController = require('../controller/beritaController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/api/create-berita', upload.single('content_images'), beritaController.createBerita);
router.get("/api/berita-admin", beritaController.getBeritaAdmin);
router.get("/api/berita-admin/:id", beritaController.getBeritaByIdAdmin);
router.put("/api/publish-berita/:id", beritaController.publishBerita);
router.put("/api/unpublish-berita/:id", beritaController.unpublishBerita);
router.put('/api/update-berita/:id', upload.single('content_images'), beritaController.updateBerita);
router.delete("/api/delete-berita/:id", beritaController.deleteBerita);

router.get("/api/berita-public", beritaController.getBeritaPublic);
router.get("/api/berita-public/:id", beritaController.getBeritaByIdPublic);


module.exports = router;
