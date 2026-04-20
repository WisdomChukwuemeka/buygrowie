"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function OthersFlow({ data, imageBase64, onBack, userToken }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    const userMessage = { role: "user", content: prompt };
    setHistory(prev => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    try {
      const token = await userToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/ask/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, product_context: data?.product_name, image_base64: imageBase64, conversation_history: history }),
      });
      const result = await res.json();
      setHistory(prev => [...prev, { role: "assistant", content: result.answer }]);
    } catch { toast.error("Failed to get response. Try again."); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-secondary mb-4 bg-transparent border-none cursor-pointer p-0 hover:text-primary transition-colors">
        ← Back to options
      </button>
      <h2 className="text-2xl font-display font-black tracking-tight mb-1.5">💬 Ask Anything</h2>
      <p className="text-secondary text-sm mb-7">
        About: <strong className="text-primary">{data?.product_name || "This Product"}</strong> — ask freely, get accurate answers
      </p>

      {/* Chat history */}
      {history.length > 0 && (
        <div className="flex flex-col gap-3.5 mb-5 max-h-[480px] overflow-y-auto">
          {history.map((msg, i) => (
            <div key={i} className={`p-4 rounded-xl border text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-elevated border-border self-end max-w-[80%]"
                : "bg-card border-l-2 self-start w-full"
            }`}
            style={msg.role === "assistant" ? { borderLeftColor: "#e8c547" } : {}}>
              <div className="text-[10px] font-black tracking-wider text-muted mb-2">
                {msg.role === "user" ? "YOU" : "SNAPSEARCH AI"}
              </div>
              <div className="text-secondary whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="p-4 rounded-xl bg-card border border-l-2" style={{ borderLeftColor: "#e8c547" }}>
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"
                    style={{ animation: `pulse-dot 1.2s ${i * 0.2}s ease infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 p-4 bg-card border border-border rounded-[20px]">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Is this safe for children? Where is it made? What are cheaper alternatives?"
          rows={3}
          className="flex-1 resize-none bg-transparent border-none outline-none text-primary text-sm leading-relaxed font-body placeholder:text-muted"
        />
        <button onClick={handleSubmit} disabled={loading || !prompt.trim()}
          className={`self-end px-5 py-3 rounded-xl font-display font-bold text-sm border-none transition-all ${
            prompt.trim() && !loading
              ? "bg-accent text-bg cursor-pointer hover:bg-accent-dim"
              : "bg-elevated text-muted cursor-not-allowed"
          }`}>
          Ask →
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
