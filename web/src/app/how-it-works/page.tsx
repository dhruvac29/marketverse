import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#e8eaed", background: "#0e1014", minHeight: "100vh" }}>

      {/* HERO */}
      <div style={{ padding: "72px 64px 56px", borderBottom: "1px solid #1c1f27" }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.12em", color: "oklch(0.8 0.16 150)", marginBottom: 14 }}>HOW IT WORKS</div>
        <h1 style={{ fontSize: 58, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 18px", maxWidth: 860 }}>Everything that happens inside MarketVerse</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#9aa0ab", maxWidth: 640, margin: 0 }}>From a one-line idea to a 24-month market simulation with real AI agents, live events, and a clear verdict on whether your startup would succeed.</p>
      </div>

      {/* STEP 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", padding: "72px 64px", borderBottom: "1px solid #1c1f27" }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>STEP 01</div>
          <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px" }}>Describe your startup</h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "#9aa0ab", margin: "0 0 24px" }}>Give MarketVerse the basics: your startup name, what it does, who it&apos;s for, how you price it, and what category it sits in. A paragraph is enough — the AI fills in the nuance.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#9aa0ab" }}>
            {["Startup name + one-line description", "Target market and customer segment", "Pricing model and monthly price", "Business category"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 10 }}><span style={{ color: "oklch(0.8 0.16 150)" }}>→</span>{item}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 14, padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#9aa0ab", marginBottom: 20 }}>Startup details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "STARTUP NAME", value: "SweetAI", style: { fontSize: 15, fontWeight: 500 } },
              { label: "DESCRIPTION", value: "AI-powered operating system for sweet shops and bakeries", style: { fontSize: 14, color: "#9aa0ab", lineHeight: 1.5 } },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.06em" }}>{f.label}</div>
                <div style={{ background: "#0e1014", border: "1px solid #232730", borderRadius: 8, padding: "12px 14px", ...f.style }}>{f.value}</div>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[{ label: "TARGET MARKET", value: "Small food businesses" }, { label: "PRICING", value: "$49 / month" }].map((f) => (
                <div key={f.label}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.06em" }}>{f.label}</div>
                  <div style={{ background: "#0e1014", border: "1px solid #232730", borderRadius: 8, padding: "12px 14px", fontSize: 14 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <Link href="/simulation" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 13, borderRadius: 9, background: "oklch(0.8 0.16 150)", color: "#0e1014", fontSize: 14, fontWeight: 700 }}>Generate market →</Link>
          </div>
        </div>
      </div>

      {/* STEP 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start", padding: "72px 64px", borderBottom: "1px solid #1c1f27", background: "#0b0d11" }}>
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #232730", fontSize: 13, fontWeight: 600 }}>Generated customers <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.8 0.16 150)", marginLeft: 10 }}>20 personas</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[
              { name: "Maria Chen", role: "Artisan Bakery · $200/mo budget", score: 87, color: "oklch(0.8 0.16 150)" },
              { name: "Priya Patel", role: "Patisserie Founder · $300/mo", score: 91, color: "oklch(0.8 0.16 150)" },
              { name: "James O'Brien", role: "Café Chain Manager · $450/mo", score: 72, color: "oklch(0.8 0.14 70)" },
              { name: "Tom Wheeler", role: "Street Vendor · $40/mo budget", score: 45, color: "#4b515c" },
              { name: "Mei Zhang", role: "Upscale Confectionery · $500/mo", score: 88, color: "oklch(0.8 0.16 150)" },
            ].map((p, i) => (
              <div key={p.name} style={{ padding: "14px 18px", borderRight: i % 2 === 0 ? "1px solid #232730" : undefined, borderBottom: i < 4 ? "1px solid #232730" : undefined }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#9aa0ab", marginTop: 2 }}>{p.role}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "#232730", borderRadius: 2 }}>
                    <div style={{ width: `${p.score}%`, height: "100%", background: p.color, borderRadius: 2 }}></div>
                  </div>
                  <span style={{ fontSize: 11, color: p.color }}>{p.score}</span>
                </div>
              </div>
            ))}
            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>+ 15 more personas</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>varying budgets &amp; adoption scores</div>
              <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "oklch(0.8 0.16 150)" }}>AVG SCORE: 73 / 100</div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>STEP 02</div>
          <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px" }}>Generate the market</h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "#9aa0ab", margin: "0 0 24px" }}>MarketVerse builds 20 customer archetypes based on your target market — each with a name, age, business profile, budget, technical sophistication and adoption score. Plus 5 competitors and 3 investor personas, all powered by live AI reasoning.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#9aa0ab" }}>
            {["20 customer personas with adoption scores 0–100", "5 competitor profiles with pricing and strengths", "3 investor archetypes (YC, VC, Angel)", "Market sentiment baseline calibrated to your category"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 10 }}><span style={{ color: "oklch(0.8 0.16 150)" }}>→</span>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* VERDICT */}
      <div style={{ padding: "72px 64px", borderBottom: "1px solid #1c1f27", textAlign: "center", background: "radial-gradient(100% 120% at 50% 0%, oklch(0.8 0.16 150 / 0.08), transparent 55%)" }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.12em", color: "oklch(0.8 0.16 150)", marginBottom: 14 }}>THE OUTPUT</div>
        <h2 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>A verdict. Not a vague summary.</h2>
        <p style={{ fontSize: 18, color: "#9aa0ab", maxWidth: 560, margin: "0 auto 36px" }}>At the end of every simulation MarketVerse delivers a plain-language verdict with evidence: why the startup succeeds or fails, what the key risks are, and what one move changes the outcome the most.</p>
        <div style={{ display: "inline-block", background: "#14171e", border: "1px solid #232730", borderRadius: 14, padding: "28px 36px", textAlign: "left", maxWidth: 640 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.8 0.16 150)", marginBottom: 10 }}>VERDICT — SWEETAI — 24-MONTH SIMULATION</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "oklch(0.82 0.16 150)" }}>Likely viable — fix churn before month 18.</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: "#9aa0ab" }}>SweetAI reaches <strong style={{ color: "#e8eaed" }}>$317k ARR</strong> with strong word-of-mouth, but the $29 competitor at month 16 exposes a retention gap. The simulation survives on loyalty. Add an annual plan or mobile app before the competitive window closes.</div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "80px 64px", textAlign: "center" }}>
        <h2 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>Ready to run yours?</h2>
        <p style={{ fontSize: 18, color: "#9aa0ab", margin: "0 0 32px" }}>It takes 60 seconds.</p>
        <Link href="/simulation" style={{ display: "inline-block", padding: "15px 34px", borderRadius: 10, background: "oklch(0.8 0.16 150)", color: "#0e1014", fontSize: 16, fontWeight: 700 }}>Simulate my startup →</Link>
      </div>

      {/* FOOTER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 64px", borderTop: "1px solid #1c1f27" }}>
        <span style={{ fontSize: 13, color: "#5b616b" }}>© 2026 MarketVerse</span>
        <div style={{ display: "flex", gap: 28, fontSize: 13 }}>
          <Link href="/pricing" style={{ color: "#5b616b" }}>Pricing</Link>
          <Link href="/docs" style={{ color: "#5b616b" }}>Docs</Link>
        </div>
      </div>
    </div>
  );
}
