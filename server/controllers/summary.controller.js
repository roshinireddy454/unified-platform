import fs   from "fs";
import path  from "path";
import { fileURLToPath } from "url";
import { MeetingSummary } from "../models/meetingSummary.model.js";
import { User }           from "../models/user.model.js";
import { generateSummaryPdf } from "../utils/pdf.js";
import { notify }         from "../utils/notify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents:         [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 3000 },
        }),
      }
    );
    if (!response.ok) throw new Error(`Gemini error ${response.status}`);
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return null;
  }
}

async function generateAISummary(transcript, title) {
  if (!transcript || transcript.trim().length < 10) return null;
  return callGemini(
    `You are an expert educational content summarizer.\n\nClass Title: "${title}"\n\nFull Class Transcript:\n"${transcript}"\n\nBased ONLY on what was actually spoken in the transcript above, write a structured class summary with these sections:\n\n1. OVERVIEW\n2-3 sentences about what was covered.\n\n2. KEY TOPICS COVERED\nBullet points of main topics discussed.\n\n3. IMPORTANT CONCEPTS & DEFINITIONS\nKey concepts or terms explained.\n\n4. EXAMPLES OR DEMONSTRATIONS\nAny examples mentioned.\n\n5. KEY TAKEAWAYS\nMost important things students should remember.\n\nBase ONLY on transcript content. Be specific and educational.`
  );
}

async function generateAISubtitles(transcript) {
  if (!transcript || transcript.trim().length < 10) return null;
  return callGemini(
    `Convert this class transcript into clean numbered subtitles (max 12 words per line, remove filler words, fix grammar):\n"${transcript}"\nReturn ONLY numbered lines like:\n1. First subtitle here.\n2. Second subtitle here.`
  );
}

function fallbackSummary(transcript) {
  if (!transcript || transcript.trim().length < 5)
    return "No transcript was captured for this session. Ensure microphone access is granted during live classes.";
  const sentences  = transcript.split(/[.!?]/).map((s) => s.trim()).filter((s) => s.length > 8);
  const keywords   = ["learn","topic","important","concept","example","today","explain","understand","key","remember","first","second","finally","because"];
  const important  = sentences.filter((s) => keywords.some((k) => s.toLowerCase().includes(k)));
  const chosen     = important.length >= 3 ? important.slice(0, 8) : sentences.slice(0, 6);
  const wordCount  = transcript.split(" ").filter(Boolean).length;
  return `1. OVERVIEW\nThis class covered the topics discussed in the live session. (${wordCount} words transcribed)\n\n2. KEY POINTS EXTRACTED\n${chosen.map((s) => `• ${s}.`).join("\n")}\n\n3. NOTE\nEnable GEMINI_API_KEY in your .env for detailed AI summaries.`;
}

export const generateSummary = async (req, res) => {
  try {
    const { transcript, meetingTitle, meetingId } = req.body;
    const userId = req.id;

    if (!meetingId) return res.status(400).json({ success: false, error: "meetingId is required" });

    const safeTranscript =
      transcript && transcript.trim().length > 5
        ? transcript.trim()
        : "No transcript was captured for this session.";

    const hasAI = !!process.env.GEMINI_API_KEY;
    let summary  = null;
    let subtitles = null;

    if (hasAI && safeTranscript !== "No transcript was captured for this session.") {
      [summary, subtitles] = await Promise.all([
        generateAISummary(safeTranscript, meetingTitle || "Class"),
        generateAISubtitles(safeTranscript),
      ]);
    }
    if (!summary) summary = fallbackSummary(safeTranscript);

    let pdfUrl = null;
    try {
      const pdfBytes = await generateSummaryPdf({
        title:    meetingTitle || "Class Summary",
        date:     new Date().toLocaleDateString(),
        fullText: safeTranscript,
        summary,
        subtitles,
      });
      const pdfDir  = path.join(__dirname, "../../public/summaries");
      fs.mkdirSync(pdfDir, { recursive: true });
      const fileName = `${meetingId.replace(/[^a-z0-9_-]/gi, "_")}.pdf`;
      fs.writeFileSync(path.join(pdfDir, fileName), pdfBytes);
      pdfUrl = `/summaries/${fileName}`;
    } catch (pdfErr) {
      console.error("PDF generation failed (non-fatal):", pdfErr.message);
    }

    const saved = await MeetingSummary.findOneAndUpdate(
      { meetingId },
      {
        meetingId,
        meetingTitle:    meetingTitle || "Meeting Summary",
        transcript:      safeTranscript,
        summary,
        subtitles,
        pdfPath:         pdfUrl,
        generatedBy:     userId,
        aiGenerated:     hasAI && safeTranscript !== "No transcript was captured for this session.",
        deletedByCreator: false,
        expiresAt:       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // Notify all students that a summary is available
    const students = await User.find({ role: "student" }).select("_id");
    await notify(req.io, students.map((s) => ({
      recipient: s._id,
      type:      "summary_available",
      title:     "📄 Class Summary Available",
      message:   `Your instructor generated a summary for "${meetingTitle || "a recent class"}". Check it out in Summaries.`,
      link:      `/summaries`,
      metadata:  { meetingId },
    })));

    return res.status(200).json({
      success: true, meetingId, pdfPath: pdfUrl,
      summary, subtitles, aiGenerated: saved.aiGenerated,
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate summary" });
  }
};

export const getSummaries = async (req, res) => {
  try {
    const summaries = await MeetingSummary.find({ deletedByCreator: { $ne: true } })
      .populate("generatedBy", "name photoUrl role")
      .sort({ createdAt: -1 })
      .select("-transcript");
    return res.status(200).json({ success: true, summaries });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch summaries" });
  }
};

export const getSummaryById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const summary       = await MeetingSummary.findOne({ meetingId }).populate("generatedBy", "name photoUrl");
    if (!summary) return res.status(404).json({ success: false, message: "Summary not found" });
    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
};

export const deleteSummary = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const user          = await User.findById(req.id).select("role");
    if (user.role !== "instructor")
      return res.status(403).json({ success: false, message: "Only instructors can delete summaries" });

    const summary = await MeetingSummary.findOne({ meetingId });
    if (!summary) return res.status(404).json({ success: false, message: "Summary not found" });
    if (summary.generatedBy?.toString() !== req.id)
      return res.status(403).json({ success: false, message: "You can only delete your own summaries" });

    await MeetingSummary.findOneAndUpdate({ meetingId }, { deletedByCreator: true, deletedAt: new Date() });
    return res.status(200).json({ success: true, message: "Summary deleted successfully" });
  } catch (error) {
    console.error("Delete summary error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete summary" });
  }
};