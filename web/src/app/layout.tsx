import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "MarketVerse — AI Startup Simulator",
  description:
    "What would happen if you launched your startup today? MarketVerse creates a living market of AI customers, competitors and investors — and runs 24 months in 60 seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full" style={{ background: "#0e1014", color: "#e8eaed" }}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
