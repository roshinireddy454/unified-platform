import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Use auto-router for reliability
const FREE_MODELS = ["openrouter/free"];

router.post("/chat", isAuthenticated, async (req, res) => {
  try {
    const { messages, role } = req.body;
    
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterKey) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key not configured.",
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

    let lastError = null;
    
    for (const model of FREE_MODELS) {
      try {
        console.log(`Attempting model: ${model}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            // CRITICAL: These headers help OpenRouter identify your app
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
          console.warn(`Model ${model} failed:`, data);
          lastError = data.error?.message || `HTTP ${response.status}`;
          
          // If it's a 401, log more details
          if (response.status === 401) {
            console.error("Authentication failed. Check that your API key has the correct format and permissions.");
            console.error("API Key prefix:", openrouterKey.substring(0, 15) + "...");
          }
          continue;
        }

        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          console.log(`Successfully used model: ${model}`);
          return res.status(200).json({ success: true, text, model });
        }
      } catch (err) {
        console.error(`Error with model ${model}:`, err.message);
        lastError = err.message;
      }
    }

    return res.status(500).json({
      success: false,
      message: `Chatbot error: ${lastError || "Unknown"}`,
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