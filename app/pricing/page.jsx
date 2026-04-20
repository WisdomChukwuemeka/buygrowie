"use client";

import { useUser, useAuth, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import TokenGate from "../components/ui/TokenGate";

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [packs, setPacks] = useState([]);
  const [showTokenGate, setShowTokenGate] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    const fetchPacks = async () => {
      try {
        const token = await getToken({ skipCache: true });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens/balance/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data.pricing)) setPacks(data.pricing);
      } catch {
        // silently fail — static fallback packs shown below
      }
    };
    fetchPacks();
  }, [isSignedIn]);

  // Static fallback if not signed in or packs haven't loaded
  const displayPacks = packs.length > 0 ? packs : [
    { id: 1, tokens_per_pack: 2,  price_naira: "200",  label: "Starter Pack" },
    { id: 2, tokens_per_pack: 4,  price_naira: "400",  label: "Basic Pack" },
    { id: 4, tokens_per_pack: 12, price_naira: "1000", label: "Pro Pack" },
  ];

  const BADGES = [null, null, "POPULAR", "BEST VALUE"];

  const handleBuyClick = () => {
    if (isSignedIn) setShowTokenGate(true);
  };

  return (
    <div className="min-h-screen pt-[68px]">
      <section className="px-6 py-20 text-center">
        <div className="max-w-5xl mx-auto">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold text-accent mb-6"
            style={{ background: "rgba(232,197,71,0.08)", borderColor: "rgba(232,197,71,0.2)" }}
          >
            Simple, transparent pricing
          </div>

          <h1 className="text-5xl font-display font-black tracking-tighter mb-4">
            Token-based pricing
          </h1>
          <p className="text-secondary text-lg max-w-md mx-auto mb-16">
            Pay only for what you search. No subscriptions, no surprises.
          </p>

          {/* Free + Packs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">

            {/* Free card */}
            <div className="p-9 bg-card border border-border rounded-[20px] text-left">
              <div className="text-xs font-black tracking-widest text-muted mb-4">STARTER</div>
              <div className="text-5xl font-display font-black mb-1">Free</div>
              <div className="text-secondary text-sm mb-7">First search on us</div>
              <ul className="flex flex-col gap-3 mb-8">
                {["1 free image search", "All 3 query types", "No credit card needed", "Full AI analysis"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-secondary">
                    <span className="font-bold" style={{ color: "#47c47a" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              {isSignedIn ? (
                <button
                  onClick={() => router.push("/")}
                  className="w-full py-3.5 bg-elevated border border-border rounded-xl font-semibold text-primary cursor-pointer hover:border-border-light transition-all"
                >
                  Start Searching 
                </button>
              ) : (
                <SignUpButton mode="modal">
                  <button className="w-full py-3.5 bg-elevated border border-border rounded-xl font-semibold text-primary cursor-pointer hover:border-border-light transition-all">
                    Sign Up Free 
                  </button>
                </SignUpButton>
              )}
            </div>

            {/* Token packs card */}
            <div className="relative p-9 bg-card border-2 border-accent rounded-[20px] text-left">
              <div
                className="absolute -top-3.5 left-6 text-bg text-[10px] font-black tracking-widest px-3 py-1 rounded-full"
                style={{ background: "#e8c547", color: "#000" }}
              >
                TOKEN PACKS
              </div>
              <div className="text-xs font-black tracking-widest text-accent mb-4">CHOOSE YOUR PACK</div>
              <div className="text-secondary text-sm mb-5">
                2 tokens = 1 search · Tokens never expire
              </div>

              {/* Pack selector */}
              <div className="flex flex-col gap-3 mb-6">
                {displayPacks.map((pack, idx) => {
                  const badge = BADGES[idx];
                  const perToken = Math.round(Number(pack.price_naira) / pack.tokens_per_pack);
                  const searches = Math.floor(pack.tokens_per_pack / 2);

                  return (
                    <div
                      key={pack.id}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: badge === "BEST VALUE"
                          ? "rgba(232,197,71,0.08)"
                          : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${badge === "BEST VALUE" ? "#e8c547" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 12,
                      }}
                    >
                      {badge && (
                        <span style={{
                          position: "absolute", top: -9, right: 10,
                          background: "#e8c547", color: "#000",
                          fontSize: 8, fontWeight: 900, letterSpacing: 1,
                          padding: "2px 7px", borderRadius: 20,
                        }}>
                          {badge}
                        </span>
                      )}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                          {pack.tokens_per_pack} tokens
                          <span style={{ fontSize: 11, fontWeight: 400, color: "#666", marginLeft: 6 }}>
                            ({searches} search{searches !== 1 ? "es" : ""})
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                          {pack.label}
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: badge === "BEST VALUE" ? "#e8c547" : "var(--color-text-primary)" }}>
                        ₦{Number(pack.price_naira).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              {isSignedIn ? (
                <button
                  onClick={handleBuyClick}
                  className="w-full py-3.5 rounded-xl font-display font-bold text-base cursor-pointer transition-all border-none"
                  style={{ background: "#e8c547", color: "#000" }}
                >
                  Buy Tokens
                </button>
              ) : (
                <SignUpButton mode="modal">
                  <button
                    className="w-full py-3.5 rounded-xl font-display font-bold text-base cursor-pointer transition-all border-none"
                    style={{ background: "#e8c547", color: "#000" }}
                  >
                    Get Started →
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>

          {/* Value callout */}
          <div
            className="max-w-3xl mx-auto mb-16 px-6 py-4 rounded-2xl text-sm text-secondary flex flex-wrap gap-6 justify-center"
            style={{ background: "rgba(232,197,71,0.05)", border: "1px solid rgba(232,197,71,0.15)" }}
          >
            {[
              { emoji: "⚡", text: "Instant token credit" },
              { emoji: "♾️", text: "Tokens never expire" },
            ].map(({ emoji, text }) => (
              <span key={text} className="flex items-center gap-2">
                <span>{emoji}</span> {text}
              </span>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-xl mx-auto text-left">
            <h2 className="text-3xl font-display font-black mb-6 text-center">FAQ</h2>
            {[
              {
                q: "What counts as one search?",
                a: "Uploading a single image and selecting any of the 3 options (Buy, Learn, or Others) counts as one search, using 2 tokens.",
              },
              {
                q: "Do my tokens expire?",
                a: "No. Purchased tokens never expire and remain in your account until used.",
              },
              {
                q: "Which pack is the best value?",
                a: "The Pro Pack (12 tokens / ₦1,000)",
              },
              {
                q: "How does the affiliate model work?",
                a: "When you click 'Buy Now', you're redirected to the supplier (Amazon, AliExpress, etc.). If you purchase, we earn a small commission at no extra cost to you.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-border py-5">
                <div className="font-bold mb-2">{q}</div>
                <div className="text-secondary text-sm leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token purchase modal */}
      {showTokenGate && (
        <TokenGate
          onClose={() => setShowTokenGate(false)}
          onSuccess={(newBalance) => {
            setShowTokenGate(false);
          }}
        />
      )}
    </div>
  );
}