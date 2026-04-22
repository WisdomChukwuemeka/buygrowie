"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BuyFlow from "../components/ui/BuyFlow";
import LearnFlow from "../components/ui/LearnFlow";
import OthersFlow from "../components/ui/OthersFlow";
import TokenGate from "../components/ui/TokenGate";

// Minimalist, professional SVG Icons to replace emojis
const Icons = {
  buy: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  learn: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  others: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
};

export default function SearchPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isFirstSearch, setIsFirstSearch] = useState(false);
  const [activeFlow, setActiveFlow] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [showTokenGate, setShowTokenGate] = useState(false);

  useEffect(() => {
    if (!isSignedIn) { router.push("/"); return; }
    const img = sessionStorage.getItem("snapFile");
    if (!img) { router.push("/"); return; }

    setPreview(img);
    fetchTokens();
  }, [isSignedIn]);

  const fetchTokens = async () => {
    try {
      const token = await getToken({ skipCache: true });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens/balance/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTokens(data.tokens);
      setIsFirstSearch(data.is_first_search);
    } catch {
      setTokens(0);
    }
  };

  const handlePaymentSuccess = (newBalance) => {
    setShowTokenGate(false);
    if (typeof newBalance === "number") {
      setTokens(newBalance);
      setIsFirstSearch(false);
    } else {
      fetchTokens();
    }
  };

  const handleQuestionSelect = async (question) => {
    if (!isFirstSearch && (tokens === null || tokens < 2)) {
      setShowTokenGate(true);
      return;
    }

    setAnalyzing(true);
    try {
      const imageData = preview;
      const token = await getToken({ skipCache: true });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/geminisearch/analyze/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image_base64: imageData, query_type: question }),
      });

      if (res.status === 402) {
        setShowTokenGate(true);
        setAnalyzing(false);
        fetchTokens();
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        toast.error(errBody?.error || "Analysis failed. Please try again.");
        setAnalyzing(false);
        return;
      }

      const data = await res.json();
      setProductInfo(data);
      setActiveFlow(question);
      fetchTokens();
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const resetFlow = () => {
    setActiveFlow(null);
    setProductInfo(null);
  };

  if (!preview) return null;

  const tokenBarLabel = () => {
    if (isFirstSearch) return "First search is complimentary";
    if (tokens === null) return "Authenticating...";
    if (tokens === 0) return "0 tokens available";
    return `${tokens} token${tokens !== 1 ? "s" : ""} remaining`;
  };

  const canSearch = isFirstSearch || (tokens !== null && tokens >= 2);

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-[#E8C547] selection:text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Sleek Token Header */}
        <div className="flex justify-between items-center mb-10 px-6 py-4 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${tokens === 0 && !isFirstSearch ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-[#E8C547] shadow-[0_0_10px_rgba(232,197,71,0.5)]"}`}></div>
            <span className="text-sm tracking-wide text-zinc-300 font-medium">
              {tokenBarLabel()}
            </span>
          </div>
          <button
            onClick={() => setShowTokenGate(true)}
            className="px-5 py-2 text-xs font-semibold text-[#E8C547] rounded-lg border border-[#E8C547]/30 bg-[#E8C547]/5 hover:bg-[#E8C547]/15 transition-all duration-300 shadow-[0_0_15px_rgba(232,197,71,0.05)]"
          >
            Refill Tokens
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 items-start">
          
          {/* Left Panel — Realistic Image Frame */}
          <div className="relative bg-[#111113] border border-white/10 rounded-[24px] overflow-hidden lg:sticky lg:top-[100px] shadow-2xl shadow-black/50">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
            <img src={preview} alt="Target product" className="w-full aspect-square object-cover object-center filter brightness-95" />
            
            <div className="absolute bottom-0 left-0 w-full p-5 z-20">
              <button
                onClick={() => { sessionStorage.removeItem("snapFile"); router.push("/"); }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Upload New Image
              </button>
            </div>
          </div>

          {/* Right Panel — Options & Flows */}
          <div className="min-h-[500px]">
            {!activeFlow && !analyzing && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
                  What do you want to do?
                </h2>
                <p className="text-zinc-400 text-lg mb-8 max-w-xl font-light">
                  Choose what you want to find out from this image.
                </p>

                <div className="flex flex-col gap-4">
                   {[
                    {
                      id: "buy",
                      num: "01",
                      icon: Icons.buy,
                      title: "Find & Buy",
                      desc: "Find where to buy this item online, including trusted sellers and similar products.",
                    },
                    {
                      id: "learn",
                      num: "02",
                      icon: Icons.learn,
                      title: "Learn About It",
                      desc: "Get simple details about the product, what it’s made of, and how it’s made.",
                    },
                    {
                      id: "others",
                      num: "03",
                      icon: Icons.others,
                      title: "Ask Anything",
                      desc: "Ask any question you have about this item.",
                    },
                  ].map(({ id, num, icon, title, desc, color, borderColor, iconColor }) => (
                    <button
                      key={id}
                      onClick={() => handleQuestionSelect(id)}
                      disabled={!canSearch}
                      className={`group relative p-6 bg-white/[0.02] border border-white/10 hover:${borderColor} rounded-[20px] text-left flex items-start sm:items-center gap-6 transition-all duration-500 overflow-hidden`}
                      style={{
                        cursor: canSearch ? "pointer" : "not-allowed",
                        opacity: canSearch ? 1 : 0.5,
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      <div className={`relative w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-500 ${iconColor}`}>
                        {icon}
                      </div>
                      <div className="relative flex-1">
                        <div className={`text-[10px] font-bold tracking-[0.2em] mb-1.5 ${iconColor} opacity-80 uppercase`}>
                          Execution Path {num}
                        </div>
                        <div className="text-xl font-semibold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-300">{title}</div>
                        <div className="text-sm text-zinc-400 font-light leading-relaxed">{desc}</div>
                      </div>
                      <div className="relative text-zinc-600 group-hover:text-white transition-colors duration-300 hidden sm:block">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>

                {!canSearch && (
                  <div className="mt-8 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
                    <p className="text-sm text-zinc-400 m-0">
                      Insufficient tokens. <strong className="text-white">2 tokens</strong> required (₦200).
                    </p>
                    <button
                      onClick={() => setShowTokenGate(true)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-white text-black font-semibold rounded-xl text-sm hover:bg-zinc-200 transition-colors shadow-lg"
                    >
                      Acquire Tokens
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Realistic / Futuristic Loading State */}
            {analyzing && (
              <div className="flex flex-col items-center justify-center py-32 gap-8 animate-in fade-in duration-1000">
                <div className="relative w-24 h-24">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full border border-white/10 border-t-[#E8C547] animate-spin" style={{ animationDuration: '2s' }} />
                  {/* Inner pulsing ring */}
                  <div className="absolute inset-2 rounded-full border border-[#E8C547]/30 border-b-[#E8C547] animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                  {/* Center glowing core */}
                  <div className="absolute inset-8 bg-[#E8C547]/20 rounded-full blur-md animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-white text-lg font-medium tracking-wide">Processing Image</p>
                  {/* <p className="text-zinc-500 text-sm font-light">Cross-referencing global databases...</p> */}
                </div>
              </div>
            )}

            {/* Flows */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeFlow === "buy"    && productInfo && <BuyFlow    data={productInfo} onBack={resetFlow} />}
              {activeFlow === "learn"  && productInfo && <LearnFlow  data={productInfo} onBack={resetFlow} />}
              {activeFlow === "others" && productInfo && (
                <OthersFlow
                  data={productInfo}
                  imageBase64={preview}
                  onBack={resetFlow}
                  userToken={async () => await getToken({ skipCache: true })}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showTokenGate && (
        <TokenGate
          onClose={() => setShowTokenGate(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}