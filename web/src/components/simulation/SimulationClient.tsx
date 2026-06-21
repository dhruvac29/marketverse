"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { createSimulation, connectSimulationStream } from "@/lib/sse";
import type {
  StartupInput, CustomerPersona, Competitor, Investor,
  MonthData, MarketEvent, Verdict, AIRecommendation,
  ImmediateAction, Evidence,
} from "@/lib/types";

type SimStep = "form" | "generating" | "running" | "results";

interface SimState {
  step: SimStep;
  simId: string | null;
  startup: StartupInput;
  personas: CustomerPersona[];
  competitors: Competitor[];
  investors: Investor[];
  months: MonthData[];
  events: MarketEvent[];
  currentMonth: number;
  genProgress: number;
  genStage: string;
  verdict: Verdict | null;
  showDecision: boolean;
  appliedDecision: string | null;   // label of the last applied decision
  error: string | null;
}

const DEMO_PERSONAS: CustomerPersona[] = [
  { name: "Maria Chen", age: 38, role: "Artisan Bakery Owner", industry: "Food & Beverage", business_size: "Small", annual_revenue: "$180k", budget: 200, tech_score: 72, pain_points: ["Inventory tracking", "Order management"], buying_behavior: "Research-heavy", adoption_score: 87 },
  { name: "Priya Patel", age: 31, role: "Patisserie Founder", industry: "Food & Beverage", business_size: "Small", annual_revenue: "$320k", budget: 300, tech_score: 85, pain_points: ["Analytics", "Supplier ordering"], buying_behavior: "Early adopter", adoption_score: 91 },
  { name: "James O'Brien", age: 45, role: "Café Chain Manager", industry: "Food & Beverage", business_size: "Medium", annual_revenue: "$1.2M", budget: 450, tech_score: 61, pain_points: ["Multi-location sync", "Staff scheduling"], buying_behavior: "Committee-driven", adoption_score: 72 },
  { name: "Mei Zhang", age: 34, role: "Upscale Confectionery", industry: "Retail", business_size: "Small", annual_revenue: "$480k", budget: 500, tech_score: 79, pain_points: ["Custom orders", "Loyalty program"], buying_behavior: "Value-focused", adoption_score: 88 },
];

const DEMO_COMPETITORS: Competitor[] = [
  { name: "CrumbStack", description: "Basic POS for bakeries", price: "$29/mo", strengths: ["Price", "Simplicity"], weaknesses: ["No AI", "Limited analytics"], market_position: "Budget leader", threat_level: "HIGH" },
  { name: "BakeOS", description: "Full bakery management suite", price: "$59/mo", strengths: ["Features", "Integrations"], weaknesses: ["Complex", "Slow support"], market_position: "Enterprise", threat_level: "MED" },
  { name: "SugarPOS", description: "Point of sale for sweet shops", price: "$39/mo", strengths: ["UI/UX", "Mobile app"], weaknesses: ["No AI", "Weak reporting"], market_position: "Mid-market", threat_level: "MED" },
];

const DEMO_MRR = [0.4,0.9,1.6,2.5,3.6,5.0,6.8,8.5,9.2,8.8,10.5,12.8,15.0,17.2,18.1,17.5,18.9,20.8,22.5,23.9,24.8,25.6,26.1,26.4];
const DEMO_CUSTOMERS = [8,19,35,57,85,120,162,205,221,210,248,291,334,374,389,373,399,432,459,476,480,484,486,487];
const DEMO_EVENTS: Record<number, MarketEvent> = {
  4:  { month: 4,  type: "tailwind",   text: "AI adoption tailwind — SMB interest rising",   impact: "+12% acquisition",   color: "oklch(0.8 0.16 150)" },
  9:  { month: 9,  type: "downturn",   text: "Economic downturn — SMB budgets tighten",       impact: "−22% acquisition",   color: "oklch(0.8 0.14 70)"  },
  16: { month: 16, type: "competitor", text: "CrumbStack enters at $29/mo — churn spike",     impact: "Churn → 5.1%",       color: "oklch(0.7 0.15 25)"  },
  20: { month: 20, type: "tailwind",   text: "Product-led growth kicks in — referrals up",   impact: "+18% retention",     color: "oklch(0.8 0.16 150)" },
  24: { month: 24, type: "viral",      text: "Viral TikTok post — +18 signups in 72h",       impact: "+18 customers",      color: "oklch(0.8 0.16 150)" },
};

const STAGES = [
  "Analyzing market landscape…",
  "Generating 20 customer personas…",
  "Building 5 competitor profiles…",
  "Initializing 3 investor agents…",
  "Calibrating market conditions…",
];

function fmtMRR(v: number) {
  if (v >= 1) return `$${v.toFixed(1)}k`;
  if (v > 0) return `$${Math.round(v * 1000)}`;
  return "$0";
}

