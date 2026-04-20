"use client";

import { useState } from "react";

export default function LearnFlow({ data, onBack }) {
  const [subOption, setSubOption] = useState(null);

  if (subOption === "history") return <InfoDisplay title="📜 Product History" content={data?.history} onBack={() => setSubOption(null)} />;
  if (subOption === "description") return <InfoDisplay title="🏷️ Product Description" content={data?.description} onBack={() => setSubOption(null)} />;
  if (subOption === "produce") return <ProduceDisplay data={data?.production} productName={data?.product_name} onBack={() => setSubOption(null)} />;

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-secondary mb-4 bg-transparent border-none cursor-pointer p-0 hover:text-primary transition-colors">
        ← Back to options
      </button>
      <h2 className="text-2xl font-display font-black tracking-tight mb-1.5">📖 Learn: {data?.product_name || "This Product"}</h2>
      <p className="text-secondary text-sm mb-8">Choose what you want to know</p>

      <div className="flex flex-col gap-3.5">
        {[
          { id: "history", emoji: "📜", label: "History", desc: "Full historical background of this product", color: "#c47a47" },
          { id: "description", emoji: "🏷️", label: "Description", desc: "Product label details, specs & composition", color: "#e8c547" },
          { id: "produce", emoji: "🌱", label: "Produce This Item", desc: "Accurate step-by-step guide to produce from scratch", color: "#47c47a" },
        ].map(({ id, emoji, label, desc, color }) => (
          <button key={id} onClick={() => setSubOption(id)}
            className="group p-5 bg-card border border-border rounded-[20px] cursor-pointer text-left flex items-center gap-4 transition-all duration-200 hover:bg-elevated hover:border-border-light">
            <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              {emoji}
            </div>
            <div>
              <div className="font-display font-bold text-base mb-0.5">{label}</div>
              <div className="text-xs text-secondary">{desc}</div>
            </div>
            <div className="ml-auto text-muted">→</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoDisplay({ title, content, onBack }) {
  if (!content) content = "Detailed information about this product will appear here based on AI analysis.";
  const paragraphs = typeof content === "string" ? content.split("\n\n").filter(Boolean) : [JSON.stringify(content)];

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-secondary mb-5 bg-transparent border-none cursor-pointer p-0 hover:text-primary transition-colors">
        ← Back to Learn options
      </button>
      <h2 className="text-2xl font-display font-black tracking-tight mb-6">{title}</h2>
      <div className="p-7 bg-card border border-border rounded-[20px]">
        {paragraphs.map((para, i) => (
          <p key={i} className={`text-secondary text-sm leading-relaxed ${i < paragraphs.length - 1 ? "mb-4" : ""}`}>{para}</p>
        ))}
      </div>
    </div>
  );
}

function ProduceDisplay({ data, productName, onBack }) {
  if (!data) return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-secondary mb-5 bg-transparent border-none cursor-pointer p-0">← Back</button>
      <div className="py-12 text-center text-secondary">Production guide not available for this product.</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-secondary mb-5 bg-transparent border-none cursor-pointer p-0 hover:text-primary transition-colors">
        ← Back to Learn options
      </button>
      <h2 className="text-2xl font-display font-black tracking-tight mb-1.5">🌱 How to Produce: {productName}</h2>
      <p className="text-secondary text-sm mb-7">Step-by-step guide from scratch to finished product</p>

      {data.overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          {Object.entries(data.overview).map(([key, val]) => (
            <div key={key} className="p-4 bg-card border border-border rounded-xl text-center">
              <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1.5">{key}</div>
              <div className="font-semibold text-sm">{val}</div>
            </div>
          ))}
        </div>
      )}

      {data.steps?.map((step, i) => (
        <div key={i} className="mb-4 p-5 bg-card border border-border rounded-xl grid gap-4 items-start"
          style={{ gridTemplateColumns: "48px 1fr" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-sm"
            style={{ background: "rgba(71,196,122,0.1)", border: "1px solid rgba(71,196,122,0.25)", color: "#47c47a" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <div className="font-bold text-sm mb-1.5">{step.title}</div>
            <div className="text-secondary text-xs leading-relaxed">{step.detail}</div>
            {step.timing && <div className="mt-2 text-xs text-accent font-semibold">⏱ {step.timing}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
