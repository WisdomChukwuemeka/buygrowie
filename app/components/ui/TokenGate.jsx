"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const loadPaystackScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.PaystackPop) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Paystack SDK"));
    document.body.appendChild(script);
  });

export default function TokenGate({ onClose, onSuccess }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [fetchingPacks, setFetchingPacks] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchPacks = async () => {
      setFetchingPacks(true);
      setFetchError(null);
      try {
        const token = await getToken({ skipCache: true });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tokens/balance/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          setFetchError(`Server error: ${res.status}`);
          return;
        }

        const data = await res.json();
        console.log("Pricing response:", data); // 👈 debug — check your console

        const available = Array.isArray(data.pricing) ? data.pricing : [];
        setPacks(available);
        if (available.length > 0) setSelectedPack(available[0]);
        else setFetchError("No packs found. Please seed the database.");
      } catch (err) {
        console.error("Fetch packs error:", err);
        setFetchError("Could not connect to server.");
      } finally {
        setFetchingPacks(false);
      }
    };
    fetchPacks();
  }, []);

  const handlePay = async () => {
    if (!selectedPack || loading) return;
    setLoading(true);

    try {
      const token = await getToken({ skipCache: true });
      if (!token) {
        toast.error("Not authenticated. Please sign in again.");
        setLoading(false);
        return;
      }

      await loadPaystackScript();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/initiate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pricing_id: selectedPack.id }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || `Initiation failed (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data?.reference || !data?.amount_kobo) {
        toast.error("Invalid response from server.");
        setLoading(false);
        return;
      }

      const userEmail =
        data.email ||
        user?.primaryEmailAddress?.emailAddress ||
        "user@snapsearch.app";

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: data.amount_kobo,
        ref: data.reference,
        callback: function (response) {
          getToken({ skipCache: true })
            .then((freshToken) =>
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${freshToken}`,
                },
                body: JSON.stringify({ reference: response.reference }),
              })
            )
            .then((r) => r.json())
            .then((verifyData) => {
              if (verifyData.success) {
                toast.success(`✅ ${verifyData.tokens_added} tokens added!`);
                if (onSuccess) onSuccess(verifyData.new_balance);
              } else {
                toast.error(verifyData.error || "Verification failed.");
              }
            })
            .catch(() => toast.error("Verification error. Contact support."))
            .finally(() => setLoading(false));
        },
        onClose: function () {
          toast("Payment window closed.");
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      toast.error(err?.message || "Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  const BADGES = ["", "", "POPULAR", "BEST VALUE", "PREMIUM"];

  return (
    // Backdrop
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: 20,
          padding: "1.75rem",
          width: "100%", maxWidth: 420,
          position: "relative",
        }}
      >
        {/* ✅ Close button — always visible, always works */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 32, height: 32, borderRadius: "50%",
            background: "#1f1f1f", border: "1px solid #333",
            color: "#aaa", fontSize: 18, lineHeight: "30px",
            textAlign: "center", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem", paddingRight: 40 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>💎</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#fff" }}>
            Buy Tokens
          </h2>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            Pick a pack — tokens never expire · 2 tokens = 1 search
          </p>
        </div>

        {/* Pack list */}
        {fetchingPacks ? (
          <div style={{ textAlign: "center", padding: "2rem 0", color: "#666", fontSize: 13 }}>
            Loading packs...
          </div>
        ) : fetchError ? (
          <div style={{
            padding: "1rem", borderRadius: 12, marginBottom: "1rem",
            background: "rgba(220,50,50,0.08)", border: "1px solid rgba(220,50,50,0.2)",
            color: "#e24b4a", fontSize: 13, textAlign: "center",
          }}>
            ⚠️ {fetchError}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
            {packs.map((pack, idx) => {
              const isSelected = selectedPack?.id === pack.id;
              const badge = BADGES[idx] || null;
              const perToken = Math.round(Number(pack.price_naira) / pack.tokens_per_pack);
              const searches = Math.floor(pack.tokens_per_pack / 2);

              return (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPack(pack)}
                  style={{
                    position: "relative",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: isSelected ? "rgba(232,197,71,0.1)" : "#1a1a1a",
                    border: `2px solid ${isSelected ? "#e8c547" : "#2a2a2a"}`,
                    borderRadius: 14, cursor: "pointer",
                    transition: "all 0.15s", textAlign: "left", width: "100%",
                  }}
                >
                  {badge && (
                    <span style={{
                      position: "absolute", top: -10, right: 14,
                      background: "#e8c547", color: "#000",
                      fontSize: 9, fontWeight: 900, letterSpacing: 1,
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      {badge}
                    </span>
                  )}

                  {/* Left */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, fontSize: 18,
                      background: isSelected ? "rgba(232,197,71,0.15)" : "#222",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      💎
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                        {pack.tokens_per_pack} tokens
                      </div>
                      <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                        {searches} search{searches !== 1 ? "es" : ""} · ₦{perToken}/token
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{
                    fontSize: 17, fontWeight: 800,
                    color: isSelected ? "#e8c547" : "#fff",
                  }}>
                    ₦{Number(pack.price_naira).toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading || !selectedPack || fetchingPacks || !!fetchError}
          style={{
            width: "100%", padding: "14px",
            borderRadius: 14, border: "none",
            background: loading || !selectedPack || fetchError ? "#222" : "#e8c547",
            color: loading || !selectedPack || fetchError ? "#555" : "#000",
            fontSize: 15, fontWeight: 800,
            cursor: loading || !selectedPack || fetchError ? "not-allowed" : "pointer",
            marginBottom: "0.75rem", transition: "all 0.2s",
          }}
        >
          {loading
            ? "Processing..."
            : selectedPack
              ? `Pay ₦${Number(selectedPack.price_naira).toLocaleString()}`
              : "Select a pack above"}
        </button>

        {/* Cancel text link */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            display: "block", width: "100%",
            background: "none", border: "none",
            fontSize: 13, color: "#555",
            cursor: loading ? "not-allowed" : "pointer",
            textAlign: "center", padding: "4px",
          }}
        >
          Cancel
        </button>

        <p style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
          Secured by Paystack · Tokens credited instantly
        </p>
      </div>
    </div>
  );
}