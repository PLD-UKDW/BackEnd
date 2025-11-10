const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controller/mahasiswaController');
const isAdmin = require('../middleware/isAdmin');
const auth = require('../middleware/auth');

// Route to get all mahasiswa
router.get('/api/mahasiswa', auth, isAdmin, mahasiswaController.getAllMahasiswa);

// Route to get a mahasiswa by ID
router.get('/api/mahasiswa/:id', auth, isAdmin, mahasiswaController.getMahasiswaById);

module.exports = router;