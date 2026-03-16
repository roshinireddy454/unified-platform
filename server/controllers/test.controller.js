import { Test }           from "../models/test.model.js";
import { TestSubmission } from "../models/testSubmission.model.js";
import { Question }       from "../models/question.model.js";
import { Course }         from "../models/course.model.js";
import { notify }         from "../utils/notify.js";

// ────────────────── INSTRUCTOR CONTROLLERS ──────────────────

export const createTest = async (req, res) => {
  try {
    const {
      courseId, title, description, instructions, duration,
      startTime, endTime, negativeMarkingEnabled, attemptsAllowed,
      randomizeQuestions, randomizeOptions,
    } = req.body;

    if (!courseId || !title || !duration || !startTime || !endTime)
      return res.status(400).json({ success: false, message: "Course, title, duration, start and end time are required." });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    if (String(course.creator) !== String(req.id))
      return res.status(403).json({ success: false, message: "Unauthorized." });

    const test = await Test.create({
      course: courseId, creator: req.id,
      title, description, instructions, duration,
      startTime: new Date(startTime), endTime: new Date(endTime),
      negativeMarkingEnabled: negativeMarkingEnabled || false,
      attemptsAllowed: attemptsAllowed || 1,
      randomizeQuestions: randomizeQuestions || false,
      randomizeOptions:   randomizeOptions   || false,
    });

    // Notify all enrolled students
    const enrolledIds = course.enrolledStudents || [];
    if (enrolledIds.length > 0) {
      await notify(req.io, enrolledIds.map((studentId) => ({
        recipient: studentId,
        type:      "test_created",
        title:     "📝 New Test Created",
        message:   `A new test "${title}" has been added to "${course.courseTitle}". Starting ${new Date(startTime).toLocaleString()}.`,
        link:      `/tests`,
        metadata:  { testId: test._id, courseId },
      })));
    }

    return res.status(201).json({ success: true, test, message: "Test created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to create test." });
  }
};

export const addQuestionsToTest = async (req, res) => {
  try {
    const { testId }    = req.params;
    const { questions } = req.body;
    const test          = await Test.findOne({ _id: testId, creator: req.id });
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });

    const questionIds        = questions.map((q) => q.questionId);
    const existingQuestions  = await Question.find({ _id: { $in: questionIds } });
    if (existingQuestions.length !== questionIds.length)
      return res.status(400).json({ success: false, message: "One or more questions not found." });

    test.questions  = questions.map((q) => ({ question: q.questionId, marks: q.marks || 1, negativeMarks: q.negativeMarks || 0 }));
    test.totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);
    await test.save();
    return res.status(200).json({ success: true, test, message: "Questions added to test." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to add questions." });
  }
};

export const getTestsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tests = await Test.find({ course: courseId, creator: req.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tests });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch tests." });
  }
};

export const getTestById = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId).populate("questions.question").populate("course", "courseTitle");
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });
    return res.status(200).json({ success: true, test });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch test." });
  }
};

export const updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const test       = await Test.findOne({ _id: testId, creator: req.id });
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });
    const allowed = ["title","description","instructions","duration","startTime","endTime","negativeMarkingEnabled","attemptsAllowed","randomizeQuestions","randomizeOptions"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) test[f] = req.body[f]; });
    await test.save();
    return res.status(200).json({ success: true, test, message: "Test updated." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update test." });
  }
};

