import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import "./globals.css";

export const metadata = {
  title: "SnapSearch — Snap. Find. Buy.",
  description: "Upload any product image and instantly find where to buy it worldwide.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="grain">
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111111",
                color: "#f0ebe0",
                border: "1px solid #222222",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