function threatColor(t: string) {
  if (t === "HIGH") return "oklch(0.7 0.15 25)";
  if (t === "MED") return "oklch(0.8 0.14 70)";
  return "#4b515c";
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, subColor }: { label: string; value: string; sub?: string; subColor?: string }) {
  return (
    <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: "18px 22px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor ?? "oklch(0.8 0.16 150)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function fmtYAxis(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}M`;
  if (v >= 1)    return `$${v.toFixed(0)}k`;
  if (v > 0)     return `$${(v * 1000).toFixed(0)}`;
  return "$0";
}

function MRRChart({ months }: { months: MonthData[] }) {
  const data = months.map((m) => ({ month: m.month, mrr: m.mrr }));
  const maxMRR = Math.max(...months.map((m) => m.mrr), 1);
  // Round up to a clean ceiling (next multiple of 5k or 10k)
  const step = maxMRR > 50 ? 50 : maxMRR > 20 ? 10 : maxMRR > 10 ? 5 : maxMRR > 2 ? 2 : 0.5;
  const yMax = Math.ceil(maxMRR / step) * step;
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map((v) => parseFloat(v.toFixed(2)));

  // Use real events from months data, fallback to demo events for gaps
  const realEventMonths = months.flatMap((m) => m.events.map((e) => ({ month: m.month, color: e.color })));

  return (
    <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Monthly Recurring Revenue</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280" }}>
          {months.length > 0 ? `PEAK $${Math.max(...months.map(m=>m.mrr)).toFixed(1)}k` : "24-MONTH TARGET"}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 46, bottom: 0 }}>
          <defs>
            <linearGradient id="mrr-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.8 0.16 150)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="oklch(0.8 0.16 150)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" hide />
          <YAxis
            domain={[0, yMax]}
            ticks={yTicks}
            tickFormatter={fmtYAxis}
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          {realEventMonths.map((ev, i) => (
            <ReferenceLine
              key={`${ev.month}-${i}`}
              x={ev.month}
              stroke={ev.color}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          ))}
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="oklch(0.82 0.16 150)"
            strokeWidth={2.5}
            fill="url(#mrr-grad)"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 4, fill: "oklch(0.82 0.16 150)", stroke: "#14171e", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", marginTop: 8, paddingLeft: 46 }}>
        <span>M1</span><span>M6</span><span>M12</span><span>M18</span><span>M24</span>
      </div>
    </div>
  );
}

function EventFeed({ events }: { events: MarketEvent[] }) {
  return (
    <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Market events</div>
      {events.length === 0 ? (
        <div style={{ fontSize: 13, color: "#4b515c", fontStyle: "italic" }}>Awaiting events…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((ev) => (
            <div key={`${ev.month}-${ev.type}`} style={{ borderLeft: `2px solid ${ev.color}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{ev.text}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", marginTop: 3 }}>MONTH {ev.month}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// State screens
// ──────────────────────────────────────────────────────────────────────────────

function FormState({ startup, onChange, onSubmit }: {
  startup: StartupInput;
  onChange: (f: keyof StartupInput, v: string) => void;
  onSubmit: () => void;
}) {
  const fields: { key: keyof StartupInput; label: string; placeholder: string; multi?: boolean }[] = [
    { key: "name", label: "STARTUP NAME", placeholder: "e.g. SweetAI" },
    { key: "description", label: "DESCRIPTION", placeholder: "What does it do? Who is it for?", multi: true },
    { key: "market", label: "TARGET MARKET", placeholder: "e.g. Small food businesses" },
    { key: "pricing", label: "PRICING MODEL", placeholder: "e.g. $49/month" },
    { key: "category", label: "BUSINESS CATEGORY", placeholder: "e.g. SMB SaaS, Consumer App, Marketplace…" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 65px)", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 660 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.12em", color: "oklch(0.8 0.16 150)", marginBottom: 12 }}>NEW SIMULATION</div>
          <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 12px" }}>Describe your startup</h1>
          <p style={{ fontSize: 16, color: "#9aa0ab", margin: 0 }}>We&apos;ll build a living market and run 24 months in 60 seconds.</p>
        </div>

        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 16, padding: 36, display: "flex", flexDirection: "column", gap: 20 }}>
          {fields.map((f) => (
            <div key={f.key}>
              <label style={{ display: "block", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", marginBottom: 8 }}>{f.label}</label>
              {f.multi ? (
                <textarea
                  value={startup[f.key]}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  style={{ width: "100%", background: "#0e1014", border: "1px solid #2a2e38", borderRadius: 9, padding: "13px 16px", fontSize: 15, color: "#e8eaed", lineHeight: 1.5, resize: "vertical" }}
                />
              ) : (
                <input
                  type="text"
                  value={startup[f.key]}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: "#0e1014", border: "1px solid #2a2e38", borderRadius: 9, padding: "13px 16px", fontSize: 15, color: "#e8eaed" }}
                />
              )}
            </div>
          ))}

          <button
            onClick={onSubmit}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 10, background: "oklch(0.8 0.16 150)", color: "#0e1014", fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none", marginTop: 4, width: "100%" }}
          >
            Run simulation →
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>Pre-filled with SweetAI as an example — edit freely or run as-is.</div>
      </div>
    </div>
  );
}