export const togglePublishTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const test       = await Test.findOne({ _id: testId, creator: req.id });
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });
    if (!test.isPublished && test.questions.length === 0)
      return res.status(400).json({ success: false, message: "Add at least one question before publishing." });
    test.isPublished = !test.isPublished;
    await test.save();
    return res.status(200).json({ success: true, isPublished: test.isPublished, message: `Test ${test.isPublished ? "published" : "unpublished"}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to toggle publish." });
  }
};

export const deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const test       = await Test.findOne({ _id: testId, creator: req.id });
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });
    await Test.findByIdAndDelete(testId);
    await TestSubmission.deleteMany({ test: testId });
    return res.status(200).json({ success: true, message: "Test deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete test." });
  }
};

export const getTestAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;
    const test       = await Test.findOne({ _id: testId, creator: req.id }).populate("questions.question");
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });

    const submissions = await TestSubmission.find({ test: testId })
      .populate("student", "name email")
      .sort({ totalMarksObtained: -1 });

    if (submissions.length === 0)
      return res.status(200).json({ success: true, analytics: { submissions: [], totalAttempted: 0, totalCompleted: 0, averageScore: 0, highestScore: 0, lowestScore: 0, questionStats: [] } });

    const scores       = submissions.map((s) => s.totalMarksObtained);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const questionStats = test.questions.map((tq) => {
      const qId         = String(tq.question._id);
      let correctCount  = 0;
      submissions.forEach((sub) => {
        const ans = sub.answers.find((a) => String(a.question) === qId);
        if (ans?.isCorrect) correctCount++;
      });
      return {
        questionId:        qId,
        questionText:      tq.question.questionText,
        totalAttempted:    submissions.length,
        correctCount,
        correctPercentage: ((correctCount / submissions.length) * 100).toFixed(1),
      };
    });

    return res.status(200).json({
      success: true,
      analytics: {
        submissions:    submissions.slice(0, 50),
        totalAttempted: submissions.length,
        totalCompleted: submissions.length,
        averageScore:   averageScore.toFixed(2),
        highestScore:   Math.max(...scores),
        lowestScore:    Math.min(...scores),
        totalMarks:     test.totalMarks,
        questionStats,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch analytics." });
  }
};

// ────────────────── STUDENT CONTROLLERS ──────────────────

export const getStudentTests = async (req, res) => {
  try {
    const { courseId } = req.params;
    const now          = new Date();
    const tests        = await Test.find({ course: courseId, isPublished: true })
      .select("-questions.question")
      .sort({ startTime: 1 });
    const testsWithStatus = tests.map((t) => {
      let status = "Upcoming";
      if (now >= t.startTime && now <= t.endTime) status = "Active";
      else if (now > t.endTime) status = "Expired";
      return { ...t.toObject(), status };
    });
    return res.status(200).json({ success: true, tests: testsWithStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch tests." });
  }
};

export const startTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const now        = new Date();
    const test       = await Test.findById(testId).populate("questions.question");
    if (!test || !test.isPublished) return res.status(404).json({ success: false, message: "Test not found." });
    if (now < test.startTime) return res.status(403).json({ success: false, message: "Test has not started yet." });
    if (now > test.endTime)   return res.status(403).json({ success: false, message: "Test has ended." });

    const prevAttempts = await TestSubmission.countDocuments({ test: testId, student: req.id });
    if (prevAttempts >= test.attemptsAllowed)
      return res.status(403).json({ success: false, message: "Maximum attempts reached." });

    let questions = test.questions.map((tq) => {
      let options = [...tq.question.options];
      if (test.randomizeOptions) options = options.sort(() => Math.random() - 0.5);
      return {
        _id:           tq.question._id,
        questionText:  tq.question.questionText,
        options,
        marks:         tq.marks,
        negativeMarks: tq.negativeMarks,
        topic:         tq.question.topic,
        difficultyLevel: tq.question.difficultyLevel,
      };
    });
    if (test.randomizeQuestions) questions = questions.sort(() => Math.random() - 0.5);

    const remainingSeconds = Math.max(0, Math.floor((test.endTime - now) / 1000));
    const durationSeconds  = Math.min(test.duration * 60, remainingSeconds);

    return res.status(200).json({
      success: true,
      test: {
        _id:                    test._id,
        title:                  test.title,
        instructions:           test.instructions,
        duration:               test.duration,
        durationSeconds,
        totalMarks:             test.totalMarks,
        negativeMarkingEnabled: test.negativeMarkingEnabled,
        endTime:                test.endTime,
        questions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to start test." });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId }                          = req.params;
    const { answers, timeTaken, isAutoSubmitted } = req.body;
    const test = await Test.findById(testId).populate("questions.question");
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });

    const existingSubmission = await TestSubmission.findOne({ test: testId, student: req.id });
    if (existingSubmission)
      return res.status(400).json({ success: false, message: "You have already submitted this test." });

    let totalMarksObtained = 0, correctCount = 0, incorrectCount = 0, unansweredCount = 0;

    const evaluatedAnswers = test.questions.map((tq) => {
      const studentAnswer = (answers || []).find((a) => String(a.questionId) === String(tq.question._id));
      const selected      = studentAnswer?.selectedOption || null;
      const isCorrect     = selected && selected === tq.question.correctAnswer;
      let marksAwarded    = 0;

      if (!selected) {
        unansweredCount++;
      } else if (isCorrect) {
        marksAwarded = tq.marks; correctCount++; totalMarksObtained += marksAwarded;
      } else {
        incorrectCount++;
        if (test.negativeMarkingEnabled) { marksAwarded = -tq.negativeMarks; totalMarksObtained += marksAwarded; }
      }

      return { question: tq.question._id, selectedOption: selected, isCorrect: !!isCorrect, marksAwarded };
    });

    totalMarksObtained = Math.max(0, totalMarksObtained);
    const percentage   = test.totalMarks > 0 ? ((totalMarksObtained / test.totalMarks) * 100).toFixed(2) : 0;
    const prevAttempts = await TestSubmission.countDocuments({ test: testId, student: req.id });

    const submission = await TestSubmission.create({
      test: testId, student: req.id,
      answers: evaluatedAnswers, totalMarksObtained, totalMarks: test.totalMarks,
      correctCount, incorrectCount, unansweredCount,
      percentage: parseFloat(percentage),
      timeTaken: timeTaken || 0, isAutoSubmitted: isAutoSubmitted || false,
      attemptNumber: prevAttempts + 1,
    });

    // Notify student: submitted + analytics ready
    await notify(req.io, [
      {
        recipient: req.id,
        type:      "test_submitted",
        title:     isAutoSubmitted ? "⏱ Test Auto-Submitted" : "✅ Test Submitted",
        message:   isAutoSubmitted
          ? `Your test "${test.title}" was automatically submitted when the timer ran out.`
          : `Your test "${test.title}" was submitted successfully.`,
        link:      `/test/${testId}/result`,
        metadata:  { testId },
      },
      {
        recipient: req.id,
        type:      "test_analytics",
        title:     "📊 Your Test Results Are Ready",
        message:   `You scored ${totalMarksObtained}/${test.totalMarks} (${percentage}%) in "${test.title}". View your detailed analysis.`,
        link:      `/test/${testId}/result`,
        metadata:  { testId, score: totalMarksObtained, totalMarks: test.totalMarks, percentage },
      },
    ]);

    return res.status(201).json({ success: true, submission, message: "Test submitted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to submit test." });
  }
};

export const getMyResult = async (req, res) => {
  try {
    const { testId }  = req.params;
    const submission  = await TestSubmission.findOne({ test: testId, student: req.id })
      .populate({ path: "answers.question", select: "questionText options correctAnswer topic difficultyLevel" });
    if (!submission) return res.status(404).json({ success: false, message: "No submission found." });

    const allSubmissions = await TestSubmission.find({ test: testId }).sort({ totalMarksObtained: -1 });
    const rank           = allSubmissions.findIndex((s) => String(s.student) === String(req.id)) + 1;

    return res.status(200).json({ success: true, submission, rank, totalStudents: allSubmissions.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch result." });
  }
};

export const getMyAllResults = async (req, res) => {
  try {
    const submissions = await TestSubmission.find({ student: req.id })
      .populate("test", "title totalMarks course startTime")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch results." });
  }
};