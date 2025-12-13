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
const testController = require("../controller/testController");
// const adminTest = require("../controller/adminTestController");
// const adminQuestion = require("../controller/adminQuestionController");
// const adminAttempt = require("../controllers/adminAttemptController");

// ==============================
// PARTICIPANT ROUTES
// ==============================
router.get("/", auth, testController.listTests);
router.get("/status", auth, testController.getStatus);
router.get("/:testId/result", auth, testController.getUserAttempt);
router.get("/:testId", auth, testController.getTest);
router.post("/:testId/submit", auth, testController.submitTest);
// router.post('/:testId/attempt', auth, submitTest);

// ==============================
// ADMIN ROUTES (ADMIN ONLY)
// ==============================

// TEST MANAGEMENT
// router.get("/admin/tests", auth, isAdmin, adminTest.getAllTests);
// router.post("/admin/tests", auth, isAdmin, adminTest.createTest);
// router.put("/admin/tests/:id", auth, isAdmin, adminTest.updateTest);
// router.delete("/admin/tests/:id", auth, isAdmin, adminTest.deleteTest);

// // QUESTION MANAGEMENT
// router.get("/admin/tests/:testId/questions", auth, isAdmin, adminQuestion.listQuestions);
// router.post("/admin/tests/:testId/questions", auth, isAdmin, adminQuestion.createQuestion);
// router.get("/admin/questions/:id", auth, isAdmin, adminQuestion.getQuestionById);
// router.put("/admin/questions/:id", auth, isAdmin, adminQuestion.updateQuestion);
// router.delete("/admin/questions/:id", auth, isAdmin, adminQuestion.deleteQuestion);

// // ATTEMPTS / GRADING / PARTICIPANTS
// router.get("/admin/attempts", auth, isAdmin, adminAttempt.listAttempts);
// router.post("/admin/attempts/:id/grade", auth, isAdmin, adminAttempt.gradeEssay);

// router.get("/admin/tests/:testId/participants", auth, isAdmin, adminAttempt.testParticipants);
// router.get("/admin/tests/:testId/passed", auth, isAdmin, adminAttempt.passedParticipants);

module.exports = router;
