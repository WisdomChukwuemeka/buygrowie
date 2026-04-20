import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-[68px] flex items-center justify-center bg-bg px-6">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#e8c547",
            colorBackground: "#111111",
            colorText: "#f0ebe0",
            colorTextSecondary: "#888880",
            colorInputBackground: "#1a1a1a",
            colorInputText: "#f0ebe0",
            borderRadius: "12px",
            fontFamily: "DM Sans, sans-serif",
          },
          elements: {
            card: { border: "1px solid #222222", boxShadow: "none" },
            formButtonPrimary: { fontFamily: "Syne, sans-serif", fontWeight: "700" },
          },
        }}
      />
    </div>
  );
}
