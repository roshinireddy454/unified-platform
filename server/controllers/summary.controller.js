import fs   from "fs";
import path  from "path";
import { fileURLToPath } from "url";
import { MeetingSummary } from "../models/meetingSummary.model.js";
import { User }           from "../models/user.model.js";
import { generateSummaryPdf } from "../utils/pdf.js";
import { notify }         from "../utils/notify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────
// Gemini helpers
// ─────────────────────────────────────────────────────────────
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
  const sentences = transcript.split(/[.!?]/).map((s) => s.trim()).filter((s) => s.length > 8);
  const keywords  = ["learn","topic","important","concept","example","today","explain","understand","key","remember","first","second","finally","because"];
  const important = sentences.filter((s) => keywords.some((k) => s.toLowerCase().includes(k)));
  const chosen    = important.length >= 3 ? important.slice(0, 8) : sentences.slice(0, 6);
  const wordCount = transcript.split(" ").filter(Boolean).length;
  return `1. OVERVIEW\nThis class covered the topics discussed in the live session. (${wordCount} words transcribed)\n\n2. KEY POINTS EXTRACTED\n${chosen.map((s) => `• ${s}.`).join("\n")}\n\n3. NOTE\nEnable GEMINI_API_KEY in your .env for detailed AI summaries.`;
}

