const express = require("express");
const router = express.Router();
const statsController = require("../controller/statsFiltering");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.get("/admin-statistik-mahasiswa", auth, isAdmin, statsController.adminfilterMahasiswa);
router.get("/statistik-mahasiswa", statsController.filterMahasiswa);

module.exports = router;