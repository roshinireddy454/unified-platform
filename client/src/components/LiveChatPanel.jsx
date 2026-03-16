import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { MessageSquare, Send, X, Trash2, ShieldOff, Shield, Loader, WifiOff } from "lucide-react";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────────
function timeLabel(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function roleBadge(role) {
  if (role === "instructor")
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold uppercase tracking-wide flex-shrink-0">
        Host
      </span>
    );
  return null;
}

// ── Single message bubble ─────────────────────────────────────
function MessageBubble({ msg, isOwn, isInstructor, onDelete }) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Avatar — only shown for other people's messages */}
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-azure-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
          {msg.senderPhoto ? (
            <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-azure-300">
              {msg.senderName?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name + role badge */}
        {!isOwn && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[11px] font-medium text-white/60">{msg.senderName}</span>
            {roleBadge(msg.senderRole)}
          </div>
        )}

        <div className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words max-w-full ${
              isOwn
                ? "bg-azure-600 text-white rounded-tr-sm"
                : msg.senderRole === "instructor"
                ? "bg-amber-500/15 border border-amber-500/20 text-white/90 rounded-tl-sm"
                : "bg-white/8 text-white/85 rounded-tl-sm"
            }`}
          >
            {msg.message}
          </div>

          {/* Delete button */}
          {(isOwn || isInstructor) && hovering && (
            <button
              onClick={() => onDelete(msg._id)}
              className="p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400/70 hover:text-rose-400 transition-all flex-shrink-0 mb-0.5"
              title="Delete message"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>

        <span className="text-[10px] text-white/20 px-1">{timeLabel(msg.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function LiveChatPanel({ meetingId, user, socket, isInstructor, onClose }) {
  const [messages,     setMessages]     = useState([]);
  const [inputValue,   setInputValue]   = useState("");
  const [loading,      setLoading]      = useState(true);
  const [sending,      setSending]      = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);
  const [togglingChat, setTogglingChat] = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [socketReady,  setSocketReady]  = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const panelOpen  = useRef(true);

  // ── Compute my ID robustly ────────────────────────────────
  const myId = user?._id?.toString() || user?.id?.toString() || "";

  // ── Load chat history on mount ────────────────────────────
  useEffect(() => {
    panelOpen.current = true;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/v1/chat/${meetingId}`, { withCredentials: true });
        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        // Don't show error toast — silent fail is better UX
      } finally {
        setLoading(false);
      }
    };

    loadHistory();

    return () => { panelOpen.current = false; };
  }, [meetingId]);

  // ── Join socket room and listen for events ────────────────
  useEffect(() => {
    if (!socket) {
      setSocketReady(false);
      return;
    }

    // Join the chat room for this meeting
    socket.emit("join-chat-room", { meetingId });
    setSocketReady(true);

    // New message received
    const onMessage = (msg) => {
      setMessages((prev) => {
        // Deduplicate: ignore if we already have this message
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // If panel is open, unread count stays 0 (auto-scroll handles it)
      if (!panelOpen.current) {
        setUnreadCount((c) => c + 1);
      }
    };

    // A message was deleted
    const onDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    // Chat enabled/disabled by instructor
    const onToggled = ({ chatDisabled: disabled }) => {
      setChatDisabled(disabled);
      toast(
        disabled ? "🔇 Chat has been disabled by the host." : "💬 Chat has been re-enabled.",
        { duration: 3000 }
      );
    };

    // Error sending a message
    const onError = ({ message }) => {
      toast.error(message || "Chat error occurred.");
      setSending(false);
    };

    socket.on("chat-message",         onMessage);
    socket.on("chat-message-deleted", onDeleted);
    socket.on("chat-toggled",         onToggled);
    socket.on("chat-error",           onError);

    return () => {
      socket.off("chat-message",         onMessage);
      socket.off("chat-message-deleted", onDeleted);
      socket.off("chat-toggled",         onToggled);
      socket.off("chat-error",           onError);
      socket.emit("leave-chat-room", { meetingId });
      setSocketReady(false);
    };
  }, [socket, meetingId]);

  // ── Auto-scroll to latest message ────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages]);

  // ── Send message ──────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || sending) return;
    if (chatDisabled && !isInstructor) {
      toast.error("Chat has been disabled by the host.");
      return;
    }

    setSending(true);
    setInputValue("");

    // PRIMARY PATH: send via socket (fast, real-time)
    if (socket && socket.connected) {
      socket.emit("chat-send", {
        meetingId,
        message: text,
        sender: {
          id:    myId,
          name:  user?.name  || "Unknown",
          role:  user?.role  || "student",
          photo: user?.photoUrl || "",
        },
      });
      setSending(false);
      inputRef.current?.focus();
      return;
    }

    // FALLBACK PATH: send via HTTP if socket is not connected
    try {
      const { data } = await axios.post(
        `/api/v1/chat/${meetingId}`,
        { message: text },
        { withCredentials: true }
      );
      if (data.success) {
        // Add to local state immediately (socket will deduplicate if it arrives too)
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
      setInputValue(text); // Restore on failure so user doesn't lose their message
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [inputValue, sending, chatDisabled, isInstructor, socket, meetingId, myId, user]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Delete message ────────────────────────────────────────
  const handleDelete = async (messageId) => {
    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    try {
      await axios.delete(`/api/v1/chat/${messageId}`, { withCredentials: true });
    } catch {
      toast.error("Failed to delete message.");
      // Re-fetch to restore state
      try {
        const { data } = await axios.get(`/api/v1/chat/${meetingId}`, { withCredentials: true });
        setMessages(data.messages || []);
      } catch {}
    }
  };

  // ── Toggle chat (instructor only) ────────────────────────
  const handleToggleChat = async () => {
    setTogglingChat(true);
    try {
      const { data } = await axios.patch(
        `/api/v1/chat/${meetingId}/toggle-chat`,
        {},
        { withCredentials: true }
      );
      if (data.success) setChatDisabled(data.chatDisabled);
    } catch {
      toast.error("Failed to toggle chat.");
    } finally {
      setTogglingChat(false);
    }
  };

  const canType = !chatDisabled || isInstructor;

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      className="absolute right-4 top-16 z-30 w-80 bg-navy-900/97 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 130px)", maxHeight: "600px" }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-azure-400" />
          <span className="text-sm font-semibold text-white">Live Chat</span>

          {unreadCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-azure-500/20 text-azure-400 border border-azure-500/30">
              {unreadCount} new
            </span>
          )}

          {chatDisabled && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
              Disabled
            </span>
          )}

          {/* Socket disconnected indicator */}
          {!socketReady && (
            <span title="Socket disconnected — using HTTP fallback">
              <WifiOff size={12} className="text-amber-400/60" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isInstructor && (
            <button
              onClick={handleToggleChat}
              disabled={togglingChat}
              title={chatDisabled ? "Enable chat" : "Disable chat for students"}
              className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
                chatDisabled
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-rose-500/10 text-rose-400/70 hover:bg-rose-500/20 hover:text-rose-400"
              }`}
            >
              {togglingChat
                ? <Loader size={13} className="animate-spin" />
                : chatDisabled
                ? <Shield size={13} />
                : <ShieldOff size={13} />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Message List ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {loading ? (
          /* Loading skeleton */
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                <div className="w-7 h-7 rounded-full bg-white/5 flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className={`h-3 bg-white/5 rounded w-20 ${i % 2 === 0 ? "ml-auto" : ""}`} />
                  <div className={`h-9 bg-white/5 rounded-2xl w-48 ${i % 2 === 0 ? "ml-auto" : ""}`} />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center pb-4">
            <div className="w-12 h-12 rounded-2xl bg-azure-500/10 flex items-center justify-center mb-3">
              <MessageSquare size={20} className="text-azure-400/50" />
            </div>
            <p className="text-white/30 text-sm">No messages yet</p>
            <p className="text-white/15 text-xs mt-1">Be the first to say something!</p>
          </div>
        ) : (
          /* Messages */
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isOwn={msg.sender === myId || msg.sender?.toString() === myId}
              isInstructor={isInstructor}
              onDelete={handleDelete}
            />
          ))
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Chat disabled banner ─────────────────────────── */}
      {chatDisabled && !isInstructor && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 text-center flex-shrink-0">
          Chat has been disabled by the host.
        </div>
      )}

      {/* ── Input area ──────────────────────────────────── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-white/5">
        <div
          className={`flex items-end gap-2 bg-navy-800/60 border rounded-xl px-3 py-2 transition-all ${
            !canType
              ? "border-white/5 opacity-50"
              : "border-white/10 focus-within:border-azure-500/50"
          }`}
        >
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!canType ? "Chat disabled" : "Type a message… (Enter to send)"}
            disabled={!canType || sending}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none resize-none max-h-24 leading-relaxed disabled:cursor-not-allowed"
            style={{ fieldSizing: "content" }}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending || !canType}
            className="w-8 h-8 rounded-lg bg-azure-600 hover:bg-azure-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all"
          >
            {sending
              ? <Loader size={14} className="animate-spin text-white" />
              : <Send size={14} className="text-white" />}
          </button>
        </div>
        <p className="text-[10px] text-white/15 text-center mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}