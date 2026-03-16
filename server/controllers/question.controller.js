import { Question } from "../models/question.model.js";

// Create a question in question bank
export const createQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, marks, negativeMarks, difficultyLevel, topic, course } = req.body;
    if (!questionText || !options || !correctAnswer) {
      return res.status(400).json({ success: false, message: "Question text, options and correct answer are required." });
    }
    if (options.length < 2) {
      return res.status(400).json({ success: false, message: "At least 2 options are required." });
    }
    const question = await Question.create({
      creator: req.id,
      questionText,
      options,
      correctAnswer,
      marks: marks || 1,
      negativeMarks: negativeMarks || 0,
      difficultyLevel: difficultyLevel || "Medium",
      topic: topic || "",
      course: course || null,
    });
    return res.status(201).json({ success: true, question, message: "Question created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to create question." });
  }
};

// Get all questions created by instructor (optionally filter by course)
export const getMyQuestions = async (req, res) => {
  try {
    const { course, topic, difficulty } = req.query;
    const filter = { creator: req.id };
    if (course) filter.course = course;
    if (topic) filter.topic = { $regex: topic, $options: "i" };
    if (difficulty) filter.difficultyLevel = difficulty;

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, questions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to fetch questions." });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findOne({ _id: questionId, creator: req.id });
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    const updated = await Question.findByIdAndUpdate(questionId, req.body, { new: true });
    return res.status(200).json({ success: true, question: updated, message: "Question updated." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to update question." });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findOne({ _id: questionId, creator: req.id });
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    await Question.findByIdAndDelete(questionId);
    return res.status(200).json({ success: true, message: "Question deleted." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to delete question." });
  }
};
