"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

   // ✅ correct place
export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const router   = useRouter();
  const [tokens, setTokens]   = useState(null);
  const [history, setHistory] = useState([]);
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("searches");

  useEffect(() => {
    if (!isSignedIn) { router.push("/"); return; }
    fetchDashboard();
  }, [isSignedIn]);

  const fetchDashboard = async () => {
    try {
      const tok = await getToken();
      const h   = { Authorization: `Bearer ${tok}` };
      const [tokRes, histRes, txnRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens/balance/`, { headers: h }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/history/`, { headers: h }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/history/`, { headers: h }),
      ]);
      const td = await tokRes.json();
      const hd = await histRes.json();
      const pd = await txnRes.json();
      setTokens(td.tokens);
      setHistory(hd.searches || []);
      setTxns(pd.transactions || []);
    } catch { setTokens(0); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen pt-[68px] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-[3px] border-border border-t-accent"
        style={{ animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-[68px] px-6 pb-12 bg-bg text-primary">
      <div className="max-w-4xl mx-auto pt-8">

        <div className="mb-10">
          <h1 className="text-4xl font-display font-black tracking-tight mb-1.5">
            Welcome back, {user?.firstName || "there"}
          </h1>
          <p className="text-secondary text-sm">Your SnapSearch dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Tokens",       value: tokens ?? "0",   icon: "💎", color: "text-accent" },
            { label: "Searches",     value: history.length,  icon: "🔍", color: "text-green" },
            { label: "Payments",     value: txns.length,     icon: "💳", color: "text-blue" },
            { label: "Cost/Search",  value: "₦200",          icon: "📊", color: "text-primary" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="p-5 bg-card border border-border rounded-[20px]">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">{label}</div>
              <div className={`text-3xl font-display font-black ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          <button onClick={() => router.push("/")}
            className="py-4 px-5 bg-accent text-bg rounded-xl font-display font-bold text-sm border-none cursor-pointer text-left hover:bg-accent-dim transition-all">
            📸 New Search
          </button>
          <Link href="/tracking"
            className="py-4 px-5 bg-card border border-border rounded-xl font-display font-bold text-sm cursor-pointer text-left hover:border-border-light transition-all text-primary flex items-center">
            📦 Track My Orders
          </Link>
          <button onClick={() => router.push("/pricing")}
            className="py-4 px-5 bg-card border border-border rounded-xl font-display font-bold text-sm cursor-pointer text-left hover:border-border-light transition-all text-primary">
            💎 Buy Tokens
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-border pb-3">
          {[["searches","Search History"],["payments","Payment History"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all ${
                tab === key ? "bg-accent text-bg" : "bg-elevated text-secondary hover:text-primary"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search history */}
        {tab === "searches" && (
          history.length === 0
            ? <div className="py-12 text-center bg-card border border-border rounded-[20px] text-secondary">No searches yet. Upload your first image!</div>
            : history.slice(0, 15).map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-card border border-border rounded-xl mb-2.5 hover:border-border-light transition-all">
                <div>
                  <div className="font-semibold text-sm mb-0.5">{item.product_name || "Unknown Product"}</div>
                  <div className="text-xs text-muted capitalize">{item.query_type} · {new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                  item.was_free ? "bg-green/20 text-green" : "bg-accent/10 text-accent"
                }`}>
                  {item.was_free ? "FREE" : `-2 tokens`}
                </span>
              </div>
            ))
        )}

        {/* Payment history */}
        {tab === "payments" && (
          txns.length === 0
            ? <div className="py-12 text-center bg-card border border-border rounded-[20px] text-secondary">No payments yet.</div>
            : txns.map((t, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-card border border-border rounded-xl mb-2.5">
                <div>
                  <div className="font-semibold text-sm mb-0.5">Token Purchase — {t.tokens} tokens</div>
                  <div className="text-xs text-muted">
                    {t.bank || t.channel || "Card"} · {new Date(t.date).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-green">₦{t.amount}</div>
                  <div className="font-mono text-[10px] text-muted mt-0.5">{t.reference}</div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
