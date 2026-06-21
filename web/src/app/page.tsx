import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#e8eaed", minHeight: "100vh", background: "#0e1014" }}>

      {/* HERO */}
      <div style={{ padding: "80px 64px 64px", background: "radial-gradient(110% 80% at 70% 0%, oklch(0.8 0.16 150 / 0.09), transparent 55%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 14px", border: "1px solid #232730", borderRadius: 40, marginBottom: 28 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "oklch(0.8 0.16 150)", boxShadow: "0 0 0 3px oklch(0.8 0.16 150 / 0.2)", display: "inline-block" }}></span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.08em", color: "oklch(0.8 0.16 150)" }}>AI-POWERED STARTUP SIMULATOR</span>
        </div>

        <h1 style={{ fontSize: 68, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 22px", maxWidth: 900 }}>
          What would happen if you launched your startup today?
        </h1>
        <p style={{ fontSize: 20, lineHeight: 1.55, color: "#9aa0ab", maxWidth: 600, margin: "0 0 36px" }}>
          MarketVerse creates a living market of AI customers, competitors and investors — and runs 24 months of reality in 60 seconds. Know what works before you build.
        </p>

        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 72 }}>
          <Link href="/simulation" style={{ padding: "14px 28px", borderRadius: 9, background: "oklch(0.8 0.16 150)", color: "#0e1014", fontSize: 15, fontWeight: 700 }}>
            Simulate my startup — free
          </Link>
          <Link href="/how-it-works" style={{ padding: "14px 28px", borderRadius: 9, border: "1px solid #2a2e38", color: "#e8eaed", fontSize: 15 }}>
            See how it works
          </Link>
        </div>

        {/* Product preview */}
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 14, overflow: "hidden", boxShadow: "0 40px 100px -30px rgba(0,0,0,.7)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 26px", borderBottom: "1px solid #232730" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "oklch(0.8 0.16 150)", color: "#0e1014", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>S</div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>SweetAI</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", marginLeft: 4 }}>AI OS for bakeries · $49/mo</span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "oklch(0.8 0.16 150)" }}>SIM COMPLETE · 24/24</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid #232730" }}>
            {[
              { label: "MRR", value: "$26.4k", sub: "▲ 10.3% MoM", subColor: "oklch(0.8 0.16 150)" },
              { label: "ARR", value: "$317k", sub: "▲ on track", subColor: "oklch(0.8 0.16 150)" },
              { label: "CUSTOMERS", value: "487", sub: "▲ +41 this mo", subColor: "oklch(0.8 0.16 150)" },
              { label: "CHURN", value: "4.2%", sub: "▲ watch this", subColor: "oklch(0.8 0.14 70)" },
            ].map((kpi, i) => (
              <div key={kpi.label} style={{ padding: "18px 26px", borderRight: i < 3 ? "1px solid #232730" : undefined }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}>{kpi.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: kpi.subColor, marginTop: 3 }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
            <div style={{ padding: "22px 26px", borderRight: "1px solid #232730" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Monthly Recurring Revenue</div>
              <svg viewBox="0 0 600 200" style={{ width: "100%", height: "auto", display: "block" }}>
                <defs>
                  <linearGradient id="idx-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="oklch(0.8 0.16 150)" stopOpacity={0.28} />
                    <stop offset="1" stopColor="oklch(0.8 0.16 150)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50" x2="600" y2="50" stroke="#232730" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#232730" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="#232730" />
                <path d="M0,175 L26,172 L52,167 L78,161 L104,153 L130,143 L157,131 L183,118 L209,113 L235,117 L261,104 L287,88 L313,72 L339,57 L365,51 L391,55 L417,44 L443,33 L470,24 L496,18 L522,13 L548,9 L574,7 L600,5 L600,195 L0,195 Z" fill="url(#idx-area)" />
                <polyline points="0,175 26,172 52,167 78,161 104,153 130,143 157,131 183,118 209,113 235,117 261,104 287,88 313,72 339,57 365,51 391,55 417,44 443,33 470,24 496,18 522,13 548,9 574,7 600,5" fill="none" stroke="oklch(0.82 0.16 150)" strokeWidth={2.5} strokeLinejoin="round" />
                <line x1="209" y1="20" x2="209" y2="195" stroke="oklch(0.8 0.14 70)" strokeWidth={1} strokeDasharray="4 3" />
                <line x1="391" y1="20" x2="391" y2="195" stroke="oklch(0.7 0.15 25)" strokeWidth={1} strokeDasharray="4 3" />
                <circle cx="600" cy="5" r="5" fill="oklch(0.82 0.16 150)" stroke="#14171e" strokeWidth={2} />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", marginTop: 8 }}>
                <span>M1</span><span>Downturn</span><span>Competitor</span><span>M24</span>
              </div>
            </div>

            <div style={{ padding: "22px 26px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Market events</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { border: "oklch(0.8 0.16 150)", title: "Viral TikTok · M24", sub: "+18 signups in 72h" },
                  { border: "oklch(0.7 0.15 25)", title: "CrumbStack $29/mo · M16", sub: "churn spike to 5.1%" },
                  { border: "oklch(0.8 0.14 70)", title: "Economic downturn · M9", sub: "acquisition −22%" },
                ].map((ev) => (
                  <div key={ev.title} style={{ borderLeft: `2px solid ${ev.border}`, paddingLeft: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: "#7b828d", marginTop: 2 }}>{ev.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <div style={{ display: "flex", alignItems: "center", gap: 40, padding: "20px 64px", borderTop: "1px solid #1c1f27", borderBottom: "1px solid #1c1f27", background: "#0b0d11" }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}>USED BY</span>
        <div style={{ display: "flex", gap: 40, fontSize: 14, fontWeight: 500, color: "#5b616b" }}>
          <span>2,400+ founders</span>
          <span>YC-backed teams</span>
          <span>11 industries simulated</span>
          <span>Powered by Claude AI</span>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "80px 64px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.12em", color: "oklch(0.8 0.16 150)", marginBottom: 14 }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 48px" }}>Four steps. Sixty seconds.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {[
            { n: "01", title: "Describe your startup", body: "Name, market, pricing, category. One paragraph is all it needs." },
            { n: "02", title: "Generate the market", body: "20 customer personas, 5 competitors, 3 investors — each an active AI agent." },
            { n: "03", title: "Run 24 months", body: "Revenue, churn, competitor moves and market events unfold in real time." },
            { n: "04", title: "Steer and re-run", body: "Change price, ship a feature, launch a campaign — futures recalculate instantly." },
          ].map((s) => (
            <div key={s.n} style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 26 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "oklch(0.8 0.16 150)", marginBottom: 14 }}>{s.n}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#9aa0ab" }}>{s.body}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/how-it-works" style={{ fontSize: 14, color: "oklch(0.8 0.16 150)" }}>Full breakdown of how it works →</Link>
        </div>
      </div>

      {/* THE ENGINE */}
      <div style={{ padding: "80px 64px", borderTop: "1px solid #1c1f27", background: "#0b0d11" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.12em", color: "oklch(0.8 0.16 150)", marginBottom: 14 }}>THE ENGINE</div>
            <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 18px" }}>A market that reacts.<br />Not a report that guesses.</h2>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "#9aa0ab", margin: "0 0 28px" }}>
              Every AI agent in your simulation has its own budget, behavior patterns and decision logic. They don&apos;t follow a script — they respond to you, each other, and the events the market throws at them.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { color: "oklch(0.8 0.16 150)", label: "Customer agents", desc: "evaluate your product, decide to buy, give feedback, churn when disappointed" },
                { color: "oklch(0.8 0.14 70)", label: "Competitor agents", desc: "watch your moves, adjust pricing, ship counter-features" },
                { color: "oklch(0.7 0.15 25)", label: "Investor agents", desc: "grade your traction and tell you whether they'd write the check" },
                { color: "#4b515c", label: "Market agent", desc: "booms, downturns, viral moments and regulations you can't predict" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, marginTop: 6, flexShrink: 0, display: "inline-block" }}></span>
                  <div style={{ fontSize: 15, lineHeight: 1.55 }}><strong>{item.label}</strong> — {item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 14, padding: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#9aa0ab", marginBottom: 16 }}>Investor panel</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#0e1014", border: "1px solid #232730", borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic", color: "#d4d8de" }}>&ldquo;Strong retention story for SMB. I&apos;d want CAC payback under 9 months before a seed check.&rdquo;</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "oklch(0.8 0.16 150)", marginTop: 10 }}>YC PARTNER · LEANING YES</div>
              </div>
              <div style={{ background: "#0e1014", border: "1px solid #232730", borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic", color: "#d4d8de" }}>&ldquo;Good margins, but the $29 competitor at month 16 worries me more than you think.&rdquo;</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "oklch(0.8 0.14 70)", marginTop: 10 }}>VENTURE CAPITALIST · NEUTRAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ padding: "96px 64px", textAlign: "center", borderTop: "1px solid #1c1f27", background: "radial-gradient(100% 140% at 50% 0%, oklch(0.8 0.16 150 / 0.1), transparent 60%)" }}>
        <h2 style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>Would your startup survive?</h2>
        <p style={{ fontSize: 19, color: "#9aa0ab", margin: "0 0 34px" }}>
          Find out in 60 seconds — before spending a year finding out the hard way.
        </p>
        <Link href="/simulation" style={{ display: "inline-block", padding: "16px 36px", borderRadius: 10, background: "oklch(0.8 0.16 150)", color: "#0e1014", fontSize: 16, fontWeight: 700 }}>
          Run my first simulation →
        </Link>
      </div>

      {/* FOOTER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 64px", borderTop: "1px solid #1c1f27" }}>
        <span style={{ fontSize: 13, color: "#5b616b" }}>© 2026 MarketVerse</span>
        <div style={{ display: "flex", gap: 28, fontSize: 13 }}>
          <Link href="/how-it-works" style={{ color: "#5b616b" }}>How it works</Link>
          <Link href="/pricing" style={{ color: "#5b616b" }}>Pricing</Link>
          <Link href="/docs" style={{ color: "#5b616b" }}>Docs</Link>
          <span style={{ color: "#5b616b" }}>Privacy</span>
          <span style={{ color: "#5b616b" }}>Terms</span>
        </div>
      </div>
    </div>
  );
}
