"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STATUS_STEPS = [
  { key: "order_placed",      label: "Order Placed",       icon: "📋" },
  { key: "processing",        label: "Processing",         icon: "⚙️" },
  { key: "shipped",           label: "Shipped",            icon: "📦" },
  { key: "in_transit",        label: "In Transit",         icon: "✈️" },
  { key: "out_for_delivery",  label: "Out for Delivery",   icon: "🚚" },
  { key: "delivered",         label: "Delivered",          icon: "✅" },
];

const STATUS_COLORS = {
  order_placed:      "#6ea8fe",
  processing:        "#e8c547",
  shipped:           "#c47a47",
  in_transit:        "#a47ae8",
  out_for_delivery:  "#e8a547",
  delivered:         "#47c47a",
  exception:         "#e85447",
  returned:          "#888880",
};

export default function TrackingPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState(null);
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) { router.push("/"); return; }
    if (isSignedIn) fetchAllShipments();
  }, [isSignedIn, isLoaded]);

  const getToken = async () => await user?.getToken();

  const fetchAllShipments = async () => {
    try {
      const tok = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracking/`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      setAllShipments(data.shipments || []);
    } catch { /* silent */ }
    finally { setLoadingAll(false); }
  };

  const handleTrack = async (id) => {
    const tid = (id || trackingId).trim();
    if (!tid) { toast.error("Enter a tracking ID"); return; }
    setLoading(true);
    setSearched(true);
    setShipment(null);
    try {
      const tok = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracking/${tid}/`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.status === 404) { toast.error("Tracking ID not found"); setLoading(false); return; }
      const data = await res.json();
      setShipment(data);
      setTrackingId(tid);
    } catch { toast.error("Failed to fetch tracking info"); }
    finally { setLoading(false); }
  };

  const getStepIndex = (status) => STATUS_STEPS.findIndex(s => s.key === status);

  return (
    <div className="min-h-screen pt-[68px] bg-bg text-primary">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold text-accent mb-5"
            style={{ background: "rgba(232,197,71,0.08)", borderColor: "rgba(232,197,71,0.2)" }}>
            📦 Real-Time Tracking
          </div>
          <h1 className="text-5xl font-display font-black tracking-tighter mb-3">Track your order</h1>
          <p className="text-secondary">Enter your tracking ID to see live shipment status</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-10">
          <input
            value={trackingId}
            onChange={e => setTrackingId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleTrack()}
            placeholder="e.g. SNAP-TRK-20240101-ABC123"
            className="flex-1 px-4 py-3.5 bg-card border border-border rounded-xl text-primary text-sm font-body outline-none focus:border-accent transition-all placeholder:text-muted"
          />
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className={`px-6 py-3.5 rounded-xl font-display font-bold text-sm border-none cursor-pointer transition-all whitespace-nowrap ${
              loading ? "bg-elevated text-muted cursor-not-allowed" : "bg-accent text-bg hover:bg-accent-dim"
            }`}
          >
            {loading ? "Searching…" : "Track →"}
          </button>
        </div>

        {/* Tracking result */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-10 h-10 rounded-full border-[3px] border-border border-t-accent"
              style={{ animation: "spin 0.8s linear infinite" }} />
            <p className="text-secondary text-sm">Fetching shipment info…</p>
          </div>
        )}

        {!loading && searched && !shipment && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-bold mb-2">Tracking ID not found</p>
            <p className="text-secondary text-sm">Double-check your ID or contact the supplier for the correct code.</p>
          </div>
        )}

        {shipment && !loading && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            {/* Product card */}
            <div className="p-6 bg-card border border-border rounded-[20px] mb-6 flex gap-5 items-center">
              {shipment.product_image
                ? <img src={shipment.product_image} alt={shipment.product_name}
                    className="w-20 h-20 rounded-xl object-cover bg-elevated flex-shrink-0" />
                : <div className="w-20 h-20 rounded-xl bg-elevated flex items-center justify-center text-3xl flex-shrink-0">📦</div>
              }
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-lg mb-1 truncate">{shipment.product_name}</div>
                <div className="text-secondary text-sm mb-2">{shipment.supplier_name}
                  {shipment.supplier_platform && ` · ${shipment.supplier_platform}`}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase"
                    style={{
                      background: `${STATUS_COLORS[shipment.status] || "#888"}20`,
                      color: STATUS_COLORS[shipment.status] || "#888"
                    }}>
                    {shipment.status_display}
                  </span>
                  {shipment.carrier && (
                    <span className="text-xs text-muted">via {shipment.carrier}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar — only for non-exception statuses */}
            {!["exception","returned"].includes(shipment.status) && (
              <div className="p-6 bg-card border border-border rounded-[20px] mb-6">
                <div className="text-[10px] font-black tracking-widest text-muted uppercase mb-6">Shipment Progress</div>
                <div className="relative">
                  {/* Track line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
                  <div
                    className="absolute top-5 left-5 h-0.5 transition-all duration-700"
                    style={{
                      background: "var(--accent, #e8c547)",
                      width: `${Math.max(0, (getStepIndex(shipment.status) / (STATUS_STEPS.length - 1)) * 100)}%`,
                      right: "auto",
                    }}
                  />
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, i) => {
                      const currentIdx = getStepIndex(shipment.status);
                      const done    = i < currentIdx;
                      const active  = i === currentIdx;
                      const pending = i > currentIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2" style={{ width: "16.6%" }}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all z-10 ${
                            active  ? "border-accent bg-accent/20 scale-110" :
                            done    ? "border-green bg-green/20" :
                                      "border-border bg-elevated"
                          }`}>
                            {done ? "✓" : step.icon}
                          </div>
                          <div className={`text-center text-[10px] font-semibold leading-tight ${
                            active ? "text-accent" : done ? "text-green" : "text-muted"
                          }`}>{step.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Exception banner */}
            {shipment.status === "exception" && (
              <div className="p-5 bg-red/10 border border-red/30 rounded-xl mb-6 flex gap-3 items-start">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold text-red mb-1">Shipment Exception</div>
                  <div className="text-secondary text-sm">There is an issue with your shipment. Contact your supplier or carrier for more details.</div>
                </div>
              </div>
            )}

            {/* Key dates */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { label: "Order Date",    value: shipment.order_date    ? new Date(shipment.order_date).toLocaleDateString()    : "—" },
                { label: "Shipped",       value: shipment.shipped_at    ? new Date(shipment.shipped_at).toLocaleDateString()    : "Pending" },
                { label: "Est. Delivery", value: shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : "TBD" },
                { label: "Origin",        value: shipment.origin_country || "—" },
                { label: "Carrier",       value: shipment.carrier       || "—" },
                { label: "Delivered",     value: shipment.delivered_at  ? new Date(shipment.delivered_at).toLocaleDateString()  : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-card border border-border rounded-xl">
                  <div className="text-[10px] font-black tracking-widest text-muted uppercase mb-1">{label}</div>
                  <div className="font-semibold text-sm">{value}</div>
                </div>
              ))}
            </div>

            {/* Event timeline */}
            {shipment.events?.length > 0 && (
              <div className="p-6 bg-card border border-border rounded-[20px] mb-6">
                <div className="text-[10px] font-black tracking-widest text-muted uppercase mb-5">Tracking Timeline</div>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  {shipment.events.map((ev, i) => (
                    <div key={i} className="relative pl-11 pb-6 last:pb-0">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-accent border-2 border-bg" />
                      <div className="font-semibold text-sm mb-0.5">{ev.status}</div>
                      {ev.location && <div className="text-xs text-secondary mb-0.5">📍 {ev.location}</div>}
                      <div className="text-xs text-secondary mb-1">{ev.description}</div>
                      <div className="text-[10px] text-muted">{new Date(ev.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Carrier link */}
            {shipment.carrier_tracking_url && (
              <a href={shipment.carrier_tracking_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-elevated border border-border rounded-xl text-sm font-semibold text-secondary hover:text-primary hover:border-border-light transition-all">
                Track on {shipment.carrier || "Carrier"} website →
              </a>
            )}
          </div>
        )}

        {/* My shipments list */}
        {!searched && !loadingAll && allShipments.length > 0 && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <h2 className="text-xl font-display font-black mb-4">Your Shipments</h2>
            <div className="flex flex-col gap-3">
              {allShipments.map((s, i) => (
                <button key={i} onClick={() => { setTrackingId(s.tracking_id); handleTrack(s.tracking_id); }}
                  className="p-5 bg-card border border-border rounded-[20px] text-left flex items-center gap-4 hover:bg-elevated hover:border-border-light transition-all cursor-pointer">
                  <div className="text-2xl">{s.status === "delivered" ? "✅" : s.status === "in_transit" ? "✈️" : "📦"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm mb-0.5 truncate">{s.product_name}</div>
                    <div className="font-mono text-xs text-accent">{s.tracking_id}</div>
                    <div className="text-xs text-muted mt-0.5">{s.supplier_name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase"
                      style={{
                        background: `${STATUS_COLORS[s.status] || "#888"}20`,
                        color: STATUS_COLORS[s.status] || "#888"
                      }}>
                      {s.status_display}
                    </span>
                    {s.estimated_delivery && (
                      <span className="text-[10px] text-muted">Est. {new Date(s.estimated_delivery).toLocaleDateString()}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!searched && !loadingAll && allShipments.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-bold mb-2">No shipments yet</p>
            <p className="text-secondary text-sm">Once a supplier ships your order, your tracking ID will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
