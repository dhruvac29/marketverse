"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/simulation", label: "Simulation" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 64px",
        borderBottom: "1px solid #1c1f27",
        background: "#0e1014",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 10, color: "#e8eaed" }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "oklch(0.8 0.16 150)",
            color: "#0e1014",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          M
        </div>
        <span style={{ fontWeight: 700, fontSize: 17 }}>MarketVerse</span>
      </Link>

      <div style={{ display: "flex", gap: 32, fontSize: 14 }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: pathname === l.href ? "#e8eaed" : "#9aa0ab",
              fontWeight: pathname === l.href ? 600 : 400,
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <Link
        href="/simulation"
        style={{
          padding: "9px 20px",
          borderRadius: 8,
          background: "oklch(0.8 0.16 150)",
          color: "#0e1014",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Run a simulation →
      </Link>
    </div>
  );
}
