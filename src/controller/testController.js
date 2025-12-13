// // const { PrismaClient } = require('@prisma/client');
// // const prisma = new PrismaClient();
// const prisma = require("../utils/prisma");

// /**
//  * List semua test
//  * GET /api/test
//  */
// const getAllTest = async (req, res) => {
//   try {
//     const tests = await prisma.test.findMany({ select: { id: true, title: true, type: true, description: true }});
//     res.json(tests);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /**
//  * Ambil test & soal (tanpa jawaban benar)
//  * GET /api/test/:testId
//  */
// const getTest = async (req, res) => {
//   try {
//     const testId = Number(req.params.testId);
//     const test = await prisma.test.findUnique({ where: { id: testId }, include: { questions: true }});
//     if (!test) return res.status(404).json({ message: "Test not found" });

//     const questions = test.questions.map(q => ({
//       id: q.id,
//       text: q.text,
//       options: q.options
//     }));

//     res.json({ id: test.id, title: test.title, type: test.type, questions });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /**
//  * Submit jawaban
//  * POST /api/test/:testId/submit
//  * body: { answers: { "<questionId>": "<option string>" } }
//  */
// const submitTest = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const testId = Number(req.params.testId);
//     const { answers } = req.body;

//     if (!answers || typeof answers !== 'object') return res.status(400).json({ message: "answers object required" });

//     const test = await prisma.test.findUnique({ where: { id: testId }, include: { questions: true }});
//     if (!test) return res.status(404).json({ message: "Test not found" });

//     // Cek apakah attempt sudah completed
//     const existing = await prisma.attempt.findUnique({ where: { userId_testId: { userId, testId } }});
//     if (existing && existing.completedAt) {
//       return res.status(400).json({ message: "Test already submitted" });
//     }

//     // Hitung score (jumlah jawaban benar)
//     let score = 0;
//     for (const q of test.questions) {
//       const submitted = answers[q.id];
//       if (!submitted) continue;
//       if (submitted === q.answer) score += 1;
//     }

//     const now = new Date();
//     if (existing) {
//       const updated = await prisma.attempt.update({
//         where: { id: existing.id },
//         data: { answers, score, completedAt: now }
//       });
//       res.json({ message: "Submitted", score, attempt: updated });
//     } else {
//       const created = await prisma.attempt.create({
//         data: { userId, testId, answers, score, completedAt: now }
//       });
//       res.json({ message: "Submitted", score, attempt: created });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /**
//  * Cek status: apakah user sudah menyelesaikan kedua test wajib
//  * GET /api/test/status
//  */
// const getStatus = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const attempts = await prisma.attempt.findMany({
//       where: { userId },
//       include: { test: true }
//     });

//     const doneTypes = attempts.filter(a => a.completedAt).map(a => a.test.type);
//     const required = ["DIGITAL_LITERACY", "COLLEGE_READINESS"];
//     const missing = required.filter(r => !doneTypes.includes(r));

//     res.json({ doneTypes, missing, completed: missing.length === 0 });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// module.exports = { getAllTest, getTest, submitTest, getStatus };



// src/controllers/testController.js
const prisma = require("../utils/prisma");

/**
 * List semua test
 * GET /api/test
 */
async function listTests(req, res) {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        createdAt: true,
      },
    });

    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Ambil test & soal (tanpa jawaban benar)
 * GET /api/test/:testId
 */
