export default function ComingSoon() {
  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      fontFamily: "sans-serif",
    }}>
      <img
        src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80"
        alt="Shop"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#fff",
        gap: 16,
        padding: "2rem",
      }}>
        <p style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", margin: 0 }}>
          We&apos;re almost ready
        </p>
        <h1 style={{ fontSize: 56, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
          Coming Soon
        </h1>
        <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.4)" }} />
        <p style={{ fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.75)", maxWidth: 320, lineHeight: 1.7, margin: 0 }}>
          Something beautiful is on its way. Stay tuned — we&apos;ll be opening our doors very soon.
        </p>
      </div>
    </div>
  );
}