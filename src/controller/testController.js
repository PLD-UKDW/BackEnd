// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require("../utils/prisma");

/**
 * List semua test
 * GET /api/test
 */
const getAllTest = async (req, res) => {
  try {
    const tests = await prisma.test.findMany({ select: { id: true, title: true, type: true, description: true }});
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
const getTest = async (req, res) => {
  try {
    const testId = Number(req.params.testId);
    const test = await prisma.test.findUnique({ where: { id: testId }, include: { questions: true }});
    if (!test) return res.status(404).json({ message: "Test not found" });

    const questions = test.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options
    }));

    res.json({ id: test.id, title: test.title, type: test.type, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Submit jawaban
 * POST /api/test/:testId/submit
 * body: { answers: { "<questionId>": "<option string>" } }
 */
const submitTest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const testId = Number(req.params.testId);
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') return res.status(400).json({ message: "answers object required" });

    const test = await prisma.test.findUnique({ where: { id: testId }, include: { questions: true }});
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Cek apakah attempt sudah completed
    const existing = await prisma.attempt.findUnique({ where: { userId_testId: { userId, testId } }});
    if (existing && existing.completedAt) {
      return res.status(400).json({ message: "Test already submitted" });
    }

    // Hitung score (jumlah jawaban benar)
    let score = 0;
    for (const q of test.questions) {
      const submitted = answers[q.id];
      if (!submitted) continue;
      if (submitted === q.answer) score += 1;
    }

    const now = new Date();
    if (existing) {
      const updated = await prisma.attempt.update({
        where: { id: existing.id },
        data: { answers, score, completedAt: now }
      });
      res.json({ message: "Submitted", score, attempt: updated });
    } else {
      const created = await prisma.attempt.create({
        data: { userId, testId, answers, score, completedAt: now }
      });
      res.json({ message: "Submitted", score, attempt: created });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Cek status: apakah user sudah menyelesaikan kedua test wajib
 * GET /api/test/status
 */
const getStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: { test: true }
    });

    const doneTypes = attempts.filter(a => a.completedAt).map(a => a.test.type);
    const required = ["DIGITAL_LITERACY", "COLLEGE_READINESS"];
    const missing = required.filter(r => !doneTypes.includes(r));

    res.json({ doneTypes, missing, completed: missing.length === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getAllTest, getTest, submitTest, getStatus };