async function getTest(req, res) {
  try {
    const testId = Number(req.params.testId);
    console.log("testId:", testId);

    if (isNaN(testId)) {
      return res.status(400).json({ message: "Invalid testId" });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) return res.status(404).json({ message: "Test not found" });

    // Jangan kirim jawaban benar ke frontend
    const questions = test.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      questionType: q.questionType,
    }));

    res.json({
      id: test.id,
      title: test.title,
      type: test.type,
      description: test.description,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Submit jawaban
 * POST /api/test/:testId/submit
 */
async function submitTest(req, res) {
  try {
    const userId = req.user.id;

    const testId = Number(req.params.testId);
    console.log("RAW BODY:", req.body);

    let rawAnswers = req.body.answers;

    let answers;
    if (typeof rawAnswers === "string") {
      try {
        answers = JSON.parse(rawAnswers);
      } catch (err) {
        console.error("JSON parse error:", err);
        return res.status(400).json({ message: "Invalid answers JSON" });
      }
    } else {
      answers = rawAnswers;
    }

    console.log("Parsed answers:", answers);
    console.log("Keys:", Object.keys(answers));

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "answers object required" });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) return res.status(404).json({ message: "Test not found" });

    const existing = await prisma.attempt.findUnique({
      where: { userId_testId: { userId, testId } },
    });

    // ============================================================
    // 1. Hitung AUTOMATIC SCORE (MULTIPLE_CHOICE only)
    // ============================================================
    let autoScore = 0;

    // huruf ke index angka
    const letterToIndex = { a: 0, b: 1, c: 2, d: 3 };

    test.questions.forEach((q) => {
      if (q.questionType !== "MULTIPLE_CHOICE") return;

      // Ambil jawaban user (handle key number & string)
      const submittedLetter = answers[q.id] ?? answers[String(q.id)];
      if (!submittedLetter) return;

      const submitted = submittedLetter.toLowerCase(); // 'a'
      const correct = String(q.answer).toLowerCase(); // 'a', 'b', 'c', 'd'

      // Compare direct letter-to-letter
      if (submitted === correct) {
        autoScore += Number(q.autoScore || 1);
      }
    });

    const now = new Date();

    // ===============================
    // CASE 1 — DIGITAL LITERACY
    // ===============================
    if (test.type === "DIGITAL_LITERACY") {
      const minScore = Math.ceil(test.questions.length * 0.7);
      const autoPass = autoScore >= minScore ? "PASS" : "FAIL";

      const attempt = existing
        ? await prisma.attempt.update({
            where: { id: existing.id },
            data: {
              answers,
              autoScore,
              finalScore: autoScore,
              passStatus: autoPass,
              completedAt: now,
              gradedAt: now,
            },
          })
        : await prisma.attempt.create({
            data: {
              userId,
              testId,
              answers,
              autoScore,
              finalScore: autoScore,
              passStatus: autoPass,
              completedAt: now,
              gradedAt: now,
            },
          });

      return res.json({
        message: "Submitted & Auto-Graded",
        autoScore,
        finalScore: autoScore,
        passStatus: autoPass,
        attempt,
      });
    }

    // ===============================
    // CASE 2 — COLLEGE READINESS
    // ===============================
    // Essay tidak dinilai, Admin ULD yang mengisi manualScore.
    const attempt = existing
      ? await prisma.attempt.update({
          where: { id: existing.id },
          data: {
            answers,
            autoScore,
            manualScore: null,
            finalScore: null,
            passStatus: null, // pending
            completedAt: now,
            gradedAt: null,
          },
        })
      : await prisma.attempt.create({
          data: {
            userId,
            testId,
            answers,
            autoScore,
            manualScore: null,
            finalScore: null,
            passStatus: null,
            completedAt: now,
            gradedAt: null,
          },
        });

    return res.json({
      message: "Submitted (Needs Manual Review for Essay)",
      autoScore,
      attempt,
    });
  } catch (err) {
    console.error("submitTest:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Cek status: apakah user sudah menyelesaikan kedua test wajib
 * GET /api/test/status
 */
async function getStatus(req, res) {
  try {
    // const userId = req.user.userId;
    const userId = req.user.id;

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: { test: true },
    });

    const doneTypes = attempts.filter((a) => a.completedAt).map((a) => a.test.type);
    const required = ["DIGITAL_LITERACY", "COLLEGE_READINESS"];
    const missing = required.filter((r) => !doneTypes.includes(r));

    res.json({ doneTypes, missing, completed: missing.length === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getUserAttempt(req, res) {
  try {
    // const userId = req.user.userId;
    const userId = req.user.id;
    const testId = Number(req.params.testId);
    const attemptId = Number(req.query.attemptId);

    const attempt = await prisma.attempt.findFirst({
      where: attemptId ? { id: attemptId, userId } : { testId, userId },
    });

    if (!attempt) {
      return res.status(404).json({ message: "No attempt found" });
    }

    res.json({ attempt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { listTests, getTest, submitTest, getStatus, getUserAttempt };
