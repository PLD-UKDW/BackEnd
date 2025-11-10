const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controller/mahasiswaController');
const isAdmin = require('../middleware/isAdmin');
const auth = require('../middleware/auth');

router.get('/api/mahasiswa', auth, isAdmin, mahasiswaController.getAllMahasiswa);
router.get('/api/mahasiswa/:id', auth, isAdmin, mahasiswaController.getMahasiswaById);
router.post('/api/create-mahasiswa', auth, isAdmin, mahasiswaController.createMahasiswa);
router.put('/api/update-mahasiswa/:id', auth, isAdmin, mahasiswaController.updateMahasiswa);
router.delete('/api/delete-mahasiswa/:id', auth, isAdmin, mahasiswaController.deleteMahasiswa);

module.exports = router;