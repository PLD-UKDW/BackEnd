const express = require("express");
const router = express.Router();
const statsController = require("../controller/statsFltering");

router.get("/statistik-mahasiswa", statsController.filterMahasiswa);

module.exports = router;