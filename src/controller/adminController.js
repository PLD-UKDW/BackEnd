// src/controllers/adminController.js
const prisma = require("../utils/prisma");

// =============================================
// -------------- TEST MANAGEMENT --------------
// =============================================
exports.listTests = async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      include: { questions: true },
    });
    res.json(tests);
  } catch (err) {
    console.error("listTests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTestDetail = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: Number(testId) },
      include: { questions: true },
    });

    if (!test) return res.status(404).json({ message: "Test not found" });

    res.json(test);
  } catch (err) {
    console.error("getTestDetail:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE TEST
exports.createTest = async (req, res) => {
  try {
    const { title, typeId, description } = req.body;

    const test = await prisma.test.create({
      data: {
        title,
        description,
        type: typeId ? { connect: { id: Number(typeId) } } : undefined,
      },
    });

    res.status(201).json({
      message: "Test created successfully",
      test,
    });
  } catch (err) {
    console.error("createTest:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE TEST
exports.deleteTest = async (req, res) => {
  try {
    const testId = Number(req.params.testId);

    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Hapus semua attempts untuk test ini
    await prisma.attempt.deleteMany({
      where: {
        testId: testId,
      },
    });

    // Hapus semua questions untuk test ini
    await prisma.question.deleteMany({
      where: {
        testId: testId,
      },
    });

    // Baru hapus test-nya
    await prisma.test.delete({
      where: { id: testId },
    });

    res.json({ message: "Test deleted successfully" });
  } catch (err) {
    console.error("deleteTest:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =============================================
// ------------- QUESTION MANAGEMENT ------------
// =============================================
exports.addQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { text, options, answer, questionType, autoScore } = req.body;

    const q = await prisma.question.create({
      data: {
        text,
        options,
        answer,
        questionType,
        autoScore: Number(autoScore) || 0,
        testId: Number(testId),
      },
    });

    res.status(201).json(q);
  } catch (err) {
    console.error("addQuestion:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Question not found" });
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error("deleteQuestion:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAllQuestions = async (req, res) => {
  try {
    const testId = Number(req.params.testId);

    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) return res.status(404).json({ message: "Test not found" });

    await prisma.question.deleteMany({
      where: { testId },
    });

    res.json({ message: "All questions deleted for this test" });
  } catch (err) {
    console.error("deleteAllQuestions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// EDIT QUESTION
exports.updateQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);
    const { text, options, answer, questionType, autoScore } = req.body;

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Question not found" });
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        options,
        answer,
        questionType,
        autoScore: Number(autoScore) || 0,
      },
    });

    res.json({
      message: "Question updated successfully",
      updated,
    });
  } catch (err) {
    console.error("updateQuestion:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =============================================
// --------------- ATTEMPT MANAGEMENT ----------
// =============================================

// List semua attempt
exports.listAttempts = async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      include: {
        user: true,
        test: true,
      },
    });

    res.json(attempts);
  } catch (err) {
    console.error("listAttempts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get detail attempt
exports.getAttemptDetail = async (req, res) => {
  try {
    const attemptId = Number(req.params.attemptId);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        user: true,
        test: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json(attempt);
  } catch (err) {
    console.error("getAttemptDetail:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========================= MANUAL SCORING ADMIN =========================
//
// Hanya digunakan untuk COLLEGE_READINESS
// Mengisi manualScore, finalScore, dan passStatus
// ========================================================================

exports.giveScore = async (req, res) => {
  try {
    const attemptId = Number(req.params.attemptId);
    const { manualScore } = req.body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { test: true },
    });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.test.type !== "COLLEGE_READINESS") {
      return res.status(400).json({ message: "Manual scoring only for COLLEGE_READINESS" });
    }

    const finalScore = Number(attempt.autoScore || 0) + Number(manualScore || 0);

    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        manualScore: Number(manualScore),
        finalScore: finalScore,
        passStatus: finalScore >= 70 ? "PASS" : "FAIL",
        gradedAt: new Date(),
      },
    });

    res.json({
      message: "Score updated successfully",
      updated,
    });
  } catch (err) {
    console.error("giveScore:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========================= MANUAL PASS/FAIL SETTING ======================
// Admin override PASS / FAIL
// =========================================================================

exports.setPassStatus = async (req, res) => {
  try {
    const attemptId = Number(req.params.attemptId);
    const { status } = req.body; // PASS / FAIL

    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        passStatus: status,
      },
    });

    res.json({
      message: "Status updated",
      updated,
    });
  } catch (err) {
    console.error("setPassStatus:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DEBUG: Admin create dummy attempt
exports.debugCreateAttempt = async (req, res) => {
  try {
    const { userId, testId, answers } = req.body;

    const attempt = await prisma.attempt.create({
      data: {
        userId,
        testId,
        answers,
        completedAt: new Date(),
        autoScore: 0,
        manualScore: null,
        finalScore: null,
        passStatus: null,
      },
    });

    res.json({
      message: "Dummy attempt created",
      attempt,
    });
  } catch (err) {
    console.error("debugCreateAttempt:", err);
    res.status(500).json({ error: "Failed to create dummy attempt" });
  }
};