// ─────────────────────────────────────────────────────────────
// GENERATE SUMMARY  (called from live class)
// ─────────────────────────────────────────────────────────────
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
    let summary   = null;
    let subtitles = null;

    if (hasAI && safeTranscript !== "No transcript was captured for this session.") {
      [summary, subtitles] = await Promise.all([
        generateAISummary(safeTranscript, meetingTitle || "Class"),
        generateAISubtitles(safeTranscript),
      ]);
    }
    if (!summary) summary = fallbackSummary(safeTranscript);

    // ── Generate PDF and write to disk ───────────────────────
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

    // ── Upsert summary record ────────────────────────────────
    const saved = await MeetingSummary.findOneAndUpdate(
      { meetingId },
      {
        meetingId,
        meetingTitle:     meetingTitle || "Meeting Summary",
        transcript:       safeTranscript,
        summary,
        subtitles,
        pdfPath:          pdfUrl,
        generatedBy:      userId,
        aiGenerated:      hasAI && safeTranscript !== "No transcript was captured for this session.",
        deletedByCreator: false,
        expiresAt:        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // ── Notify all students ──────────────────────────────────
    try {
      const students = await User.find({ role: "student" }).select("_id");
      if (students.length > 0) {
        await notify(
          req.io,
          students.map((s) => ({
            recipient: s._id,
            type:      "summary_available",
            title:     "📄 Class Summary Available",
            message:   `Your instructor generated a summary for "${meetingTitle || "a recent class"}". Check it out in Summaries.`,
            link:      "/summaries",
            metadata:  { meetingId },
          }))
        );
      }
    } catch (notifyErr) {
      console.error("Notification send failed (non-fatal):", notifyErr.message);
    }

    return res.status(200).json({
      success:     true,
      meetingId,
      pdfPath:     pdfUrl,
      summary,
      subtitles,
      aiGenerated: saved.aiGenerated,
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate summary" });
  }
};

// ─────────────────────────────────────────────────────────────
// DOWNLOAD PDF  —  GET /api/v1/summary/download/:meetingId
//
// Works for ALL summaries — old and new — even if the file on
// disk is missing. Regenerates from MongoDB data on-the-fly,
// then caches it to disk so future downloads are instant.
// ─────────────────────────────────────────────────────────────
export const downloadSummaryPdf = async (req, res) => {
  try {
    const { meetingId } = req.params;

    // Fetch full record (including transcript which getSummaries excludes)
    const summary = await MeetingSummary.findOne({ meetingId });
    if (!summary) {
      return res.status(404).json({ success: false, message: "Summary not found." });
    }

    const safeTitle = (summary.meetingTitle || "summary").replace(/[^a-z0-9\s_-]/gi, "_");

    // ── Try reading cached file from disk first ───────────────
    if (summary.pdfPath) {
      const fileName = path.basename(summary.pdfPath); // works for both /summaries/x.pdf and any format
      const diskPath = path.join(__dirname, "../../public/summaries", fileName);
      if (fs.existsSync(diskPath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.pdf"`);
        return fs.createReadStream(diskPath).pipe(res);
      }
    }

    // ── File missing → regenerate from DB on-the-fly ─────────
    console.log(`[PDF] Disk file missing for "${meetingId}" — regenerating from DB`);

    const pdfBytes = await generateSummaryPdf({
      title:     summary.meetingTitle || "Class Summary",
      date:      new Date(summary.createdAt).toLocaleDateString(),
      fullText:  summary.transcript || "",
      summary:   summary.summary    || "",
      subtitles: summary.subtitles  || "",
    });

    // Cache to disk so the next download is instant
    try {
      const pdfDir   = path.join(__dirname, "../../public/summaries");
      fs.mkdirSync(pdfDir, { recursive: true });
      const fileName = `${meetingId.replace(/[^a-z0-9_-]/gi, "_")}.pdf`;
      const diskPath = path.join(pdfDir, fileName);
      fs.writeFileSync(diskPath, pdfBytes);
      // Update the DB record with the correct path
      await MeetingSummary.updateOne(
        { meetingId },
        { pdfPath: `/summaries/${fileName}` }
      );
    } catch (cacheErr) {
      console.error("[PDF] Cache to disk failed (non-fatal):", cacheErr.message);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.pdf"`);
    res.end(Buffer.from(pdfBytes)); // pdfBytes is Uint8Array from pdf-lib
  } catch (error) {
    console.error("downloadSummaryPdf:", error);
    return res.status(500).json({ success: false, message: "Failed to generate PDF." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET SUMMARIES
// Instructors → only their own | Students → all (not deleted)
// ─────────────────────────────────────────────────────────────
export const getSummaries = async (req, res) => {
  try {
    const userId = req.id;
    const user   = await User.findById(userId).select("role");

    const query = { deletedByCreator: { $ne: true } };
    if (user?.role === "instructor") {
      query.generatedBy = userId;
    }

    const summaries = await MeetingSummary.find(query)
      .populate("generatedBy", "name photoUrl role")
      .sort({ createdAt: -1 })
      .select("-transcript");

    return res.status(200).json({ success: true, summaries });
  } catch (error) {
    console.error("getSummaries:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch summaries" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET SUMMARY BY ID
// ─────────────────────────────────────────────────────────────
export const getSummaryById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const summary = await MeetingSummary.findOne({ meetingId }).populate("generatedBy", "name photoUrl");
    if (!summary) return res.status(404).json({ success: false, message: "Summary not found" });
    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE SUMMARY  (instructor only)
// ─────────────────────────────────────────────────────────────
export const deleteSummary = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const user = await User.findById(req.id).select("role");

    if (user?.role !== "instructor") {
      return res.status(403).json({ success: false, message: "Only instructors can delete summaries" });
    }

    const summary = await MeetingSummary.findOne({ meetingId });
    if (!summary) return res.status(404).json({ success: false, message: "Summary not found" });
    if (summary.generatedBy?.toString() !== req.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own summaries" });
    }

    // Delete PDF file from disk if present
    if (summary.pdfPath) {
      try {
        const fileName = path.basename(summary.pdfPath);
        const filePath = path.join(__dirname, "../../public/summaries", fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (fileErr) {
        console.error("PDF file delete failed (non-fatal):", fileErr.message);
      }
    }

    await MeetingSummary.findOneAndUpdate(
      { meetingId },
      { deletedByCreator: true, deletedAt: new Date() }
    );

    return res.status(200).json({ success: true, message: "Summary deleted successfully" });
  } catch (error) {
    console.error("deleteSummary:", error);
    return res.status(500).json({ success: false, message: "Failed to delete summary" });
  }
};