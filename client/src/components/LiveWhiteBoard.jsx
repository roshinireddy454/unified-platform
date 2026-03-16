/**
 * LiveWhiteboard.jsx — Fixed
 *
 * Real-time fixes applied:
 * 1. wb-request-sync: when a student opens the whiteboard, server sends
 *    "wb-request-sync" to the instructor. Instructor responds with full
 *    canvas state so the student sees it immediately.
 * 2. handleToggleStudents: now also emits wb-permission via socket
 *    directly for instant propagation (no DB round-trip delay).
 * 3. All other events unchanged.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X, Pencil, Eraser, Trash2, Download, Save,
  Square, Circle, Minus, Type, Palette,
  MousePointer, Users, Loader, ChevronDown,
  Lock, Unlock,
} from "lucide-react";

const COLORS = [
  "#FFFFFF", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
  "#000000", "#6B7280",
];
const BRUSH_SIZES = [2, 4, 8, 14, 22];

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

function ToolBtn({ active, onClick, title, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed
        ${active
          ? "bg-azure-600 text-white shadow-lg shadow-azure-600/30"
          : "bg-white/8 text-white/60 hover:bg-white/15 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

export default function LiveWhiteboard({ meetingId, isInstructor, socket, onClose }) {
  const canvasRef       = useRef(null);
  const overlayRef      = useRef(null);
  const isDrawing       = useRef(false);
  const lastPos         = useRef({ x: 0, y: 0 });
  const currentPath     = useRef([]);
  const snapshotRef     = useRef(null);
  const pointerTimerRef = useRef(null);

  const [tool,       setTool]       = useState("pen");
  const [color,      setColor]      = useState("#FFFFFF");
  const [brushSize,  setBrushSize]  = useState(4);
  const [showColors, setShowColors] = useState(false);
  const [showSizes,  setShowSizes]  = useState(false);
  const [studentAllowed, setStudentAllowed] = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [remotePointer,  setRemotePointer]  = useState(null);
  const [textInput,      setTextInput]      = useState(null);
  const textRef = useRef(null);

  const canDraw = isInstructor || studentAllowed;

  const getCtx = () => canvasRef.current?.getContext("2d");

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const setupCtx = useCallback((ctx, opts = {}) => {
    ctx.lineJoin    = "round";
    ctx.lineCap     = "round";
    ctx.strokeStyle = opts.color     ?? color;
    ctx.lineWidth   = opts.brushSize ?? brushSize;
    ctx.globalCompositeOperation =
      opts.eraser || tool === "eraser" ? "destination-out" : "source-over";
  }, [color, brushSize, tool]);

  const resizeCanvas = useCallback(() => {
    const canvas    = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    const snapshot  = canvas.toDataURL();
    canvas.width    = container.clientWidth;
    canvas.height   = container.clientHeight;
    const img = new Image();
    img.onload = () => getCtx()?.drawImage(img, 0, 0);
    img.src = snapshot;
  }, []);

  // ── Serialize / restore ──────────────────────────────────
  const serializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return "{}";
    return JSON.stringify({ dataURL: canvas.toDataURL("image/png") });
  };

  const restoreFromJSON = (json) => {
    try {
      const obj = JSON.parse(json);
      if (!obj?.dataURL) return;
      const img = new Image();
      img.onload = () => {
        const ctx = getCtx();
        if (ctx) ctx.drawImage(img, 0, 0);
      };
      img.src = obj.dataURL;
    } catch {}
  };

  // ── Init ─────────────────────────────────────────────────
  useEffect(() => {
    socket?.emit("wb-join", { meetingId });

    const load = async () => {
      try {
        const { data } = await axios.get(`/api/v1/whiteboard/${meetingId}`, { withCredentials: true });
        if (data.whiteboard?.canvasJSON && data.whiteboard.canvasJSON !== "{}") {
          restoreFromJSON(data.whiteboard.canvasJSON);
        }
        setStudentAllowed(data.whiteboard?.studentDrawing ?? false);
      } catch {}
      finally { setLoading(false); }
    };
    load();

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      socket?.emit("wb-leave", { meetingId });
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [meetingId, socket]); // eslint-disable-line

  // ── Socket listeners ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onDraw = ({ type, data }) => applyRemoteDrawOp(type, data);

    const onSync = ({ canvasJSON }) => restoreFromJSON(canvasJSON);

    const onClear = () => {
      const ctx    = getCtx();
      const canvas = canvasRef.current;
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const onPermission = ({ studentDrawing }) => {
      setStudentAllowed(studentDrawing);
      toast(studentDrawing ? "✏️ Drawing enabled for everyone!" : "🔒 Drawing restricted to instructor.", { duration: 3000 });
    };

    const onPointer = ({ x, y, active }) => {
      if (!active) { setRemotePointer(null); return; }
      setRemotePointer({ x, y });
    };

    // FIX: When a student opens whiteboard, server asks instructor for a sync.
    // Instructor receives "wb-request-sync" and responds with current canvas state.
    const onRequestSync = ({ meetingId: mid }) => {
      if (!isInstructor) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      socket.emit("wb-sync", { meetingId: mid, canvasJSON: serializeCanvas() });
    };

    socket.on("wb-draw",          onDraw);
    socket.on("wb-sync",          onSync);
    socket.on("wb-clear",         onClear);
    socket.on("wb-permission",    onPermission);
    socket.on("wb-pointer",       onPointer);
    socket.on("wb-request-sync",  onRequestSync); // ← NEW

    return () => {
      socket.off("wb-draw",         onDraw);
      socket.off("wb-sync",         onSync);
      socket.off("wb-clear",        onClear);
      socket.off("wb-permission",   onPermission);
      socket.off("wb-pointer",      onPointer);
      socket.off("wb-request-sync", onRequestSync); // ← NEW
    };
  }, [socket, isInstructor]); // eslint-disable-line

  // ── Apply remote draw op ─────────────────────────────────
  const applyRemoteDrawOp = (type, data) => {
    const ctx = getCtx();
    if (!ctx) return;

    if (type === "stroke") {
      const { points, color: c, brushSize: bs, eraser } = data;
      if (!points || points.length < 2) return;
      ctx.save();
      setupCtx(ctx, { color: c, brushSize: bs, eraser });
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
      ctx.restore();
    }
    if (type === "line") {
      const { from, to, color: c, brushSize: bs } = data;
      ctx.save(); setupCtx(ctx, { color: c, brushSize: bs });
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      ctx.restore();
    }
    if (type === "rect") {
      const { x, y, w, h, color: c, brushSize: bs } = data;
      ctx.save(); setupCtx(ctx, { color: c, brushSize: bs });
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
    if (type === "circle") {
      const { cx, cy, rx, ry, color: c, brushSize: bs } = data;
      ctx.save(); setupCtx(ctx, { color: c, brushSize: bs });
      ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    if (type === "text") {
      const { x, y, text, color: c, fontSize } = data;
      ctx.save(); ctx.fillStyle = c; ctx.font = `${fontSize}px sans-serif`; ctx.fillText(text, x, y);
      ctx.restore();
    }
  };

  // ── Pointer events ───────────────────────────────────────
  const startDraw = (e) => {
    if (!canDraw) return;
    if (tool === "pointer") return;
    if (tool === "text") { handleTextClick(e); return; }
    const pos = getPos(e);
    isDrawing.current   = true;
    lastPos.current     = pos;
    currentPath.current = [pos];
    const ctx = getCtx();
    if (!ctx) return;
    ctx.save(); setupCtx(ctx); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    if (["line", "rect", "circle"].includes(tool)) {
      snapshotRef.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    ctx.restore();
  };

  const draw = useCallback((e) => {
    if (!isDrawing.current || !canDraw) return;
    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx) return;

    if (tool === "pen" || tool === "eraser") {
      ctx.save(); setupCtx(ctx);
      ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.restore();
      currentPath.current.push(pos);
      emitDrawThrottled(pos);
    }

    if (["line", "rect", "circle"].includes(tool)) {
      if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.save(); setupCtx(ctx); drawShape(ctx, tool, lastPos.current, pos); ctx.restore();
    }

    lastPos.current = pos;
  }, [canDraw, tool, setupCtx]); // eslint-disable-line

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emitDrawThrottled = useCallback(
    throttle((pos) => {
      if (!socket) return;
      socket.emit("wb-draw", {
        meetingId,
        type: "partial",
        data: { from: lastPos.current, to: pos, color, brushSize, eraser: tool === "eraser" },
      });
    }, 30),
    [socket, meetingId, color, brushSize, tool]
  );

  const stopDraw = (e) => {
    if (!isDrawing.current || !canDraw) return;
    isDrawing.current = false;
    const pos = getPos(e);
    const ctx = getCtx();

    if (tool === "pen" || tool === "eraser") {
      socket?.emit("wb-draw", {
        meetingId,
        type: "stroke",
        data: { points: currentPath.current, color, brushSize, eraser: tool === "eraser" },
      });
      currentPath.current = [];
    }

    if (["line", "rect", "circle"].includes(tool)) {
      if (ctx && snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
        ctx.save(); setupCtx(ctx); drawShape(ctx, tool, lastPos.current, pos); ctx.restore();
      }
      const opType = tool;
      const from   = lastPos.current;
      let opData = {};
      if (opType === "line")   opData = { from, to: pos, color, brushSize };
      if (opType === "rect")   opData = { x: Math.min(from.x, pos.x), y: Math.min(from.y, pos.y), w: Math.abs(pos.x - from.x), h: Math.abs(pos.y - from.y), color, brushSize };
      if (opType === "circle") opData = { cx: (from.x + pos.x) / 2, cy: (from.y + pos.y) / 2, rx: Math.abs(pos.x - from.x) / 2, ry: Math.abs(pos.y - from.y) / 2, color, brushSize };
      socket?.emit("wb-draw", { meetingId, type: opType, data: opData });
      snapshotRef.current = null;
    }
  };

  const drawShape = (ctx, type, from, to) => {
    if (type === "line") {
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    }
    if (type === "rect") {
      ctx.strokeRect(Math.min(from.x, to.x), Math.min(from.y, to.y), Math.abs(to.x - from.x), Math.abs(to.y - from.y));
    }
    if (type === "circle") {
      ctx.beginPath();
      ctx.ellipse((from.x + to.x) / 2, (from.y + to.y) / 2, Math.abs(to.x - from.x) / 2, Math.abs(to.y - from.y) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const handleTextClick = (e) => {
    const pos = getPos(e);
    setTextInput(pos);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const commitText = (text) => {
    if (!text?.trim()) { setTextInput(null); return; }
    const ctx = getCtx();
    if (ctx) {
      const fontSize = brushSize * 5 + 8;
      ctx.save(); ctx.fillStyle = color; ctx.font = `${fontSize}px sans-serif`; ctx.fillText(text, textInput.x, textInput.y); ctx.restore();
      socket?.emit("wb-draw", { meetingId, type: "text", data: { x: textInput.x, y: textInput.y, text, color, fontSize } });
    }
    setTextInput(null);
  };

  const handlePointerMove = useCallback((e) => {
    if (tool !== "pointer" || !socket) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    socket.emit("wb-pointer", { meetingId, x, y, active: true });
    clearTimeout(pointerTimerRef.current);
    pointerTimerRef.current = setTimeout(() => {
      socket.emit("wb-pointer", { meetingId, x, y, active: false });
    }, 2000);
  }, [tool, socket, meetingId]);

  const handleClear = () => {
    if (!isInstructor) return;
    const ctx    = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit("wb-clear", { meetingId });
    toast.success("Board cleared.");
  };

  const handleSave = async () => {
    setSaving(true);
    const canvas    = canvasRef.current;
    const thumbnail = canvas?.toDataURL("image/png") || "";
    try {
      await axios.post(
        `/api/v1/whiteboard/${meetingId}/save`,
        { canvasJSON: serializeCanvas(), thumbnail },
        { withCredentials: true }
      );
      toast.success("Whiteboard saved!");
    } catch {
      toast.error("Failed to save whiteboard.");
    } finally { setSaving(false); }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link    = document.createElement("a");
    link.download = `whiteboard-${meetingId}-${Date.now()}.png`;
    link.href     = canvas.toDataURL("image/png");
    link.click();
    toast.success("Image downloaded!");
  };

  // FIX: emit socket event immediately so all students see permission change
  // without waiting for HTTP round-trip
  const handleToggleStudents = async () => {
    const newVal = !studentAllowed;
    setStudentAllowed(newVal); // optimistic
    // Emit via socket first for instant effect
    socket?.emit("wb-permission", { meetingId, studentDrawing: newVal });
    // Also persist to DB
    try {
      await axios.patch(
        `/api/v1/whiteboard/${meetingId}/permissions`,
        { studentDrawing: newVal },
        { withCredentials: true }
      );
      toast.success(newVal ? "Students can now draw!" : "Student drawing disabled.");
    } catch {
      setStudentAllowed(!newVal); // rollback on error
      toast.error("Failed to update permissions.");
    }
  };

  const cursorStyle = () => {
    if (!canDraw)             return "default";
    if (tool === "pointer")   return "crosshair";
    if (tool === "eraser")    return "cell";
    if (tool === "text")      return "text";
    return "crosshair";
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-navy-950/97 backdrop-blur-md">

      {/* ── Top toolbar ────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-navy-900/90 border-b border-white/8 flex-wrap">

        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-azure-600 flex items-center justify-center">
            <Pencil size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white hidden sm:block">Whiteboard</span>
          {!isInstructor && !studentAllowed && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">View only</span>
          )}
        </div>

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {[
          { id: "pen",     icon: <Pencil      size={15} />, title: "Pen"           },
          { id: "eraser",  icon: <Eraser      size={15} />, title: "Eraser"        },
          { id: "line",    icon: <Minus       size={15} />, title: "Line"          },
          { id: "rect",    icon: <Square      size={15} />, title: "Rectangle"     },
          { id: "circle",  icon: <Circle      size={15} />, title: "Circle"        },
          { id: "text",    icon: <Type        size={15} />, title: "Text"          },
          { id: "pointer", icon: <MousePointer size={15} />, title: "Laser pointer" },
        ].map(({ id, icon, title }) => (
          <ToolBtn key={id} active={tool === id} onClick={() => setTool(id)} title={title} disabled={!canDraw && id !== "pointer"}>
            {icon}
          </ToolBtn>
        ))}

        <div className="w-px h-6 bg-white/10" />

        {/* Color */}
        <div className="relative">
          <button
            onClick={() => { setShowColors((s) => !s); setShowSizes(false); }}
            title="Color"
            className="w-9 h-9 rounded-xl border-2 border-white/20 hover:border-white/40 transition-all overflow-hidden flex-shrink-0"
            style={{ background: color }}
          />
          {showColors && (
            <div className="absolute top-11 left-0 z-10 p-2 bg-navy-900/98 border border-white/10 rounded-2xl shadow-2xl grid grid-cols-5 gap-1.5 w-44">
              {COLORS.map((c) => (
                <button key={c} onClick={() => { setColor(c); setShowColors(false); }}
                  className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${color === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
              <div className="col-span-5 mt-1">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full h-7 rounded-lg cursor-pointer bg-transparent border border-white/10" />
              </div>
            </div>
          )}
        </div>

        {/* Brush size */}
        <div className="relative">
          <button onClick={() => { setShowSizes((s) => !s); setShowColors(false); }} title="Brush size"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white text-xs transition-all">
            <span className="w-4 h-4 flex items-center justify-center">
              <span className="rounded-full bg-white/60" style={{ width: brushSize, height: brushSize }} />
            </span>
            <ChevronDown size={10} />
          </button>
          {showSizes && (
            <div className="absolute top-11 left-0 z-10 p-2 bg-navy-900/98 border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-2 w-32">
              {BRUSH_SIZES.map((s) => (
                <button key={s} onClick={() => { setBrushSize(s); setShowSizes(false); }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${brushSize === s ? "bg-azure-600/30 text-azure-400" : "text-white/50 hover:bg-white/8"}`}>
                  <span className="rounded-full bg-current flex-shrink-0" style={{ width: Math.min(s, 18), height: Math.min(s, 18) }} />
                  <span className="text-xs">{s}px</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/10" />

        {isInstructor && (
          <>
            <ToolBtn onClick={handleClear} title="Clear board"><Trash2 size={15} /></ToolBtn>

            <button
              onClick={handleToggleStudents}
              title={studentAllowed ? "Disable student drawing" : "Allow student drawing"}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                studentAllowed
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {studentAllowed ? <><Unlock size={12} /> Students On</> : <><Lock size={12} /> Students Off</>}
            </button>

            <div className="w-px h-6 bg-white/10" />

            <button onClick={handleSave} disabled={saving} title="Save to server"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-azure-600/80 hover:bg-azure-500 text-white transition-all disabled:opacity-60">
              {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
              Save
            </button>
          </>
        )}

        <button onClick={handleDownload} title="Download as PNG"
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/50 hover:text-white transition-all">
          <Download size={12} /> Export
        </button>

        <button onClick={onClose}
          className="ml-auto p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Close whiteboard">
          <X size={16} />
        </button>
      </div>

      {/* ── Canvas area ─────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-[#1a1f2e]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-azure-500/30 border-t-azure-500 animate-spin" />
              <p className="text-white/40 text-sm">Loading whiteboard…</p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: cursorStyle(), touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={(e) => { draw(e); handlePointerMove(e); }}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={(e) => { e.preventDefault(); startDraw(e); }}
          onTouchMove={(e)  => { e.preventDefault(); draw(e); }}
          onTouchEnd={(e)   => { e.preventDefault(); stopDraw(e); }}
        />

        {remotePointer && (
          <div
            className="absolute pointer-events-none z-20 transition-all duration-75"
            style={{ left: `${remotePointer.x}%`, top: `${remotePointer.y}%`, transform: "translate(-50%,-50%)" }}
          >
            <div className="w-5 h-5 rounded-full bg-rose-500/40 border-2 border-rose-500 animate-pulse shadow-lg shadow-rose-500/50" />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-rose-400 whitespace-nowrap bg-navy-900/80 px-1 py-0.5 rounded">
              Instructor
            </div>
          </div>
        )}

        {textInput && (
          <input
            ref={textRef}
            autoFocus
            placeholder="Type and press Enter"
            style={{
              position: "absolute", left: textInput.x, top: textInput.y - 24,
              color, fontSize: `${brushSize * 5 + 8}px`, background: "transparent",
              border: "none", outline: "2px dashed rgba(255,255,255,0.3)",
              borderRadius: "4px", padding: "2px 6px", fontFamily: "sans-serif",
              minWidth: "80px", zIndex: 30,
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText(e.target.value);
              if (e.key === "Escape") setTextInput(null);
            }}
            onBlur={(e) => commitText(e.target.value)}
          />
        )}

        {!canDraw && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 text-xs text-center pointer-events-none">
            The instructor controls this whiteboard
          </div>
        )}
        {canDraw && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/15 text-xs text-center pointer-events-none">
            {tool === "text" ? "Click anywhere to place text" : `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool active`}
          </div>
        )}
      </div>
    </div>
  );
}
