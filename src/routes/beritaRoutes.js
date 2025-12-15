const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const beritaController = require('../controller/beritaController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/api/create-berita', upload.array('content_images', 10), auth, isAdmin, beritaController.createBerita);
router.get("/api/berita-admin", auth, isAdmin, beritaController.getBeritaAdmin);
router.get("/api/berita-admin/:id", auth, isAdmin, beritaController.getBeritaByIdAdmin);
router.put("/api/publish-berita/:id", auth, isAdmin, beritaController.publishBerita);
router.put("/api/unpublish-berita/:id", auth, isAdmin, beritaController.unpublishBerita);
router.put('/api/update-berita/:id', upload.array('content_images', 10), auth, isAdmin, beritaController.updateBerita);
router.delete("/api/delete-berita/:id", auth, isAdmin, beritaController.deleteBerita);
router.get("/api/berita-categories", beritaController.getBeritaCategories);
router.post("/api/berita-categories", auth, isAdmin, beritaController.createBeritaCategory);
router.get("/api/berita-public", beritaController.getBeritaPublic);
router.get("/api/berita-public/:id", beritaController.getBeritaByIdPublic);


module.exports = router;