function GeneratingState({ progress, stage, personas, competitors, investors }: {
  progress: number;
  stage: string;
  personas: CustomerPersona[];
  competitors: Competitor[];
  investors: Investor[];
}) {
  return (
    <div style={{ padding: "48px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{stage}</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: "oklch(0.8 0.16 150)" }}>{Math.round(progress)}%</div>
      </div>
      <div style={{ height: 6, background: "#1c1f27", borderRadius: 3, marginBottom: 40 }}>
        <div style={{ height: "100%", background: "oklch(0.8 0.16 150)", borderRadius: 3, width: `${progress}%`, transition: "width 0.08s linear" }}></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Customer personas</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.8 0.16 150)" }}>{personas.length} / 20</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {personas.map((p) => (
              <div key={p.name} style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 10, padding: 14, animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#9aa0ab", marginBottom: 10 }}>{p.role}</div>
                <div style={{ height: 4, background: "#232730", borderRadius: 2 }}>
                  <div style={{ width: `${p.adoption_score}%`, height: "100%", background: p.adoption_score >= 80 ? "oklch(0.8 0.16 150)" : p.adoption_score >= 60 ? "oklch(0.8 0.14 70)" : "#4b515c", borderRadius: 2 }}></div>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280", marginTop: 5 }}>Adoption: {p.adoption_score}/100</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Competitors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {competitors.map((c) => (
                <div key={c.name} style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#9aa0ab", marginTop: 2 }}>{c.price}</div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.06em", color: threatColor(c.threat_level) }}>{c.threat_level}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Investors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {investors.map((inv) => (
                <div key={inv.name} style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.name}</div>
                  <div style={{ fontSize: 11, color: "#9aa0ab", marginTop: 2 }}>{inv.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RunningState({ months, events, currentMonth, startupName }: {
  months: MonthData[];
  events: MarketEvent[];
  currentMonth: number;
  startupName: string;
}) {
  const latest = months[months.length - 1];
  const mrr = latest?.mrr ?? 0;
  const churn = currentMonth >= 16 ? "5.1%" : currentMonth >= 9 ? "3.8%" : "3.2%";

  return (
    <div style={{ padding: "32px 64px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.8 0.16 150)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "oklch(0.8 0.16 150)", boxShadow: "0 0 0 3px oklch(0.8 0.16 150 / 0.2)", display: "inline-block" }}></span>
          SIMULATING — {startupName.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: "#9aa0ab" }}>MONTH {currentMonth} / 24</div>
      </div>
      <div style={{ height: 5, background: "#1c1f27", borderRadius: 3, marginBottom: 28 }}>
        <div style={{ height: "100%", background: "oklch(0.8 0.16 150)", borderRadius: 3, width: `${(currentMonth / 24) * 100}%`, transition: "width 0.2s linear" }}></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard label="MRR" value={fmtMRR(mrr)} />
        <KPICard label="ARR PROJ." value={mrr > 0 ? `$${Math.round(mrr * 12)}k` : "$0"} />
        <KPICard label="CUSTOMERS" value={String(latest?.customers ?? 0)} />
        <KPICard label="CHURN" value={churn} subColor="oklch(0.8 0.14 70)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <MRRChart months={months} />
        <EventFeed events={events} />
      </div>
    </div>
  );
}

interface DecisionOption {
  id: string;
  label: string;
  desc: string;
  impact: string;
  modifiedStartup: StartupInput;
}

function ResultsState({ months, events, verdict, startupName, startup, competitors, investors, showDecision, onToggleDecision, onApplyDecision, onRestart }: {
  months: MonthData[];
  events: MarketEvent[];
  verdict: Verdict | null;
  startupName: string;
  startup: StartupInput;
  competitors: Competitor[];
  investors: Investor[];
  showDecision: boolean;
  onToggleDecision: () => void;
  onApplyDecision: (modified: StartupInput, label: string) => void;
  onRestart: () => void;
}) {
  const latest = months[months.length - 1];
  const mrr = latest?.mrr ?? 0;
  const customers = latest?.customers ?? 0;
  // Real churn from last month data
  const churnRate = latest?.churn_rate ?? 0;
  const churnDisplay = churnRate > 0 ? `${(churnRate * 100).toFixed(1)}%` : "—";

  // 3-month rolling MoM average (avoids single-month spikes)
  const rollingMonths = months.slice(-4);
  const momGrowth = (() => {
    if (rollingMonths.length < 2) return "▲ growing";
    const first = rollingMonths[0].mrr;
    const last = rollingMonths[rollingMonths.length - 1].mrr;
    if (first <= 0) return "▲ growing";
    const periods = rollingMonths.length - 1;
    const avgMoM = ((last / first) ** (1 / periods) - 1) * 100;
    return `▲ ${avgMoM.toFixed(1)}% MoM avg`;
  })();

  // Retention: 1 - avg_churn annualised
  const avgChurn = months.length > 0
    ? months.reduce((s, m) => s + m.churn_rate, 0) / months.length
    : 0;
  const retention12m = Math.round((1 - avgChurn) ** 12 * 100);

  // New customers last month
  const lastNewCustomers = latest?.new_customers ?? 0;

  // Interactive decision selection
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  // Derive decision options with modified startup params for re-simulation
  const priceNum = parseFloat(startup.pricing.replace(/[^0-9.]/g, "")) || 49;
  const annualPrice = Math.round(priceNum * 10);
  const lowerPrice = Math.round(priceNum * 0.8);

  const decisions: DecisionOption[] = [
    {
      id: "annual",
      label: `Annual plan at $${annualPrice}/yr`,
      desc: `Lock customers in with annual billing. Reduces monthly churn and improves cash flow.`,
      impact: "−1.5pt churn · +14% retention",
      modifiedStartup: {
        ...startup,
        pricing: `$${annualPrice}/year (annual plan)`,
        description: startup.description + ` The company now offers annual billing at $${annualPrice}/year (saving 2 months vs monthly). This significantly improves retention as customers commit upfront.`,
      },
    },
    {
      id: "lower_price",
      label: `Lower price to $${lowerPrice}/mo`,
      desc: `Cut price to undercut competitors. Acquisition improves but margins tighten.`,
      impact: "−20% MRR short term · +30% acquisition",
      modifiedStartup: {
        ...startup,
        pricing: `$${lowerPrice}/month`,
        description: startup.description + ` Pricing has been reduced to $${lowerPrice}/month to compete more aggressively against lower-cost competitors and accelerate customer acquisition.`,
      },
    },
    {
      id: "mobile",
      label: "Ship mobile app",
      desc: `3-month build delay, then churn drops as field workers can use the product on-site.`,
      impact: "−1.2pt churn after M3 · +adoption",
      modifiedStartup: {
        ...startup,
        description: startup.description + " A dedicated mobile app is being built (launching in 3 months) that allows managers to handle scheduling from their phones. This addresses the top pain point for on-the-go restaurant owners and significantly improves retention.",
      },
    },
    {
      id: "expand",
      label: "Expand to adjacent market",
      desc: `Open the product to retail stores and salons — lower churn, larger TAM.`,
      impact: "+22% TAM · lower churn segment",
      modifiedStartup: {
        ...startup,
        market: startup.market + ", retail stores, salons, gyms, and other shift-based small businesses",
        description: startup.description + " The platform is now expanding beyond its original niche to serve retail stores, salons, and gyms — all of which share the same scheduling pain points but have lower closure rates, improving overall retention.",
      },
    },
  ];

  // Real recommendations from Claude Opus (or sensible fallback)
  const recommendations: AIRecommendation[] = verdict?.recommendations?.length
    ? verdict.recommendations
    : [
        { priority: "high", title: `Launch annual plan at $${annualPrice}/yr`, detail: "Reduces churn and improves cash flow. Offer a 2-month discount to drive annual conversions.", impact: "−1.5pt churn" },
        { priority: "high", title: "Accelerate acquisition", detail: "Current growth rate is below venture scale. Add referral incentives and partnership channels.", impact: "+40% new logos" },
        { priority: "medium", title: "Increase ARPU with tiered pricing", detail: `Flat $${priceNum}/month leaves upsell revenue on the table. Add a premium tier at $${Math.round(priceNum * 1.8)}/month.`, impact: "+30% ARPU" },
      ];

  // Real competitor data from simulation — threat level → bar width/color
  const threatConfig: Record<string, { pct: number; color: string }> = {
    HIGH: { pct: 82, color: "oklch(0.7 0.15 25)" },
    MED:  { pct: 48, color: "oklch(0.8 0.14 70)" },
    LOW:  { pct: 24, color: "#4b515c" },
  };
  const competitorDisplay = competitors.length > 0 ? competitors : DEMO_COMPETITORS;

  // Real investor data — map archetype to verdict color
  const verdictColor: Record<string, string> = {
    yes:         "oklch(0.8 0.16 150)",
    leaning_yes: "oklch(0.8 0.16 150)",
    neutral:     "oklch(0.8 0.14 70)",
    leaning_no:  "oklch(0.7 0.15 25)",
    no:          "oklch(0.7 0.15 25)",
  };
  // Investor feedback is embedded in months data at checkpoints (6, 12, 24)
  const investorFeedback = months
    .flatMap((m) => m.investor_feedback ?? [])
    .filter(Boolean);

  // Fallback display investors using the real generated names/roles
  const investorDisplay = investors.length > 0 ? investors : [
    { name: "Alex Chen", role: "YC Partner", archetype: "yc_partner" as const, focus: "Seed" },
    { name: "Sarah Mitchell", role: "Venture Capitalist", archetype: "vc" as const, focus: "Series A" },
    { name: "David Park", role: "Angel Investor", archetype: "angel" as const, focus: "Pre-seed" },
  ];

  return (
    <div style={{ padding: "48px 64px" }}>

      {/* Verdict banner */}
      <div style={{ background: "oklch(0.8 0.16 150 / 0.08)", border: "1px solid oklch(0.8 0.16 150 / 0.3)", borderRadius: 14, padding: "32px 36px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: "0.1em", color: "oklch(0.8 0.16 150)", marginBottom: 10 }}>SIMULATION COMPLETE · {startupName.toUpperCase()} · 24 MONTHS</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "oklch(0.84 0.16 150)" }}>{verdict?.headline ?? "Likely viable — fix churn before month 18."}</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: "#9aa0ab", marginTop: 10, maxWidth: 720 }}>
              {verdict?.summary ?? <>SweetAI reaches <strong style={{ color: "#e8eaed" }}>${Math.round(mrr * 12)}k ARR</strong> with strong word-of-mouth, but the $29 competitor at month 16 exposes a retention gap. Add an annual plan or mobile app before the competitive window closes.</>}
            </div>
          </div>
          <button
            onClick={onToggleDecision}
            style={{ padding: "13px 20px", borderRadius: 10, background: "oklch(0.8 0.16 150)", color: "#0e1014", fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", whiteSpace: "nowrap", flexShrink: 0, marginLeft: 32 }}
          >
            Make a decision →
          </button>
        </div>
      </div>

      {/* ── Confidence + Immediate Actions + Evidence ─────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Confidence Score */}
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {(() => {
            const score = verdict?.confidence_score ?? 0;
            const color = score >= 70 ? "oklch(0.8 0.16 150)" : score >= 50 ? "oklch(0.8 0.14 70)" : "oklch(0.7 0.15 25)";
            const r = 52, stroke = 8, circumference = Math.PI * r;
            const dash = (score / 100) * circumference;
            return (
              <>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", marginBottom: 14 }}>LIKELY TO SUCCEED</div>
                <svg width="130" height="72" viewBox="0 0 130 72" style={{ overflow: "visible", marginBottom: 4 }}>
                  {/* Background arc */}
                  <path
                    d={`M ${65 - r},65 A ${r},${r} 0 0,1 ${65 + r},65`}
                    fill="none" stroke="#232730" strokeWidth={stroke} strokeLinecap="round"
                  />
                  {/* Score arc */}
                  <path
                    d={`M ${65 - r},65 A ${r},${r} 0 0,1 ${65 + r},65`}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference}`}
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                  />
                  <text x="65" y="60" textAnchor="middle" fontSize="26" fontWeight="700" fill="#e8eaed" fontFamily="'Space Grotesk',sans-serif">{score}%</text>
                </svg>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color, letterSpacing: "0.06em", marginBottom: 10 }}>
                  {score >= 70 ? "STRONG PMF" : score >= 50 ? "VIABLE" : score >= 35 ? "AT RISK" : "NEEDS PIVOT"}
                </div>
                <div style={{ fontSize: 11.5, color: "#9aa0ab", lineHeight: 1.55, textAlign: "center" }}>
                  {verdict?.confidence_rationale ?? "Based on 24-month simulation data"}
                </div>
              </>
            );
          })()}
        </div>

        {/* Immediate Actions */}
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Immediate action needed</div>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "oklch(0.7 0.15 25)", background: "oklch(0.7 0.15 25 / 0.12)", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.06em" }}>URGENT</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(verdict?.immediate_actions ?? [
              { action: "Run re-simulation with a new decision", reason: "Apply one of the strategic decisions above to see how outcomes change", timeframe: "Now", urgency: "high" as const },
            ]).map((a: ImmediateAction, i: number) => {
              const urgencyColor = a.urgency === "critical" ? "oklch(0.7 0.15 25)" : a.urgency === "high" ? "oklch(0.8 0.14 70)" : "oklch(0.8 0.16 150)";
              const urgencyBg = a.urgency === "critical" ? "oklch(0.7 0.15 25 / 0.1)" : a.urgency === "high" ? "oklch(0.8 0.14 70 / 0.1)" : "oklch(0.8 0.16 150 / 0.1)";
              return (
                <div key={i} style={{ padding: "12px 14px", background: urgencyBg, border: `1px solid ${urgencyColor}33`, borderRadius: 9 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{a.action}</div>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: urgencyColor, whiteSpace: "nowrap", flexShrink: 0, marginTop: 2, letterSpacing: "0.05em" }}>{a.timeframe.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9aa0ab", lineHeight: 1.5 }}>{a.reason}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supporting Evidence */}
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Supporting evidence</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {(verdict?.evidence ?? []).map((e: Evidence, i: number) => {
              const icon = e.sentiment === "positive" ? "▲" : e.sentiment === "negative" ? "▼" : "●";
              const color = e.sentiment === "positive" ? "oklch(0.8 0.16 150)" : e.sentiment === "negative" ? "oklch(0.7 0.15 25)" : "#6b7280";
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "#0e1014", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
                  <span style={{ color, fontSize: 10, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>{icon}</span>
                  <div style={{ fontSize: 12, color: e.sentiment === "positive" ? "#d4d8de" : e.sentiment === "negative" ? "#c0848a" : "#9aa0ab", lineHeight: 1.5 }}>{e.point}</div>
                </div>
              );
            })}
            {(!verdict?.evidence || verdict.evidence.length === 0) && (
              <div style={{ fontSize: 12, color: "#4b515c", fontStyle: "italic" }}>Evidence loads after simulation completes.</div>
            )}
          </div>
        </div>
      </div>

      {/* Decision panel — interactive */}
      {showDecision && (
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 14, padding: 28, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>What would you change?</div>
            <button onClick={() => { setSelectedDecision(null); onToggleDecision(); }} style={{ fontSize: 13, color: "#9aa0ab", cursor: "pointer", background: "none", border: "none" }}>✕ close</button>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Select a decision — Claude will re-simulate all 24 months with this change applied.</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            {decisions.map((d) => {
              const isSelected = selectedDecision === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDecision(isSelected ? null : d.id)}
                  style={{
                    background: "#0e1014",
                    border: isSelected ? "2px solid oklch(0.8 0.16 150)" : "1px solid #232730",
                    borderRadius: 12,
                    padding: 18,
                    cursor: "pointer",
                    transition: "border 0.15s",
                    position: "relative",
                  }}
                >
                  {isSelected && (
                    <div style={{ position: "absolute", top: 10, right: 12, width: 8, height: 8, borderRadius: "50%", background: "oklch(0.8 0.16 150)" }} />
                  )}
                  <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? "oklch(0.8 0.16 150)" : "#e8eaed", marginBottom: 6 }}>{d.label}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#9aa0ab", marginBottom: 10 }}>{d.desc}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: isSelected ? "oklch(0.8 0.16 150)" : "#4b515c", letterSpacing: "0.06em" }}>{d.impact}</div>
                </div>
              );
            })}
          </div>

          {/* Apply button — only shows after a card is selected */}
          {selectedDecision && (() => {
            const dec = decisions.find((d) => d.id === selectedDecision)!;
            return (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "oklch(0.8 0.16 150 / 0.08)", border: "1px solid oklch(0.8 0.16 150 / 0.3)", borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "oklch(0.84 0.16 150)" }}>Apply: {dec.label}</div>
                  <div style={{ fontSize: 12, color: "#9aa0ab", marginTop: 3 }}>Claude will re-run all 24 months with this decision baked in from day 1.</div>
                </div>
                <button
                  onClick={() => {
                    onApplyDecision(dec.modifiedStartup, dec.label);
                    setSelectedDecision(null);
                  }}
                  style={{ padding: "11px 22px", borderRadius: 9, background: "oklch(0.8 0.16 150)", color: "#0e1014", fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", whiteSpace: "nowrap", marginLeft: 20, flexShrink: 0 }}
                >
                  Re-simulate →
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* KPIs — all driven by real simulation data */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard label="MRR" value={fmtMRR(mrr)} sub={momGrowth} />
        <KPICard
          label="ARR PROJ."
          value={`$${Math.round(mrr * 12)}k`}
          sub={
            verdict?.outcome === "success" ? "▲ venture scale" :
            verdict?.outcome === "viable"  ? "▲ sustainable" :
            verdict?.outcome === "at_risk" ? "▼ needs acceleration" :
            "▼ below target"
          }
          subColor={
            verdict?.outcome === "success" ? "oklch(0.8 0.16 150)" :
            verdict?.outcome === "viable"  ? "oklch(0.8 0.16 150)" :
            "oklch(0.8 0.14 70)"
          }
        />
        <KPICard label="CUSTOMERS" value={String(customers)} sub={`▲ +${lastNewCustomers} last mo`} />
        <KPICard label="CHURN" value={churnDisplay} sub={churnRate > 0.05 ? "▲ watch this" : "▲ healthy"} subColor={churnRate > 0.05 ? "oklch(0.8 0.14 70)" : "oklch(0.8 0.16 150)"} />
        <KPICard label="RETENTION" value={`${retention12m}%`} sub="▲ 12-month" />
      </div>

      {/* Chart + competitors */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <MRRChart months={months} />
        <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Competitor threat</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {competitorDisplay.map((c) => {
              const cfg = threatConfig[c.threat_level] ?? threatConfig["LOW"];
              return (
                <div key={c.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                    <div>
                      <span>{c.name}</span>
                      <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6 }}>{c.price}</span>
                    </div>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: cfg.color }}>{c.threat_level}</span>
                  </div>
                  <div style={{ height: 5, background: "#232730", borderRadius: 3 }}>
                    <div style={{ width: `${cfg.pct}%`, height: "100%", background: cfg.color, borderRadius: 3 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Investor panel — 5 cards in a grid */}
      <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Investor panel</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280" }}>{investorDisplay.length} INVESTORS</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {investorDisplay.map((inv, i) => {
            const feedback = investorFeedback[i];
            const archetypeVerdict: Record<string, { label: string; color: string }> = {
              yc_partner: { label: "LEANING YES", color: "oklch(0.8 0.16 150)" },
              vc:         { label: "NEUTRAL",     color: "oklch(0.8 0.14 70)"  },
              angel:      { label: "INTERESTED",  color: "oklch(0.8 0.16 150)" },
            };
            const def = archetypeVerdict[inv.archetype] ?? { label: "EVALUATING", color: "#6b7280" };
            const verdictLabel = feedback ? feedback.verdict.replace(/_/g, " ").toUpperCase() : def.label;
            const color = feedback ? (verdictColor[feedback.verdict] ?? def.color) : def.color;

            // Context-aware quotes using real simulation numbers
            const arpu = Math.round(mrr * 1000 / Math.max(customers, 1));
            const quotes: Record<string, string> = {
              yc_partner: `${startupName} has real traction. ${churnRate < 0.04 ? `Churn at ${(churnRate*100).toFixed(1)}% is exactly what I want to see.` : `Churn at ${(churnRate*100).toFixed(1)}% needs to come down.`} Show me 15% MoM and I'm writing the check.`,
              vc:         `${arpu}/customer ARPU with ${customers} logos is ${customers > 300 ? "getting interesting" : "too early for Series A"}. ${customers < 300 ? "Double acquisition, then come back." : "Let's talk unit economics at scale."}`,
              angel:      `The ${startup.market} niche is underserved and ${retention12m}% annual retention at this stage is a strong signal. ${verdict?.outcome === "success" ? "I'd lead a small round." : "Fix churn, then I'm in."}`,
            };
            const quote = feedback?.quote ?? quotes[inv.archetype] ?? `${startupName} shows interesting traction in ${startup.market}.`;

            return (
              <div key={inv.name} style={{ background: "#0e1014", border: "1px solid #232730", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, lineHeight: 1.55, fontStyle: "italic", color: "#d4d8de", marginBottom: 10 }}>&ldquo;{quote}&rdquo;</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color, letterSpacing: "0.04em" }}>
                  {inv.name.toUpperCase()} · {inv.role.toUpperCase()} · {verdictLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI recommendations — 6 in a 2-col grid */}
      <div style={{ background: "#14171e", border: "1px solid #232730", borderRadius: 12, padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>AI recommendations</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#6b7280" }}>GROWTH PLAYBOOK</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {recommendations.map((r, i) => (
            <div key={r.title + i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 16, background: "#0e1014", borderRadius: 10, border: `1px solid ${r.priority === "high" ? "oklch(0.8 0.16 150 / 0.2)" : r.priority === "medium" ? "oklch(0.8 0.14 70 / 0.2)" : "#232730"}` }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: r.priority === "high" ? "oklch(0.8 0.16 150 / 0.15)" : r.priority === "medium" ? "oklch(0.8 0.14 70 / 0.15)" : "#232730",
                  color: r.priority === "high" ? "oklch(0.8 0.16 150)" : r.priority === "medium" ? "oklch(0.8 0.14 70)" : "#6b7280",
                  letterSpacing: "0.06em",
                }}>{r.priority.toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: "#9aa0ab", lineHeight: 1.55, marginBottom: 6 }}>{r.detail}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: r.priority === "high" ? "oklch(0.8 0.16 150)" : "oklch(0.8 0.14 70)" }}>→ {r.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restart */}
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <button
          onClick={onRestart}
          style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "12px 24px", borderRadius: 9, border: "1px solid #2a2e38", color: "#9aa0ab", fontSize: 14, cursor: "pointer", background: "none" }}
        >
          Run another simulation
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_STARTUP: StartupInput = {
  name: "SweetAI",
  description: "AI-powered operating system for sweet shops and bakeries. Handles inventory, sales analytics and supplier ordering.",
  market: "Small food businesses",
  pricing: "$49/month",
  category: "SMB SaaS",
};

export default function SimulationClient() {
  const [state, setState] = useState<SimState>({
    step: "form",
    simId: null,
    startup: DEFAULT_STARTUP,
    personas: [],
    competitors: [],
    investors: [],
    months: [],
    events: [],
    currentMonth: 0,
    genProgress: 0,
    genStage: STAGES[0],
    verdict: null,
    showDecision: false,
    appliedDecision: null,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseCleanupRef = useRef<(() => void) | null>(null);

  const runDemoSimulation = useCallback(() => {
    // Phase 1: generation animation
    let progress = 0;
    let personaIdx = 0;
    let compIdx = 0;
    const allPersonas = [...DEMO_PERSONAS];
    const allComps = [...DEMO_COMPETITORS];

    setState((s) => ({ ...s, step: "generating", genProgress: 0, genStage: STAGES[0], personas: [], competitors: [], investors: [], months: [], events: [], currentMonth: 0, verdict: null }));

    timerRef.current = setInterval(() => {
      progress += 1.4;
      const stageIdx = Math.min(Math.floor(progress / 20), 4);
      const newPersonas = allPersonas.slice(0, Math.min(Math.floor(progress / 5), 4));
      const newComps = allComps.slice(0, Math.min(progress >= 65 ? 3 : progress >= 42 ? Math.max(0, Math.floor((progress - 42) / 10)) : 0, 3));
      const newInvestors = progress >= 85 ? [
        { name: "Alex Chen", role: "YC Partner", archetype: "yc_partner" as const, focus: "Seed" },
        { name: "Sarah Mitchell", role: "Venture Capitalist", archetype: "vc" as const, focus: "Series A" },
        { name: "David Park", role: "Angel Investor", archetype: "angel" as const, focus: "Pre-seed" },
      ] : [];

      if (progress >= 100) {
        clearInterval(timerRef.current!);
        setState((s) => ({ ...s, step: "running", genProgress: 100, personas: allPersonas, competitors: allComps, investors: newInvestors }));
        runMonths();
      } else {
        setState((s) => ({ ...s, genProgress: progress, genStage: STAGES[stageIdx], personas: newPersonas, competitors: newComps, investors: newInvestors }));
      }
    }, 60);
  }, []);

  const runMonths = useCallback(() => {
    let m = 0;
    timerRef.current = setInterval(() => {
      m++;
      const mrr = DEMO_MRR[m - 1];
      const customers = DEMO_CUSTOMERS[m - 1];
      const prevCustomers = m > 1 ? DEMO_CUSTOMERS[m - 2] : 0;
      const monthEvent = DEMO_EVENTS[m];
      const monthData: MonthData = {
        month: m, mrr, arr: mrr * 12, customers,
        new_customers: Math.max(0, customers - prevCustomers),
        churned_customers: Math.max(0, prevCustomers - customers + Math.round(prevCustomers * 0.032)),
        churn_rate: m >= 16 ? 0.051 : m >= 9 ? 0.038 : 0.032,
        events: monthEvent ? [monthEvent] : [],
      };

      setState((s) => {
        const newMonths = [...s.months, monthData];
        const newEvents = monthEvent ? [monthEvent, ...s.events] : s.events;

        if (m >= 24) {
          clearInterval(timerRef.current!);
          return {
            ...s,
            step: "results",
            months: newMonths,
            events: newEvents,
            currentMonth: 24,
            verdict: {
              headline: "Likely viable — fix churn before month 18.",
              summary: `${s.startup.name} reaches $${Math.round(mrr * 12)}k ARR with strong word-of-mouth, but the $29 competitor at month 16 exposes a retention gap. Add an annual plan or mobile app before the competitive window closes.`,
              outcome: "viable",
              confidence_score: 67,
              confidence_rationale: "Strong retention and growing customer base, but churn acceleration in month 16 and stalled growth cap the score.",
              immediate_actions: [
                { action: "Launch annual plan before month 18 competitor window closes", reason: "CrumbStack's $29/mo entry is actively poaching your customers. Locking in annual commitments now reduces their attack surface.", timeframe: "30 days", urgency: "critical" as const },
                { action: "Implement automated churn-risk alerts", reason: "Churn spiked to 5.1% at month 16 — you had no early warning. Identify at-risk customers before they cancel.", timeframe: "This week", urgency: "high" as const },
                { action: "Start tracking CAC by acquisition channel", reason: "Investors will ask for CAC payback before any funding conversation. You need this number.", timeframe: "60 days", urgency: "medium" as const },
              ],
              evidence: [
                { point: `Reached $${Math.round(mrr * 12)}k ARR in 24 months at $49/month — proving real demand in the bakery software niche`, sentiment: "positive" as const },
                { point: `Churn held below 4% for 15 consecutive months before competitor entry — strong product stickiness`, sentiment: "positive" as const },
                { point: `CrumbStack entered at $29/mo in month 16 and immediately caused a churn spike to 5.1%`, sentiment: "negative" as const },
                { point: `Growth plateaued after month 20 — peak MRR equals final MRR, signaling acquisition has stalled`, sentiment: "negative" as const },
                { point: `AI adoption tailwind at month 4 accelerated early customer acquisition by ~12%`, sentiment: "positive" as const },
              ],
              final_mrr: mrr * 1000,
              final_arr: mrr * 12000,
              final_customers: customers,
              final_churn: 0.042,
              recommendations: [
                { priority: "high", title: "Launch annual plan at $399", detail: "Highest-impact move. Reduces churn from 4.2% to ~2.8% and adds $24k ARR by M24.", impact: "+$24k ARR" },
                { priority: "high", title: "Ship mobile app", detail: "Addresses the #1 pain point for 14 of 20 personas. 3-month delay, then retention improves.", impact: "−1.2pt churn" },
                { priority: "high", title: "Launch referral program with bakery associations", detail: "Word-of-mouth is already working. Formalise it with a $100 credit per referral through industry bodies.", impact: "+40% acquisition" },
                { priority: "medium", title: "Focus ICP on patisseries and bakery chains", detail: "These segments have highest adoption scores (82–91) and largest budgets.", impact: "+18% conversion" },
                { priority: "medium", title: "Add supplier ordering integration", detail: "The #2 pain point across 11 personas. An integration with major food distributors creates a switching cost moat.", impact: "−2pt churn" },
                { priority: "low", title: "Prepare seed deck for YC application", detail: "With $317k ARR and sub-4% churn, you meet the bar. The window before CrumbStack gains further ground is 6 months.", impact: "Fundraising optionality" },
              ],
            },
          };
        }
        return { ...s, months: newMonths, events: newEvents, currentMonth: m };
      });
    }, 220);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Clear any running timers/SSE
    if (timerRef.current) clearInterval(timerRef.current);
    if (sseCleanupRef.current) sseCleanupRef.current();

    // Try real API, fall back to demo
    try {
      const { sim_id } = await createSimulation(state.startup);
      setState((s) => ({ ...s, step: "generating", simId: sim_id, personas: [], competitors: [], investors: [], months: [], events: [], currentMonth: 0, genProgress: 0, verdict: null }));

      const cleanup = connectSimulationStream(
        sim_id,
        (event) => {
          if (event.type === "persona_added") {
            setState((s) => ({ ...s, personas: [...s.personas, event.data], genProgress: Math.min(s.genProgress + 3, 60) }));
          } else if (event.type === "competitor_added") {
            setState((s) => ({ ...s, competitors: [...s.competitors, event.data], genProgress: Math.min(s.genProgress + 7, 80) }));
          } else if (event.type === "investor_added") {
            setState((s) => ({ ...s, investors: [...s.investors, event.data], genProgress: Math.min(s.genProgress + 5, 95) }));
          } else if (event.type === "generation_complete") {
            setState((s) => ({ ...s, step: "running", genProgress: 100 }));
          } else if (event.type === "month") {
            const md = event.data;
            setState((s) => ({
              ...s,
              months: [...s.months, md],
              currentMonth: md.month,
              events: md.events.length > 0 ? [...md.events, ...s.events] : s.events,
            }));
          } else if (event.type === "simulation_complete") {
            setState((s) => ({ ...s, step: "results", verdict: event.data }));
            cleanup();
          } else if (event.type === "error") {
            console.error("SSE error:", event.data.message);
            runDemoSimulation();
          }
        },
        () => runDemoSimulation()
      );
      sseCleanupRef.current = cleanup;
    } catch {
      // API not running yet — use demo
      runDemoSimulation();
    }
  }, [state.startup, runDemoSimulation]);

  // Apply a decision: swap startup params and re-run full simulation
  const handleApplyDecision = useCallback((modifiedStartup: StartupInput, decisionLabel: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (sseCleanupRef.current) sseCleanupRef.current();
    setState((s) => ({
      ...s,
      startup: modifiedStartup,
      appliedDecision: decisionLabel,
      showDecision: false,
      step: "generating",
      simId: null,
      personas: [],
      competitors: [],
      investors: [],
      months: [],
      events: [],
      currentMonth: 0,
      genProgress: 0,
      genStage: STAGES[0],
      verdict: null,
      error: null,
    }));
    // Trigger submission with modified startup
    setTimeout(async () => {
      try {
        const { sim_id } = await createSimulation(modifiedStartup);
        setState((s) => ({ ...s, simId: sim_id }));
        const cleanup = connectSimulationStream(
          sim_id,
          (event) => {
            if (event.type === "persona_added") {
              setState((s) => ({ ...s, personas: [...s.personas, event.data], genProgress: Math.min(s.genProgress + 3, 60) }));
            } else if (event.type === "competitor_added") {
              setState((s) => ({ ...s, competitors: [...s.competitors, event.data], genProgress: Math.min(s.genProgress + 7, 80) }));
            } else if (event.type === "investor_added") {
              setState((s) => ({ ...s, investors: [...s.investors, event.data], genProgress: Math.min(s.genProgress + 5, 95) }));
            } else if (event.type === "generation_complete") {
              setState((s) => ({ ...s, step: "running", genProgress: 100 }));
            } else if (event.type === "month") {
              const md = event.data;
              setState((s) => ({
                ...s,
                months: [...s.months, md],
                currentMonth: md.month,
                events: md.events.length > 0 ? [...md.events, ...s.events] : s.events,
              }));
            } else if (event.type === "simulation_complete") {
              setState((s) => ({ ...s, step: "results", verdict: event.data }));
              cleanup();
            } else if (event.type === "error") {
              runDemoSimulation();
            }
          },
          () => runDemoSimulation()
        );
        sseCleanupRef.current = cleanup;
      } catch {
        runDemoSimulation();
      }
    }, 100);
  }, [runDemoSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sseCleanupRef.current) sseCleanupRef.current();
    };
  }, []);

  const statusLabel =
    state.step === "form" ? "READY" :
    state.step === "generating" ? `GENERATING ${Math.round(state.genProgress)}%` :
    state.step === "running" ? `SIMULATING M${state.currentMonth}/24` :
    "SIM COMPLETE";

  return (
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#e8eaed", background: "#0e1014", minHeight: "calc(100vh - 65px)" }}>

      {/* Sub-nav status */}
      {state.step !== "form" && (
        <div style={{ padding: "8px 64px", borderBottom: "1px solid #1c1f27", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.8 0.16 150)" }}>{statusLabel}</div>
            {state.appliedDecision && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: "oklch(0.8 0.16 150 / 0.1)", border: "1px solid oklch(0.8 0.16 150 / 0.3)" }}>
                <span style={{ fontSize: 9, color: "oklch(0.8 0.16 150)" }}>⟳</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "oklch(0.8 0.16 150)" }}>DECISION: {state.appliedDecision.toUpperCase()}</span>
              </div>
            )}
          </div>
          {state.step === "results" && (
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#6b7280" }}>{state.startup.name} · {state.startup.pricing} · {state.startup.category}</span>
          )}
        </div>
      )}

      {state.step === "form" && (
        <FormState
          startup={state.startup}
          onChange={(f, v) => setState((s) => ({ ...s, startup: { ...s.startup, [f]: v } }))}
          onSubmit={handleSubmit}
        />
      )}

      {state.step === "generating" && (
        <GeneratingState
          progress={state.genProgress}
          stage={state.genStage}
          personas={state.personas}
          competitors={state.competitors}
          investors={state.investors}
        />
      )}

      {state.step === "running" && (
        <RunningState
          months={state.months}
          events={state.events}
          currentMonth={state.currentMonth}
          startupName={state.startup.name}
        />
      )}

      {state.step === "results" && (
        <ResultsState
          months={state.months}
          events={state.events}
          verdict={state.verdict}
          startupName={state.startup.name}
          startup={state.startup}
          competitors={state.competitors}
          investors={state.investors}
          showDecision={state.showDecision}
          onToggleDecision={() => setState((s) => ({ ...s, showDecision: !s.showDecision }))}
          onApplyDecision={handleApplyDecision}
          onRestart={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setState((s) => ({ ...s, step: "form", showDecision: false }));
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
