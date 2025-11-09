const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controller/mahasiswaController');

// Route to get all mahasiswa
router.get('/api/mahasiswa', mahasiswaController.getAllMahasiswa);

// Route to get a mahasiswa by ID
router.get('/api/mahasiswa/:id', mahasiswaController.getMahasiswaById);

module.exports = router;