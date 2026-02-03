// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const testController = require('../controller/testController');
// const isAdmin = require('../middleware/isAdmin')

// router.get('/api/list-tests', auth, testController.getAllTest);
// router.get('/api/test-status', auth, testController.getStatus);
// router.get('/api/:testId', auth, testController.getTest);
// router.post('/api/:testId/submit', auth, isAdmin, testController.submitTest);

// module.exports = router;

const express = require("express");
const router = express.Router();

// IMPORT middleware (ini wajib!)
const auth = require("../middleware/auth");

// IMPORT controllers
const { listTests, getTest, submitTest, getStatus, getUserAttempt } = require("../controller/testController");
// const adminTest = require("../controller/adminTestController");
// const adminQuestion = require("../controller/adminQuestionController");
// const adminAttempt = require("../controller/adminAttemptController");

// ==============================
// PARTICIPANT ROUTES
// ==============================
router.get("/api/test", auth, listTests);
router.get("/api/test/status", auth, getStatus);
router.get("/api/test/:testId/result", auth, getUserAttempt);
router.get("/api/test/:testId", auth, getTest);
router.post("/api/test/:testId/submit", auth, submitTest);
// router.post('/:testId/attempt', auth, submitTest);

// ==============================
// ADMIN ROUTES (ADMIN ONLY)
// ==============================

// // TEST MANAGEMENT
// router.get("/admin/tests", auth, requireRole("ADMIN"), adminTest.getAllTests);
// router.post("/admin/tests", auth, requireRole("ADMIN"), adminTest.createTest);
// router.put("/admin/tests/:id", auth, requireRole("ADMIN"), adminTest.updateTest);
// router.delete("/admin/tests/:id", auth, requireRole("ADMIN"), adminTest.deleteTest);

// // QUESTION MANAGEMENT
// router.get("/admin/tests/:testId/questions", auth, requireRole("ADMIN"), adminQuestion.listQuestions);
// router.post("/admin/tests/:testId/questions", auth, requireRole("ADMIN"), adminQuestion.createQuestion);
// router.get("/admin/questions/:id", auth, requireRole("ADMIN"), adminQuestion.getQuestionById);
// router.put("/admin/questions/:id", auth, requireRole("ADMIN"), adminQuestion.updateQuestion);
// router.delete("/admin/questions/:id", auth, requireRole("ADMIN"), adminQuestion.deleteQuestion);

// // ATTEMPTS / GRADING / PARTICIPANTS
// router.get("/admin/attempts", auth, requireRole("ADMIN"), adminAttempt.listAttempts);
// router.post("/admin/attempts/:id/grade", auth, requireRole("ADMIN"), adminAttempt.gradeEssay);

// router.get("/admin/tests/:testId/participants", auth, requireRole("ADMIN"), adminAttempt.testParticipants);
// router.get("/admin/tests/:testId/passed", auth, requireRole("ADMIN"), adminAttempt.passedParticipants);

module.exports = router;
