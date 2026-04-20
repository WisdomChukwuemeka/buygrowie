"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useUser, SignUpButton } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
   const [activeStep, setActiveStep] = useState(0);

   useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000); // 4 seconds per scene
    return () => clearInterval(timer);
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const handleSearch = () => {
    if (!file) { toast.error("Please upload an image first"); return; }
    if (!isSignedIn) { toast("Please sign in to continue", { icon: "🔐" }); return; }
    sessionStorage.setItem("snapFile", preview);
    router.push("/search");
  };

  return (
    <div className="min-h-screen pt-[68px]">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(232,197,71,0.08) 0%, transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold text-accent mb-8"
            style={{ background: "rgba(232,197,71,0.08)", borderColor: "rgba(232,197,71,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Snap. Search. Buy — Worldwide.
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none mb-6"
            style={{ animation: "fadeUp 0.5s 0.1s ease both" }}>
            Find any product<br />
            <span className="gradient-text">with a photo</span>
          </h1>

          <p className="text-lg text-secondary max-w-lg mx-auto mb-12 font-light leading-relaxed"
            style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
            Upload or snap an image of any item. We find where to buy it globally, tell its full story, or show you how to produce it from scratch.
          </p>

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`relative max-w-lg mx-auto mb-6 rounded-[20px] border-2 border-dashed p-12 cursor-pointer transition-all duration-200 ${
              isDragActive
                ? "border-accent bg-accent/5"
                : "border-border-light bg-card hover:border-accent/50 hover:bg-elevated"
            }`}
            style={{ animation: "fadeUp 0.5s 0.3s ease both" }}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="flex flex-col items-center gap-3">
                <img src={preview} alt="Preview"
                  className="max-h-52 max-w-full rounded-xl object-contain" />
                <p className="text-accent text-sm font-semibold">✓ Image ready — click Search to continue</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-base font-semibold">Drop your image here</p>
                <p className="text-secondary text-sm">or click to browse · JPG, PNG, WEBP</p>
              </div>
            )}
          </div>

          {/* CTA */}
          {isSignedIn ? (
            <button onClick={handleSearch}
              className={`px-12 py-4 rounded-xl text-base font-display font-bold transition-all duration-200 border-none cursor-pointer ${
                preview
                  ? "bg-accent text-bg hover:bg-accent-dim"
                  : "bg-elevated text-muted cursor-not-allowed"
              }`}>
              Search Product
            </button>
          ) : (
            <SignUpButton mode="modal">
              <button className="px-12 py-4 rounded-xl text-base font-display font-bold bg-accent text-bg hover:bg-accent-dim transition-all cursor-pointer border-none">
                Sign Up to Search Free
              </button>
            </SignUpButton>
          )}
          <p className="mt-4 text-xs text-muted">First search is always free · No credit card required</p>
        </div>
      </section>

   {/* How it works - Animated Story Section */}
      <section className="px-6 py-24 border-t border-border bg-card/30">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes flash {
            0%, 100% { opacity: 0; }
            10% { opacity: 1; }
            20% { opacity: 0; }
          }
          @keyframes scanLine {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
          }
          @keyframes shipPackage {
            0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; transform: translate(120px, 30px) scale(1); }
            100% { opacity: 0; transform: translate(120px, 30px) scale(0); }
          }
          .scene-enter { animation: float 4s ease-in-out infinite; }
        `}</style>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-4xl font-display font-black tracking-tight mb-14">
            How the magic works
          </h2>

          {/* Animation "Video" Frame */}
          <div className="relative w-full h-[350px] bg-card border border-border rounded-3xl mb-12 overflow-hidden flex items-center justify-center shadow-xl">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* SCENE 1: Snap or Upload */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative flex items-center gap-12 scene-enter">
                {/* Isometric Box */}
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                    <polygon points="50,15 90,35 50,55 10,35" fill="#D4A373" />
                    <polygon points="10,35 50,55 50,95 10,75" fill="#CCD5AE" />
                    <polygon points="50,55 90,35 90,75 50,95" fill="#E9EDC9" />
                  </svg>
                </div>
                {/* Cartoon Phone taking picture */}
                <div className="relative w-16 h-28 bg-slate-800 rounded-2xl border-4 border-slate-700 flex items-center justify-center -rotate-12 shadow-2xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  {/* Camera Flash */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full blur-2xl pointer-events-none" style={{ animation: activeStep === 0 ? 'flash 4s infinite' : 'none' }}></div>
                </div>
              </div>
            </div>

            {/* SCENE 2: Choose Your Query (AI Scanning) */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative scene-enter">
                {/* Isometric Box */}
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl opacity-50">
                    <polygon points="50,15 90,35 50,55 10,35" fill="#D4A373" />
                    <polygon points="10,35 50,55 50,95 10,75" fill="#CCD5AE" />
                    <polygon points="50,55 90,35 90,75 50,95" fill="#E9EDC9" />
                  </svg>
                  {/* AI Laser Scanner */}
                  <div className="absolute left-0 w-full h-[2px] bg-accent shadow-[0_0_15px_#E8C547]" style={{ animation: activeStep === 1 ? 'scanLine 2s linear infinite' : 'none' }}></div>
                </div>
                {/* Floating UI Elements (Magnifying glass, Nodes) */}
                <div className="absolute -top-4 -right-8 text-3xl" style={{ animation: 'float 3s ease-in-out infinite reverse' }}>🔍</div>
                <div className="absolute -bottom-4 -left-8 text-3xl" style={{ animation: 'float 2.5s ease-in-out infinite' }}>⚙️</div>
              </div>
            </div>

            {/* SCENE 3: Go Global (Shipping to Shop) */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeStep === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative flex items-center w-full max-w-md justify-between px-10">
                {/* Cartoon Globe */}
                <div className="relative w-24 h-24 bg-blue-500 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-blue-300 rounded-full absolute -left-10" style={{ animation: activeStep === 2 ? 'orbit 4s linear infinite' : 'none' }}></div>
                  <div className="w-32 h-32 border-2 border-blue-300 rounded-full absolute -top-10" style={{ animation: activeStep === 2 ? 'orbit 6s linear infinite reverse' : 'none' }}></div>
                  🌍
                </div>

                {/* Flying Package */}
                <div className="absolute left-24 top-10 w-8 h-8 z-20" style={{ animation: activeStep === 2 ? 'shipPackage 2s ease-in-out infinite' : 'none' }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,15 90,35 50,55 10,35" fill="#E8C547" />
                    <polygon points="10,35 50,55 50,95 10,75" fill="#C9A020" />
                    <polygon points="50,55 90,35 90,75 50,95" fill="#F4D872" />
                  </svg>
                </div>

                {/* Cartoon Shop */}
                <div className="relative w-28 h-32 scene-enter">
                  <div className="absolute bottom-0 w-full h-20 bg-orange-100 border-2 border-slate-800 rounded-b-lg"></div>
                  {/* Shop Awning */}
                  <div className="absolute top-4 w-full h-10 flex border-2 border-slate-800 rounded-t-lg overflow-hidden">
                    <div className="flex-1 bg-red-400"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-red-400"></div>
                    <div className="flex-1 bg-white"></div>
                  </div>
                  {/* Door & Window */}
                  <div className="absolute bottom-0 left-3 w-8 h-12 bg-amber-800 border-2 border-slate-800 rounded-t-md"></div>
                  <div className="absolute bottom-4 right-3 w-10 h-8 bg-blue-200 border-2 border-slate-800 rounded-md"></div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🏪</div>
                </div>
              </div>
            </div>
          </div>

          {/* Story Captions / Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "📸", step: "01", title: "Snap or Upload", desc: "Take a photo or upload any image of a product you want to know about." },
              { icon: "🔍", step: "02", title: "Choose Your Query", desc: "Buy it, learn about it, or get full AI-powered production instructions." },
              { icon: "🌍", step: "03", title: "Go Global", desc: "Find verified suppliers worldwide and buy via trusted affiliate links." },
            ].map(({ icon, step, title, desc }, index) => (
              <div 
                key={step} 
                onClick={() => setActiveStep(index)}
                className={`p-8 bg-card border rounded-[20px] cursor-pointer transition-all duration-300 transform ${
                  activeStep === index 
                    ? "border-accent shadow-[0_0_20px_rgba(232,197,71,0.15)] -translate-y-2" 
                    : "border-border hover:border-accent/50 hover:-translate-y-1 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  {/* <div className={`text-4xl transition-transform duration-300 ${activeStep === index ? 'scale-110' : ''}`}>{icon}</div> */}
                  <div className="h-1 flex-1 mx-4 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-[4000ms] ease-linear"
                      style={{ width: activeStep === index ? '100%' : '0%' }}
                    />
                  </div>
                </div>
                <div className="text-xs font-black text-accent tracking-widest mb-2">STEP {step}</div>
                <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
