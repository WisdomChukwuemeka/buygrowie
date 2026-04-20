export default function AboutPage() {
  return (
    <div className="min-h-screen pt-[68px]">
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold text-accent mb-6"
            style={{ background: "rgba(232,197,71,0.08)", borderColor: "rgba(232,197,71,0.2)" }}>
            Our Mission
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter mb-6 leading-none">
            The world's products,<br />one snap away
          </h1>
          <p className="text-secondary text-lg leading-relaxed mb-5">
            SnapSearch was built with one simple belief: you shouldn't need to know the name of something to find it, buy it, or understand it. A photo should be enough.
          </p>
          <p className="text-secondary text-lg leading-relaxed">
            Whether you spotted a product in a store, saw something in a video, or want to know how that food you ate last night was produced — SnapSearch gives you the full picture in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {[
            { icon: "🌍", label: "Global Reach", desc: "Suppliers from every continent, connected through trusted affiliate networks." },
            { icon: "🤖", label: "AI-Powered", desc: "Claude AI analyzes your image with precision — identifying products, brands, and categories instantly." },
            { icon: "🔒", label: "Secure Payments", desc: "All transactions go through Paystack, the most trusted payment gateway in Africa." },
            { icon: "📚", label: "Knowledge Engine", desc: "Not just where to buy — we tell you what it is, where it came from, and how it's made." },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="p-6 bg-card border border-border rounded-xl">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="font-bold mb-2">{label}</div>
              <div className="text-secondary text-sm leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        <div className="p-10 bg-card border border-border rounded-[20px] text-center">
          <h2 className="text-2xl font-display font-black mb-3">Built for Africa, used worldwide</h2>
          <p className="text-secondary text-sm leading-relaxed">
            Headquartered in Nigeria with Paystack integration, SnapSearch is designed for the African market while connecting you to global suppliers on Amazon, AliExpress, eBay, and beyond.
          </p>
        </div>
      </section>
    </div>
  );
}
