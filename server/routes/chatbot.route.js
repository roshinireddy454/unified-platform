import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// List of free models to try in order (first one that works will be used)
const FREE_MODELS = [
  "meta-llama/llama-4-maverick:free",      // Current top performer [citation:5]
  "meta-llama/llama-4-scout:free",          // Alternative with longer context [citation:5]
  "moonshotai/kimi-vl-a3b-thinking:free",   // Lightweight option [citation:2]
  "google/gemini-2.5-pro-exp-03-25:free",   // Experimental [citation:5]
  "arcee-ai/trinity-large-preview:free",    // Creative tasks [citation:2]
  "stepfun/step-3.5-flash:free",            // Fast option [citation:2]
];

router.post("/chat", isAuthenticated, async (req, res) => {
  try {
    const { messages, role } = req.body;
    
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterKey) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key not configured. Get a free key at https://openrouter.ai/",
      });
    }

    const systemPrompt =
      role === "instructor"
        ? "You are an AI teaching assistant helping instructors create lessons, quizzes, and course content. Be concise and practical."
        : "You are an AI study assistant helping students understand concepts, solve problems, and prepare for exams. Be encouraging and clear.";

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.text,
      })),
    ];

    // Try models in order until one works
    let lastError = null;
    for (const model of FREE_MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
            "X-Title": "LearnSphere LMS",
          },
          body: JSON.stringify({
            model: model,
            messages: chatMessages,
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.warn(`Model ${model} failed:`, data.error?.message);
          lastError = data.error?.message;
          continue; // Try next model
        }

        const text = data?.choices?.[0]?.message?.content?.trim();

        if (text) {
          return res.status(200).json({ success: true, text, model });
        }
      } catch (err) {
        console.warn(`Error with model ${model}:`, err.message);
        lastError = err.message;
      }
    }

    // If all models failed
    return res.status(500).json({
      success: false,
      message: `All free models failed. Last error: ${lastError || "Unknown"}. You can check available free models at https://openrouter.ai/collections/free-models`,
    });
    
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      success: false,
      message: "Chatbot request failed: " + (error.message || "Unknown error"),
    });
  }
});

export default router;