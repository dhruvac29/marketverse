"use client";
import { useState } from "react";

type Section = "getting-started" | "first-sim" | "agents" | "decisions" | "events" | "api";

const nav: { id: Section; label: string }[] = [
  { id: "getting-started", label: "Getting Started" },
  { id: "first-sim", label: "Your First Simulation" },
  { id: "agents", label: "AI Agent Model" },
  { id: "decisions", label: "Decision Engine" },
  { id: "events", label: "Market Events" },
  { id: "api", label: "API Reference" },
];

export default function DocsPage() {
  const [section, setSection] = useState<Section>("getting-started");

  const navStyle = (id: Section) => ({
    display: "block" as const,
    padding: "9px 12px",
    borderRadius: 7,
    fontSize: 13.5,
    fontWeight: section === id ? 600 : 400,
    color: section === id ? "oklch(0.8 0.16 150)" : "#9aa0ab",
    background: section === id ? "oklch(0.8 0.16 150 / 0.1)" : "transparent",
    cursor: "pointer",
  });

  return (
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#e8eaed", background: "#0e1014", minHeight: "calc(100vh - 65px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - 65px)" }}>

        {/* SIDEBAR */}
        <div style={{ borderRight: "1px solid #1c1f27", padding: "32px 20px", position: "sticky", top: 65, height: "calc(100vh - 65px)", overflowY: "auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.12em", color: "#6b7280", marginBottom: 12, padding: "0 10px" }}>DOCUMENTATION</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {nav.map((n) => (
              <button key={n.id} onClick={() => setSection(n.id)} style={{ ...navStyle(n.id), border: "none", textAlign: "left", width: "100%" }}>{n.label}</button>
            ))}
          </div>
          <div style={{ marginTop: 28, borderTop: "1px solid #1c1f27", paddingTop: 20 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.12em", color: "#6b7280", marginBottom: 12, padding: "0 10px" }}>RESOURCES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["Changelog", "GitHub", "Pricing"].map((l) => (
                <span key={l} style={{ display: "block", padding: "8px 10px", borderRadius: 7, fontSize: 13, color: "#9aa0ab", cursor: "pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "48px 64px", maxWidth: 860 }}>

          {section === "getting-started" && (
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.1em", color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>GETTING STARTED</div>
              <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>Welcome to MarketVerse</h1>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "#9aa0ab", margin: "0 0 32px" }}>MarketVerse is an AI-powered startup simulation platform. You describe a startup idea, we build a living market of AI agents, and run 24 months of simulation in under a minute.</p>

              <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: "22px 26px", marginBottom: 32 }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>QUICK LINKS</div>
                {[{ id: "first-sim" as Section, label: "Your First Simulation" }, { id: "agents" as Section, label: "Understanding AI Agents" }, { id: "api" as Section, label: "API Reference" }].map((l) => (
                  <button key={l.id} onClick={() => setSection(l.id)} style={{ display: "block", fontSize: 14, color: "oklch(0.8 0.16 150)", cursor: "pointer", background: "none", border: "none", padding: "4px 0", textAlign: "left" }}>→ {l.label}</button>
                ))}
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 14px" }}>Core concepts</h2>
              {[
                { title: "Simulation", body: "A complete 24-month run of your startup idea inside a generated market. Each simulation produces a full report with revenue trajectory, customer metrics, competitor analysis, investor verdicts and a final recommendation." },
                { title: "Agent", body: "An AI-powered persona that makes independent decisions each month. Customer agents decide to buy or churn. Competitor agents adjust strategy. Investor agents evaluate traction. The market agent generates events." },
                { title: "Decision", body: "A mid-simulation intervention — changing price, shipping a feature, launching a campaign. After each decision, the simulation recalculates future outcomes from that month forward." },
              ].map((c) => (
                <div key={c.title} style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#9aa0ab" }}>{c.body}</div>
                </div>
              ))}
            </div>
          )}

          {section === "agents" && (
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.1em", color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>REFERENCE</div>
              <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>AI Agent Model</h1>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "#9aa0ab", margin: "0 0 32px" }}>MarketVerse uses four types of AI agents, each with distinct goals, behaviors and decision logic. All agents are powered by Claude and reason independently each month.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { color: "oklch(0.8 0.16 150)", name: "Customer Agent", desc: "Each of the 20 customer agents has a unique profile: industry, business size, annual revenue, budget, technical sophistication, pain points and buying behavior. Each month, they evaluate whether to buy, stay or churn based on your product, price and market context." },
                  { color: "oklch(0.8 0.14 70)", name: "Competitor Agent", desc: "Five competitor agents monitor your growth each month. When your MRR crosses their threat threshold, they react — dropping price, shipping counter-features, or launching marketing campaigns." },
                  { color: "oklch(0.7 0.15 25)", name: "Investor Agent", desc: "Three investor archetypes (YC Partner, Venture Capitalist, Angel Investor) evaluate your traction at months 6, 12 and 24. They assess MRR growth, churn rate, CAC payback and market size." },
                  { color: "#4b515c", name: "Market Agent", desc: "Generates macro events that affect all agents: economic downturns, AI adoption waves, new regulation, viral social media exposure, and industry disruptions. Events are probabilistic and calibrated to your market category." },
                ].map((a) => (
                  <div key={a.name} style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 26 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: a.color, display: "inline-block" }}></span>
                      <span style={{ fontSize: 17, fontWeight: 700 }}>{a.name}</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: "#9aa0ab", margin: 0 }}>{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "api" && (
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.1em", color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>API</div>
              <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>API Reference</h1>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "#9aa0ab", margin: "0 0 32px" }}>The MarketVerse API lets you run simulations programmatically. Available on Team plans.</p>

              <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #232730", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "3px 8px", borderRadius: 5, background: "oklch(0.8 0.16 150 / 0.2)", color: "oklch(0.8 0.16 150)", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600 }}>POST</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: "#e8eaed" }}>/v1/simulations</span>
                </div>
                <pre style={{ padding: 20, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, lineHeight: 1.7, color: "#9aa0ab", overflowX: "auto", margin: 0 }}>{`{
  "name": "SweetAI",
  "description": "AI OS for bakeries",
  "market": "Small food businesses",
  "pricing": "$49/month",
  "category": "SMB SaaS"
}`}</pre>
              </div>

              <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #232730" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "#6b7280" }}>Response 200</span>
                </div>
                <pre style={{ padding: 20, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, lineHeight: 1.7, color: "#9aa0ab", overflowX: "auto", margin: 0 }}>{`{
  "sim_id": "sim_7f3a2024",
  "status": "generating"
}`}</pre>
              </div>

              <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #232730", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "3px 8px", borderRadius: 5, background: "oklch(0.8 0.16 150 / 0.1)", color: "oklch(0.8 0.16 150)", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600 }}>GET</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: "#e8eaed" }}>/v1/simulations/{"{sim_id}"}/stream</span>
                </div>
                <pre style={{ padding: 20, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, lineHeight: 1.7, color: "#9aa0ab", overflowX: "auto", margin: 0 }}>{`# Server-Sent Events stream
event: persona_added
data: {"name": "Maria Chen", "adoption_score": 87, ...}

event: month
data: {"month": 1, "mrr": 0.4, "customers": 8, ...}

event: simulation_complete
data: {"headline": "Likely viable...", ...}`}</pre>
              </div>
            </div>
          )}

          {(section === "first-sim" || section === "decisions" || section === "events") && (
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.1em", color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>
                {section === "first-sim" ? "GUIDE" : "REFERENCE"}
              </div>
              <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
                {section === "first-sim" ? "Your first simulation" : section === "decisions" ? "Decision Engine" : "Market Events"}
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "#9aa0ab", margin: "0 0 32px" }}>
                {section === "first-sim"
                  ? "From startup idea to full market report in five minutes."
                  : section === "decisions"
                  ? "Intervene at any point in the simulation and see how a strategic choice reshapes the next months. Available on Pro and Team plans."
                  : "The market agent generates probabilistic events that hit at unpredictable times — just like the real world."}
              </p>
              <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: "22px 26px" }}>
                <div style={{ fontSize: 14, color: "#9aa0ab" }}>Full documentation coming soon. <button onClick={() => setSection("getting-started")} style={{ color: "oklch(0.8 0.16 150)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>← Back to Getting Started</button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
