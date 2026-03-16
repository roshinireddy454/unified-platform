import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Bot, Send, Trash2, BookOpen, GraduationCap, Sparkles } from "lucide-react";

const STARTER_PROMPTS = {
  instructor: [
    "Help me create a lesson plan for React hooks",
    "What are effective ways to assess student understanding?",
    "How do I make my online course more engaging?",
    "Suggest 5 quiz questions on JavaScript fundamentals",
  ],
  student: [
    "Explain closures in JavaScript with an example",
    "How do I prepare for a technical interview?",
    "What's the difference between SQL and NoSQL?",
    "Give me tips to stay focused while studying online",
  ],
};

export default function ChatbotPage() {
  const { user } = useAuth();
  const role = user?.role || "student";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setError("");
    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // All API calls go through our backend — uses server-side GEMINI_API_KEY
      const { data } = await axios.post(
        "/api/v1/chatbot/chat",
        { messages: newMessages, role },
        { withCredentials: true }
      );

      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
      } else {
        setError(data.message || "Something went wrong");
        setMessages((prev) => prev.slice(0, -1)); // remove user message on error
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to connect to AI. Please try again.";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-azure-500/20 border border-purple-500/20 flex items-center justify-center">
            <Bot size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              AI Assistant
              <span className="flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Sparkles size={9} /> Gemini
              </span>
            </h1>
            <p className="text-white/35 text-xs">
              {role === "instructor"
                ? "Teaching & content creation assistant"
                : "Personal study & learning assistant"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={13} /> Clear chat
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto card p-4 space-y-4 mb-4">
        {/* Welcome / empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-azure-500/20 border border-purple-500/20 flex items-center justify-center mb-4">
              {role === "instructor"
                ? <GraduationCap size={30} className="text-azure-400" />
                : <BookOpen size={30} className="text-azure-400" />
              }
            </div>
            <h2 className="font-display text-lg font-semibold text-white mb-2">
              Hi, {user?.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-6">
              {role === "instructor"
                ? "I can help you create course content, lesson plans, assessments, and more."
                : "I can explain concepts, answer questions from your courses, and help with studying."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_PROMPTS[role].map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-left px-4 py-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 hover:border-white/12 text-white/60 hover:text-white text-xs transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
              msg.role === "user"
                ? "bg-azure-500/20 text-azure-400"
                : "bg-purple-500/20 text-purple-400"
            }`}>
              {msg.role === "user"
                ? (user?.photoUrl
                    ? <img src={user.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    : user?.name?.[0]?.toUpperCase())
                : <Bot size={14} />
              }
            </div>
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-azure-600/30 text-white rounded-tr-sm"
                : "bg-white/5 text-white/80 rounded-tl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-purple-400" />
            </div>
            <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-md p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex gap-3">
        <input
          ref={inputRef}
          className="input flex-1 text-sm py-3"
          placeholder={
            role === "instructor"
              ? "Ask about lesson planning, content creation, teaching tips…"
              : "Ask about your courses, study tips, or any concept…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-primary px-4 py-3 flex items-center gap-2 disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}