"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useUser, SignUpButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Link from "next/link";

// Static data moved outside component to prevent recreation on every render
const CATEGORIES = [
  { name: "Electronics", color: "#FF6B35", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80" },
  { name: "Fashion", color: "#F7931E", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80" },
  { name: "Phones", color: "#FFD23F", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" },
  { name: "Home", color: "#06FFA5", img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80" },
];

const TRENDING = [
  { name: "Air Max Pulse", price: "$189", oldPrice: "$249", discount: "24%", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", tag: "BESTSELLER" },
  { name: "Chrono Elite", price: "$299", oldPrice: "$399", discount: "25%", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", tag: "NEW" },
  { name: "Studio Pro X", price: "$349", oldPrice: "$449", discount: "22%", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", tag: "HOT" },
  { name: "Mirrorless Z7", price: "$1,299", oldPrice: "$1,599", discount: "19%", image: "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?w=500&q=80", tag: "DEAL" },
]

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Optimized scene rotation
  useEffect(() => {
    const timer = setInterval(() => setActiveStep((prev) => (prev + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  // Protected & Memory-safe Dropzone handler
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      toast.error("File must be an image under 5MB");
      return;
    }

    const f = acceptedFiles[0];
    if (!f) return;

    setFile(f);
    const reader = new FileReader();
    
    reader.onload = (e) => setPreview(e.target.result);
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsDataURL(f);

    // Cleanup reader on unmount to prevent memory leaks
    return () => reader.abort();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxFiles: 1,
    maxSize: 5242880, // Protect against huge files (5MB max)
  });

  const handleSearch = () => {
    if (!file) {
      toast.error("Please upload an image first");
      return;
    }
    if (!isSignedIn) {
      toast.error("Please sign in to continue", { icon: "🔐" });
      return;
    }
    
    try {
      sessionStorage.setItem("snapFile", preview);
      router.push("/search");
    } catch (err) {
      toast.error("Storage quota exceeded. Image too large.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden pt-[68px]">
      {/* CSS Animations (Hardware Accelerated) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes flash { 0%, 100% { opacity: 0; } 10% { opacity: 1; } 20% { opacity: 0; } }
        @keyframes scanLine { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes orbit { 0% { transform: rotate(0deg) translateX(60px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); } }
        @keyframes shipPackage { 0% { transform: translate(0, 0) scale(0.5); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; transform: translate(120px, 30px) scale(1); } 100% { opacity: 0; transform: translate(120px, 30px) scale(0); } }
        .scene-enter { animation: float 4s ease-in-out infinite; }
      `}} />

      {/* HERO SECTION */}
      <section className="relative px-6 pt-20 pb-16 overflow-hidden">
        {/* Optimized background glow (CSS only, no JS particles) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(232,197,71,0.08) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-8 text-[#E8C547] bg-[#E8C547]/10 border-[#E8C547]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C547] animate-pulse" />
              Snap. Search. Buy — Worldwide.
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
              Find any <br />
              <span className="bg-gradient-to-r from-[#E8C547] to-[#F7931E] bg-clip-text text-transparent">
                product
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 mb-10 font-light leading-relaxed">
              Upload or snap an image of any item. We find where to buy it globally, tell its full story, or show you how to produce it from scratch.
            </p>

            {/* Drop Zone */}
            <div
              {...getRootProps()} 
              id="find-anything" className={`relative max-w-lg mx-auto lg:mx-0 mb-6 rounded-[20px] border-2 border-dashed p-10 cursor-pointer transition-all duration-200 ${
                isDragActive ? "border-[#E8C547] bg-[#E8C547]/10" : "border-gray-700 bg-white/5 hover:border-[#E8C547]/50 hover:bg-white/10"
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={preview} alt="Preview" className="max-h-52 max-w-full rounded-xl object-contain shadow-lg" />
                  <p className="text-[#E8C547] text-sm font-semibold">✓ Image ready — click Search to continue</p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8C547]/20 to-[#F7931E]/20 flex items-center justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8C547" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold">Drop your image here</p>
                  <p className="text-gray-500 text-sm">or click to browse · JPG, PNG, WEBP</p>
                </div>
              )}
            </div>

            {/* Safe Auth Button rendering */}
            {isLoaded && (
              <div>
                {isSignedIn ? (
                  <button onClick={handleSearch}
                    className={`px-12 py-4 rounded-xl text-base font-bold transition-all duration-300 border-none ${
                      preview ? "bg-gradient-to-r from-[#E8C547] to-[#F7931E] text-black hover:scale-105 hover:shadow-[0_10px_40px_rgba(232,197,71,0.3)]" : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    }`}>
                    Search Product
                  </button>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="px-12 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-[#E8C547] to-[#F7931E] text-black hover:scale-105 hover:shadow-[0_10px_40px_rgba(232,197,71,0.3)] transition-all cursor-pointer">
                      Sign Up to Search Free
                    </button>
                  </SignUpButton>
                )}
              </div>
            )}
          </div>

          {/* Optimized CSS-Only 3D Phone Mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-72 h-[600px] bg-gray-900 rounded-[40px] p-2 border-4 border-gray-800 shadow-2xl shadow-[#E8C547]/10 animate-[float_6s_ease-in-out_infinite]">
              <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80" alt="Phone UI" className="w-full h-full rounded-[32px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 bg-[#111]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-4 bg-[#E8C547]/10 text-[#E8C547]">
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Three Steps to <span className="text-[#E8C547]">Discovery</span>
            </h2>
          </div>

          <div className="relative w-full h-[350px] bg-[#0a0a0a] border border-gray-800 rounded-3xl mb-12 overflow-hidden flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Scene 1 */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative flex items-center gap-12 scene-enter">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                    <polygon points="50,15 90,35 50,55 10,35" fill="#D4A373" />
                    <polygon points="10,35 50,55 50,95 10,75" fill="#CCD5AE" />
                    <polygon points="50,55 90,35 90,75 50,95" fill="#E9EDC9" />
                  </svg>
                </div>
                <div className="relative w-16 h-28 bg-slate-800 rounded-2xl border-4 border-slate-700 flex items-center justify-center -rotate-12 shadow-2xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full blur-2xl pointer-events-none" style={{ animation: activeStep === 0 ? 'flash 4s infinite' : 'none' }}></div>
                </div>
              </div>
            </div>

            {/* Scene 2 */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative scene-enter">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl opacity-50">
                    <polygon points="50,15 90,35 50,55 10,35" fill="#D4A373" />
                    <polygon points="10,35 50,55 50,95 10,75" fill="#CCD5AE" />
                    <polygon points="50,55 90,35 90,75 50,95" fill="#E9EDC9" />
                  </svg>
                  <div className="absolute left-0 w-full h-[2px] bg-[#E8C547] shadow-[0_0_15px_#E8C547]" style={{ animation: activeStep === 1 ? 'scanLine 2s linear infinite' : 'none' }}></div>
                </div>
                <div className="absolute -top-4 -right-8 text-3xl animate-[float_3s_ease-in-out_infinite_reverse]">🔍</div>
                <div className="absolute -bottom-4 -left-8 text-3xl animate-[float_2.5s_ease-in-out_infinite]">⚙️</div>
              </div>
            </div>

            {/* Scene 3 */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeStep === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative flex items-center w-full max-w-md justify-between px-10">
                <div className="relative w-24 h-24 bg-blue-500 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-blue-300 rounded-full absolute -left-10" style={{ animation: activeStep === 2 ? 'orbit 4s linear infinite' : 'none' }}></div>
                  <div className="w-32 h-32 border-2 border-blue-300 rounded-full absolute -top-10" style={{ animation: activeStep === 2 ? 'orbit 6s linear infinite reverse' : 'none' }}></div>
                  🌍
                </div>
                <div className="absolute left-24 top-10 w-8 h-8 z-20" style={{ animation: activeStep === 2 ? 'shipPackage 2s ease-in-out infinite' : 'none' }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,15 90,35 50,55 10,35" fill="#E8C547" />
                    <polygon points="10,35 50,55 50,95 10,75" fill="#C9A020" />
                    <polygon points="50,55 90,35 90,75 50,95" fill="#F4D872" />
                  </svg>
                </div>
                <div className="relative w-28 h-32 scene-enter">
                  <div className="absolute bottom-0 w-full h-20 bg-orange-100 border-2 border-slate-800 rounded-b-lg"></div>
                  <div className="absolute top-4 w-full h-10 flex border-2 border-slate-800 rounded-t-lg overflow-hidden">
                    <div className="flex-1 bg-red-400"></div><div className="flex-1 bg-white"></div><div className="flex-1 bg-red-400"></div><div className="flex-1 bg-white"></div>
                  </div>
                  <div className="absolute bottom-0 left-3 w-8 h-12 bg-amber-800 border-2 border-slate-800 rounded-t-md"></div>
                  <div className="absolute bottom-4 right-3 w-10 h-8 bg-blue-200 border-2 border-slate-800 rounded-md"></div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🏪</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Snap or Upload", desc: "Take a photo or upload any image of a product you want to know about." },
              { step: "02", title: "Choose Your Query", desc: "Buy it, learn about it, or get full AI-powered production instructions." },
              { step: "03", title: "Go Global", desc: "Find verified suppliers worldwide and buy via trusted affiliate links." },
            ].map(({ step, title, desc }, index) => (
              <div 
                key={step} 
                onClick={() => setActiveStep(index)}
                className={`p-8 bg-white/5 border rounded-[20px] cursor-pointer transition-all duration-300 transform ${
                  activeStep === index ? "border-[#E8C547] shadow-[0_0_20px_rgba(232,197,71,0.15)] -translate-y-2" : "border-gray-800 hover:border-[#E8C547]/50 hover:-translate-y-1 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-1 flex-1 mx-4 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E8C547] transition-all duration-[4000ms] ease-linear" style={{ width: activeStep === index ? '100%' : '0%' }} />
                  </div>
                </div>
                <div className="text-xs font-black text-[#E8C547] tracking-widest mb-2">STEP {step}</div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY & TRENDING GRID (Optimized with CSS Hover instead of JS 3D Tilt) */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Categories */}
          <h2 className="text-4xl font-black tracking-tight mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group">
                <img src={cat.img} alt={cat.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 transition-opacity duration-300 bg-gradient-to-t from-black/90 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <div className="text-2xl font-bold text-white group-hover:-translate-y-2 transition-transform duration-300">{cat.name}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trending */}
          <h2 className="text-4xl font-black tracking-tight mb-8">Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRENDING.map((product) => (
              <div key={product.name} className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-[#E8C547]/50 transition-all duration-300 hover:-translate-y-2 group">
                <div className="relative h-56 overflow-hidden bg-gray-900">
                  <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold text-black uppercase bg-gradient-to-r from-[#E8C547] to-[#F7931E]">
                    {product.tag}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-black text-[#E8C547]">{product.price}</span>
                    <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                  </div>
                  <button className="w-full py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-[#E8C547] hover:text-black transition-all duration-300">
                    Find Sellers
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-24 bg-gradient-to-br from-[#E8C547] to-[#F7931E] text-black text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6">Ready to Find Anything?</h2>
          <p className="text-lg text-black/80 mb-10 font-medium">Join millions of shoppers using visual AI to discover products worldwide.</p>
          <SignUpButton mode="modal">
            <Link className="px-10 py-5 rounded-full text-lg font-black bg-black text-white hover:scale-105 hover:shadow-2xl transition-all duration-300" href="#find-anything">
              Get Started Free
            </Link>
          </SignUpButton>
        </div>
      </section>
    </div>
  );
}