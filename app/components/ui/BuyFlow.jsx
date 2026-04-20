"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function BuyFlow({ data, onBack }) {
  const [countryFilter, setCountryFilter] = useState("all");
  const { user } = useUser();

  const countries = data?.suppliers ? [...new Set(data.suppliers.map(s => s.country))] : [];
  const filtered  = countryFilter === "all"
    ? (data?.suppliers || [])
    : (data?.suppliers || []).filter(s => s.country === countryFilter);

  const handleBuy = async (supplier) => {
    if (!supplier.affiliate_url) { toast.error("Affiliate link unavailable."); return; }

    // Track commission click in background
    try {
      const tok = await user?.getToken();
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/commission/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({
          platform:      supplier.platform,
          product_name:  supplier.product_title || data?.product_name,
          affiliate_url: supplier.affiliate_url,
          commission_pct: 5,
          estimated_usd: 0,
        }),
      });
    } catch { /* silent — don't block the redirect */ }

    toast.success("Redirecting to supplier…");
    window.open(supplier.affiliate_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-secondary mb-4 bg-transparent border-none cursor-pointer p-0 hover:text-primary transition-colors">
        ← Back to options
      </button>
      <h2 className="text-2xl font-display font-black tracking-tight mb-1.5">🛒 Buy: {data?.product_name || "This Product"}</h2>
      <p className="text-secondary text-sm mb-6">
        Found {filtered.length} verified supplier{filtered.length !== 1 ? "s" : ""} · Click to buy via affiliate link
      </p>

      {data?.product_name && (
        <div className="flex items-center gap-4 p-4 mb-6 rounded-xl border"
          style={{ background: "rgba(71,196,122,0.06)", borderColor: "rgba(71,196,122,0.2)" }}>
          <div className="text-3xl">✅</div>
          <div>
            <div className="font-bold text-sm mb-0.5">Product Identified</div>
            <div className="text-secondary text-xs">{data.product_name}{data.category ? ` · ${data.category}` : ""}</div>
          </div>
        </div>
      )}

      {countries.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-5">
          {["all", ...countries].map(c => (
            <button key={c} onClick={() => setCountryFilter(c)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
                countryFilter === c ? "bg-accent text-bg border-accent" : "bg-card border-border text-secondary hover:border-border-light"
              }`}>
              {c === "all" ? "🌍 All Countries" : c}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.length === 0
          ? <div className="py-12 text-center text-secondary">No suppliers found for this filter.</div>
          : filtered.map((supplier, i) => <SupplierCard key={i} supplier={supplier} onBuy={handleBuy} />)
        }
      </div>
    </div>
  );
}

function SupplierCard({ supplier, onBuy }) {
  const platformColors = { amazon: "#FF9900", aliexpress: "#e43225", ebay: "#86b817" };
  const color = platformColors[supplier.platform?.toLowerCase()] || "#e8c547";

  return (
    <div className="group p-5 bg-card border border-border rounded-[20px] grid gap-5 items-center transition-all duration-200 hover:border-border-light"
      style={{ gridTemplateColumns: supplier.image_url ? "80px 1fr auto" : "1fr auto" }}>
      {supplier.image_url && (
        <img src={supplier.image_url} alt={supplier.product_title}
          className="w-20 h-20 object-cover rounded-xl bg-elevated"
          onError={e => { e.target.style.display = "none"; }} />
      )}
      <div>
        <div className="text-[10px] font-black tracking-[1.5px] mb-1" style={{ color }}>
          {supplier.platform?.toUpperCase()} · {supplier.type}
        </div>
        <div className="font-semibold text-base mb-1">{supplier.product_title || supplier.company_name}</div>
        <div className="text-secondary text-xs mb-2">
          📍 {supplier.country}{supplier.rating ? ` · ⭐ ${supplier.rating}` : ""}
          {supplier.review_count ? ` (${Number(supplier.review_count).toLocaleString()} reviews)` : ""}
        </div>
        {supplier.price && <div className="font-display font-black text-xl">{supplier.price}</div>}
      </div>
      <button onClick={() => onBuy(supplier)}
        className="px-6 py-3 rounded-xl font-display font-bold text-sm border-none cursor-pointer transition-opacity hover:opacity-85 whitespace-nowrap"
        style={{ background: color, color: supplier.platform?.toLowerCase() === "amazon" ? "#080808" : "#fff" }}>
        Buy Now →
      </button>
    </div>
  );
}
