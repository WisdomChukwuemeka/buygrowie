"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { toast.error("Please fill all fields"); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success("Message sent! We'll reply within 24hrs.");
    setForm({ name: "", email: "", message: "" });
    setSending(false);
  };

  return (
    <div className="min-h-screen pt-[68px]">
      <section className="px-6 py-20 max-w-xl mx-auto">
        <h1 className="text-5xl font-display font-black tracking-tighter mb-3">Get in touch</h1>
        <p className="text-secondary text-lg mb-12">Questions, partnerships, or just want to say hi — we're here.</p>

        <div className="flex flex-col gap-4 mb-6">
          {[
            { key: "name", placeholder: "Your name", type: "text" },
            { key: "email", placeholder: "Your email", type: "email" },
          ].map(({ key, placeholder, type }) => (
            <input key={key} type={type} placeholder={placeholder} value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full px-4 py-3.5 bg-elevated border border-border rounded-xl text-primary text-sm font-body outline-none transition-all focus:border-accent placeholder:text-muted"
            />
          ))}
          <textarea placeholder="Your message..." rows={6} value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            className="w-full px-4 py-3.5 bg-elevated border border-border rounded-xl text-primary text-sm font-body outline-none transition-all focus:border-accent placeholder:text-muted resize-y"
          />
        </div>

        <button onClick={handleSubmit} disabled={sending}
          className={`w-full py-4 rounded-xl font-display font-bold text-base border-none mb-12 transition-all ${
            sending ? "bg-elevated text-muted cursor-not-allowed" : "bg-accent text-bg cursor-pointer hover:bg-accent-dim"
          }`}>
          {sending ? "Sending..." : "Send Message →"}
        </button>

        <div className="p-7 bg-card border border-border rounded-xl">
          <div className="font-bold mb-4">Other ways to reach us</div>
          {[
            { icon: "📧", label: "Email", val: "hello@snapsearch.app" },
            { icon: "📍", label: "Location", val: "Port Harcourt, Nigeria" },
          ].map(({ icon, label, val }) => (
            <div key={label} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-lg">{icon}</span>
              <div>
                <div className="text-[10px] text-muted font-black tracking-widest uppercase">{label}</div>
                <div className="text-secondary text-sm">{val}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
