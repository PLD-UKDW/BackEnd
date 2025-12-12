// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAdmin = require("./../middleware/idAdmin");

// TEST MANAGEMENT
router.get("/tests", isAdmin, adminController.listTests);
router.post("/tests", adminController.createTest);
router.get("/tests/:testId", adminController.getTestDetail);
router.delete("/tests/:testId", adminController.deleteTest);

// QUESTION MANAGEMENT
router.post("/tests/:testId/questions", adminController.addQuestion);
router.put("/questions/:questionId", adminController.updateQuestion);
router.delete("/questions/:questionId", adminController.deleteQuestion);
router.delete("/tests/:testId/questions", adminController.deleteAllQuestions);

// ATTEMPTS & SCORING
router.get("/attempts", adminController.listAttempts);
router.get("/attempts/:attemptId", adminController.getAttemptDetail);
router.post("/attempts/:attemptId/score", adminController.giveScore);
router.post("/debug/create-attempt", adminController.debugCreateAttempt);

// PASS/FAIL STATUS
router.post("/attempts/:attemptId/status", adminController.setPassStatus);

module.exports = router;
