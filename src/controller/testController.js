// src/controllers/testController.js
const prisma = require("../utils/prisma");

// async function listTests(req, res) {
//   try {
//     const tests = await prisma.test.findMany({
//       orderBy: { createdAt: "desc" },
//       select: {
//         id: true,
//         title: true,
//         type: true,
//         description: true,
//         createdAt: true,
//       },
//     });

//     res.json(tests);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

async function listTests(req, res) {
  const userId = req.user.id;

  const tests = await prisma.test.findMany({
    include: {
      attempts: {
        where: { userId },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
      type: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const result = tests.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    type: t.type?.name,
    latestAttemptId: t.attempts[0]?.id ?? null,
    completed: !!t.attempts[0],
  }));

  res.json(result);
}

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

    let autoScore = 0;

    const letterToIndex = { a: 0, b: 1, c: 2, d: 3 };

    test.questions.forEach((q) => {
      if (q.questionType !== "MULTIPLE_CHOICE") return;

      const submittedLetter = answers[q.id] ?? answers[String(q.id)];
      if (!submittedLetter) return;

      const submitted = submittedLetter.toLowerCase(); 
      const correct = String(q.answer).toLowerCase(); 

      if (submitted === correct) {
        autoScore += Number(q.autoScore || 1);
      }
    });

    const now = new Date();

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

    const attempt = existing
      ? await prisma.attempt.update({
          where: { id: existing.id },
          data: {
            answers,
            autoScore,
            manualScore: null,
            finalScore: null,
            passStatus: null,
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
