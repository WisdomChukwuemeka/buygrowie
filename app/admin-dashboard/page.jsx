"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const TABS = ["Overview", "Payments", "Searches", "Commissions", "Shipments", "Pricing"];


export default function AdminDashboard() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth(); // ✅ CORRECT PLACE

  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [searches, setSearches] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipmentFilter, setShipmentFilter] = useState("");
  const [newPrice, setNewPrice] = useState({
    label: "Standard Pack",
    tokens_per_pack: 2,
    price_naira: 200
  });
  const [editingShipment, setEditingShipment] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
      return;
    }
    if (isSignedIn) fetchAll();
  }, [isSignedIn, isLoaded]);

  const apiFetch = async (path, opts = {}) => {
    const tok = await getToken(); // ✅ use directly

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tok}`,
        ...opts.headers,
      },
    });

    if (res.status === 403) {
      toast.error("Admin access required");
      return null;
    }

    return res.json();
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, p, sr, c, sh, pr] = await Promise.all([
        apiFetch("/api/admin-panel/stats/"),
        apiFetch("/api/admin-panel/payments/"),
        apiFetch("/api/admin-panel/searches/"),
        apiFetch("/api/admin-panel/commissions/"),
        apiFetch("/api/admin-panel/shipments/"),
        apiFetch("/api/admin-panel/pricing/"),
      ]);
      if (s)  setStats(s);
      if (p)  setPayments(p.payments || []);
      if (sr) setSearches(sr.searches || []);
      if (c)  setCommissions(c.commissions || []);
      if (sh) setShipments(sh.shipments || []);
      if (pr) setPricing(pr.pricing || []);
    } finally { setLoading(false); }
  };

  const updateShipment = async (id, data) => {
    const res = await apiFetch(`/api/admin-panel/shipments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (res?.updated) { toast.success("Shipment updated"); fetchAll(); setEditingShipment(null); }
  };

  const updatePricing = async (id, data) => {
    const res = await apiFetch(`/api/admin-panel/pricing/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (res?.updated) { toast.success("Pricing updated"); fetchAll(); }
  };

  const createPricing = async () => {
    const res = await apiFetch("/api/admin-panel/pricing/", {
      method: "POST",
      body: JSON.stringify(newPrice),
    });
    if (res?.created) { toast.success("Pricing plan created"); fetchAll(); }
  };

  if (loading) return (
    <div className="min-h-screen pt-[68px] flex items-center justify-center bg-bg">
      <div className="w-10 h-10 rounded-full border-[3px] border-border border-t-accent"
        style={{ animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const tabBadge = { Payments: payments.length, Searches: searches.length, Shipments: shipments.length };

  return (
    <div className="min-h-screen pt-[68px] bg-bg text-primary">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight mb-1">Admin Dashboard</h1>
            <p className="text-secondary text-sm">SnapSearch Control Panel</p>
          </div>
          <button onClick={fetchAll} className="px-4 py-2 bg-elevated border border-border rounded-xl text-sm font-medium text-secondary hover:text-primary cursor-pointer transition-all">
            ↻ Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8 border-b border-border pb-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all relative ${
                activeTab === tab ? "bg-accent text-bg" : "bg-elevated text-secondary hover:text-primary"
              }`}>
              {tab}
              {tabBadge[tab] ? (
                <span className="ml-1.5 text-xs bg-black/20 px-1.5 py-0.5 rounded-full">{tabBadge[tab]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Revenue", value: `₦${Number(stats.revenue.total).toLocaleString()}`, sub: `₦${Number(stats.revenue.this_month).toLocaleString()} this month`, color: "text-accent" },
                { label: "Total Users", value: stats.users.total, sub: `+${stats.users.new_this_week} this week`, color: "text-green" },
                { label: "Total Searches", value: stats.searches.total, sub: `${stats.searches.paid} paid · ${stats.searches.free} free`, color: "text-blue" },
                { label: "Active Shipments", value: stats.shipments.active, sub: `${stats.shipments.delivered} delivered`, color: "text-primary" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="p-6 bg-card border border-border rounded-[20px]">
                  <div className="text-[10px] font-black tracking-widest text-muted uppercase mb-2">{label}</div>
                  <div className={`text-3xl font-display font-black mb-1 ${color}`}>{value}</div>
                  <div className="text-xs text-secondary">{sub}</div>
                </div>
              ))}
            </div>

            {/* Commission summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-card border border-border rounded-[20px]">
                <div className="text-[10px] font-black tracking-widest text-muted uppercase mb-4">Affiliate Commissions</div>
                <div className="text-3xl font-display font-black text-accent mb-1">${Number(stats.commission.total_estimated_usd).toFixed(2)}</div>
                <div className="text-xs text-secondary">{stats.commission.total_clicks} affiliate link clicks</div>
              </div>
              <div className="p-6 bg-card border border-border rounded-[20px]">
                <div className="text-[10px] font-black tracking-widest text-muted uppercase mb-4">Payment Channels</div>
                {stats.payment_channels?.map(ch => (
                  <div key={ch.channel} className="flex justify-between items-center mb-2">
                    <span className="text-sm capitalize">{ch.channel || "unknown"}</span>
                    <span className="text-xs text-secondary">{ch.count} · ₦{Number(ch.total).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === "Payments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Reference", "User", "Amount", "Tokens", "Channel", "Bank/Card", "Status", "Time"].map(h => (
                    <th key={h} className="pb-3 pr-4 text-[10px] font-black tracking-widest text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-elevated transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-accent">{p.reference}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{p.user}</div>
                      <div className="text-xs text-muted">{p.email}</div>
                    </td>
                    <td className="py-3 pr-4 font-bold text-green">₦{p.amount_naira}</td>
                    <td className="py-3 pr-4">💎 {p.tokens}</td>
                    <td className="py-3 pr-4 capitalize">{p.channel || "—"}</td>
                    <td className="py-3 pr-4 text-xs text-secondary">{p.bank_name || (p.card_last4 ? `••••${p.card_last4}` : "—")}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "success" ? "bg-green/20 text-green" :
                        p.status === "failed"  ? "bg-red/20 text-red" : "bg-muted/20 text-muted"
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 text-xs text-muted">{new Date(p.initiated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SEARCHES ── */}
        {activeTab === "Searches" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Image", "Product", "User", "Query Type", "Tokens", "Free?", "Date"].map(h => (
                    <th key={h} className="pb-3 pr-4 text-[10px] font-black tracking-widest text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searches.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-elevated transition-colors">
                    <td className="py-3 pr-4">
                      {s.image_url
                        ? <img src={s.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-elevated" onError={e => e.target.style.display="none"} />
                        : <div className="w-12 h-12 rounded-lg bg-elevated flex items-center justify-center text-muted text-lg">📦</div>
                      }
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{s.product_name}</div>
                      <div className="text-xs text-muted">{s.category}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div>{s.user}</div>
                      <div className="text-xs text-muted">{s.email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        s.query_type === "buy" ? "bg-green/20 text-green" :
                        s.query_type === "learn" ? "bg-accent/20 text-accent" : "bg-blue/20 text-blue"
                      }`}>{s.query_type}</span>
                    </td>
                    <td className="py-3 pr-4">{s.tokens_used}</td>
                    <td className="py-3 pr-4">{s.was_free ? <span className="text-green text-xs font-bold">FREE</span> : "—"}</td>
                    <td className="py-3 text-xs text-muted">{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── COMMISSIONS ── */}
        {activeTab === "Commissions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["User", "Platform", "Product", "Commission %", "Est. USD", "Status", "Clicked At"].map(h => (
                    <th key={h} className="pb-3 pr-4 text-[10px] font-black tracking-widest text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-elevated transition-colors">
                    <td className="py-3 pr-4 font-medium">{c.user}</td>
                    <td className="py-3 pr-4 capitalize font-semibold">{c.platform}</td>
                    <td className="py-3 pr-4 max-w-[200px] truncate">{c.product_name}</td>
                    <td className="py-3 pr-4 text-accent font-bold">{c.commission_pct}%</td>
                    <td className="py-3 pr-4 text-green font-bold">${c.estimated_usd}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === "confirmed" ? "bg-green/20 text-green" :
                        c.status === "paid"      ? "bg-accent/20 text-accent" : "bg-muted/20 text-secondary"
                      }`}>{c.status}</span>
                    </td>
                    <td className="py-3 text-xs text-muted">{new Date(c.clicked_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SHIPMENTS ── */}
        {activeTab === "Shipments" && (
          <div>
            {/* Status filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              {["", "order_placed", "processing", "shipped", "in_transit", "out_for_delivery", "delivered", "exception"].map(s => (
                <button key={s} onClick={() => setShipmentFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-none transition-all ${
                    shipmentFilter === s ? "bg-accent text-bg" : "bg-elevated text-secondary hover:text-primary"
                  }`}>
                  {s === "" ? "All" : s.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {shipments
                .filter(s => !shipmentFilter || s.status === shipmentFilter)
                .map((s, i) => (
                <div key={i} className="p-5 bg-card border border-border rounded-[20px]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">Tracking ID</div>
                        <div className="font-mono text-accent font-bold text-sm">{s.tracking_id}</div>
                        <div className="text-xs text-muted mt-1">{s.order_reference}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">User</div>
                        <div className="font-medium text-sm">{s.user}</div>
                        <div className="text-xs text-muted">{s.email}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">Product</div>
                        <div className="font-medium text-sm">{s.product_name}</div>
                        <div className="text-xs text-muted">{s.supplier_name} · {s.carrier}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={s.status} />
                      <button onClick={() => setEditingShipment(editingShipment?.id === s.id ? null : s)}
                        className="px-3 py-1.5 text-xs bg-elevated border border-border rounded-lg cursor-pointer hover:border-border-light text-secondary hover:text-primary transition-all">
                        {editingShipment?.id === s.id ? "Close" : "Edit"}
                      </button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {editingShipment?.id === s.id && (
                    <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-muted uppercase block mb-1">Status</label>
                        <select defaultValue={s.status} id={`status-${s.id}`}
                          className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm text-primary outline-none">
                          {["order_placed","processing","shipped","in_transit","out_for_delivery","delivered","exception","returned"].map(st => (
                            <option key={st} value={st}>{st.replace(/_/g," ")}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-muted uppercase block mb-1">Carrier</label>
                        <input defaultValue={s.carrier} id={`carrier-${s.id}`}
                          className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm text-primary outline-none focus:border-accent" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-muted uppercase block mb-1">Est. Delivery</label>
                        <input type="date" defaultValue={s.estimated_delivery} id={`delivery-${s.id}`}
                          className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm text-primary outline-none focus:border-accent" />
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <label className="text-[10px] font-black tracking-widest text-muted uppercase block mb-1">Admin Notes</label>
                        <textarea defaultValue={s.admin_notes} id={`notes-${s.id}`} rows={2}
                          className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm text-primary outline-none focus:border-accent resize-none" />
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <button onClick={() => updateShipment(s.id, {
                          status:            document.getElementById(`status-${s.id}`).value,
                          carrier:           document.getElementById(`carrier-${s.id}`).value,
                          estimated_delivery: document.getElementById(`delivery-${s.id}`).value,
                          admin_notes:       document.getElementById(`notes-${s.id}`).value,
                        })}
                          className="px-6 py-2.5 bg-accent text-bg font-bold text-sm rounded-xl border-none cursor-pointer hover:bg-accent-dim transition-all">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {activeTab === "Pricing" && (
          <div>
            <h3 className="text-xl font-display font-black mb-4">Token Pricing Plans</h3>
            <div className="flex flex-col gap-3 mb-10">
              {pricing.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-card border border-border rounded-[20px]">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">Label</div>
                      <input defaultValue={p.label} id={`label-${p.id}`}
                        className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm outline-none focus:border-accent text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">Price (₦)</div>
                      <input type="number" defaultValue={p.price_naira} id={`price-${p.id}`}
                        className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm outline-none focus:border-accent text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">Tokens per Pack</div>
                      <input type="number" defaultValue={p.tokens_per_pack} id={`tokens-${p.id}`}
                        className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm outline-none focus:border-accent text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">Active</div>
                      <select defaultValue={p.is_active ? "true" : "false"} id={`active-${p.id}`}
                        className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm outline-none text-primary">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => updatePricing(p.id, {
                    label:           document.getElementById(`label-${p.id}`).value,
                    price_naira:     document.getElementById(`price-${p.id}`).value,
                    tokens_per_pack: document.getElementById(`tokens-${p.id}`).value,
                    is_active:       document.getElementById(`active-${p.id}`).value === "true",
                  })}
                    className="px-5 py-2.5 bg-accent text-bg font-bold text-sm rounded-xl border-none cursor-pointer hover:bg-accent-dim transition-all whitespace-nowrap">
                    Save
                  </button>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-display font-black mb-4">Add New Pricing Plan</h3>
            <div className="p-6 bg-card border border-border rounded-[20px] grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {[
                { key: "label", label: "Label", type: "text" },
                { key: "price_naira", label: "Price (₦)", type: "number" },
                { key: "tokens_per_pack", label: "Tokens", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <div className="text-[10px] text-muted font-black tracking-widest uppercase mb-1">{label}</div>
                  <input type={type} value={newPrice[key]}
                    onChange={e => setNewPrice(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-elevated border border-border rounded-lg text-sm outline-none focus:border-accent text-primary" />
                </div>
              ))}
              <button onClick={createPricing}
                className="py-2.5 px-6 bg-green text-bg font-display font-bold text-sm rounded-xl border-none cursor-pointer hover:opacity-90 transition-all">
                + Create Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    order_placed:      { bg: "bg-blue/20",    text: "text-blue" },
    processing:        { bg: "bg-accent/20",  text: "text-accent" },
    shipped:           { bg: "bg-orange-500/20", text: "text-orange-400" },
    in_transit:        { bg: "bg-purple-500/20", text: "text-purple-400" },
    out_for_delivery:  { bg: "bg-yellow-500/20", text: "text-yellow-400" },
    delivered:         { bg: "bg-green/20",   text: "text-green" },
    exception:         { bg: "bg-red/20",     text: "text-red" },
    returned:          { bg: "bg-muted/20",   text: "text-muted" },
  };
  const c = map[status] || { bg: "bg-muted/20", text: "text-muted" };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${c.bg} ${c.text}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
