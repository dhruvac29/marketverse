import Link from "next/link";

const plans = [
  {
    tier: "STARTER",
    price: "Free",
    sub: "forever · no card required",
    cta: "Get started",
    ctaStyle: { border: "1px solid #2a2e38", color: "#e8eaed" } as React.CSSProperties,
    featured: false,
    features: [
      { yes: true, label: "1 simulation per month" },
      { yes: true, label: "5 customer personas" },
      { yes: true, label: "Basic 12-month run" },
      { yes: true, label: "Summary verdict report" },
      { yes: false, label: "Decision engine" },
      { yes: false, label: "Full market events" },
      { yes: false, label: "Export & share" },
    ],
  },
  {
    tier: "PRO",
    price: "$29",
    priceSub: "/month",
    sub: "billed monthly · cancel any time",
    cta: "Start Pro free for 14 days",
    ctaStyle: { background: "oklch(0.8 0.16 150)", color: "#0e1014" } as React.CSSProperties,
    featured: true,
    features: [
      { yes: true, label: "Unlimited simulations" },
      { yes: true, label: "20 customer personas" },
      { yes: true, label: "Full 24-month simulation" },
      { yes: true, label: "5 competitor agents" },
      { yes: true, label: "Decision engine" },
      { yes: true, label: "Full market events" },
      { yes: true, label: "Export & share reports" },
      { yes: false, label: "Team collaboration" },
      { yes: false, label: "API access" },
    ],
  },
  {
    tier: "TEAM",
    price: "$99",
    priceSub: "/month",
    sub: "up to 10 seats · annual billing saves 20%",
    cta: "Start Team trial",
    ctaStyle: { border: "1px solid #2a2e38", color: "#e8eaed" } as React.CSSProperties,
    featured: false,
    features: [
      { yes: true, label: "Everything in Pro" },
      { yes: true, label: "Up to 10 team seats" },
      { yes: true, label: "Shared simulation workspace" },
      { yes: true, label: "API access" },
      { yes: true, label: "Custom investor profiles" },
      { yes: true, label: "Priority support" },
      { yes: true, label: "SSO + audit log" },
    ],
  },
];

const faqs = [
  {
    q: "How is this different from asking ChatGPT about my startup?",
    a: "ChatGPT gives you static advice based on patterns. MarketVerse runs a living simulation where 20+ AI agents with distinct behaviors, budgets and biases interact over time. The results emerge from dynamics, not guesses.",
  },
  {
    q: "How accurate are the simulations?",
    a: "The simulations are calibrated against real market dynamics, but they're models — not predictions. The value is in identifying the levers that matter most, stress-testing your assumptions, and surfacing risks you hadn't considered. Think of it as a flight simulator, not a crystal ball.",
  },
  {
    q: "Can I use my own industry research or customer data?",
    a: "On the Team plan, yes — you can upload custom customer profiles and market data to seed the simulation. On Pro, the AI generates market archetypes based on your category and target market description.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes — 14-day free trial on Pro and Team, no questions asked. If the first simulation doesn't give you something useful to act on, we'll refund the first month.",
  },
];

export default function PricingPage() {
  return (
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#e8eaed", background: "#0e1014", minHeight: "100vh" }}>

      {/* HERO */}
      <div style={{ padding: "72px 64px 56px", textAlign: "center", borderBottom: "1px solid #1c1f27" }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.12em", color: "oklch(0.8 0.16 150)", marginBottom: 14 }}>PRICING</div>
        <h1 style={{ fontSize: 54, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>Simple, founder-friendly pricing</h1>
        <p style={{ fontSize: 18, color: "#9aa0ab", margin: "0 auto", maxWidth: 520 }}>Start free. Upgrade when the insights start paying for themselves — which usually happens on the first simulation.</p>
      </div>

      {/* PRICING CARDS */}
      <div style={{ padding: "64px 64px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
        {plans.map((plan) => (
          <div key={plan.tier} style={{ background: "#14171e", border: plan.featured ? "2px solid oklch(0.8 0.16 150)" : "1px solid #232730", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", position: "relative" }}>
            {plan.featured && (
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "oklch(0.8 0.16 150)", color: "#0e1014", padding: "5px 14px", borderRadius: 40, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>Most popular</div>
            )}
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.1em", color: plan.featured ? "oklch(0.8 0.16 150)" : "#6b7280", marginBottom: 12 }}>{plan.tier}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em" }}>{plan.price}</span>
              {plan.priceSub && <span style={{ fontSize: 16, color: "#9aa0ab" }}>{plan.priceSub}</span>}
            </div>
            <div style={{ fontSize: 13, color: "#9aa0ab", marginBottom: 28 }}>{plan.sub}</div>
            <Link href="/simulation" style={{ display: "block", padding: 13, borderRadius: 9, fontSize: 14, fontWeight: plan.featured ? 700 : 600, textAlign: "center", marginBottom: 28, ...plan.ctaStyle }}>{plan.cta}</Link>
            <div style={{ borderTop: "1px solid #1c1f27", paddingTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              {plan.features.map((f) => (
                <div key={f.label} style={{ display: "flex", gap: 10, fontSize: 14, color: f.yes ? (plan.featured ? "#e8eaed" : "#9aa0ab") : "#5b616b" }}>
                  <span style={{ color: f.yes ? "oklch(0.8 0.16 150)" : "#3a3e48", fontWeight: 700 }}>{f.yes ? "✓" : "✗"}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ padding: "0 64px 80px", maxWidth: 860, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", margin: "0 0 32px" }}>Frequently asked questions</h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((faq) => (
            <div key={faq.q} style={{ padding: "22px 0", borderTop: "1px solid #1c1f27" }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{faq.q}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#9aa0ab" }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 64px", borderTop: "1px solid #1c1f27" }}>
        <span style={{ fontSize: 13, color: "#5b616b" }}>© 2026 MarketVerse</span>
        <div style={{ display: "flex", gap: 28, fontSize: 13 }}>
          <Link href="/how-it-works" style={{ color: "#5b616b" }}>How it works</Link>
          <Link href="/docs" style={{ color: "#5b616b" }}>Docs</Link>
        </div>
      </div>
    </div>
  );
}
