// Shared types used across frontend and backend API

export interface StartupInput {
  name: string;
  description: string;
  market: string;
  pricing: string;
  category: string;
}

export interface CustomerPersona {
  name: string;
  age: number;
  role: string;
  industry: string;
  business_size: string;
  annual_revenue: string;
  budget: number;
  tech_score: number;
  pain_points: string[];
  buying_behavior: string;
  adoption_score: number;
}

export interface Competitor {
  name: string;
  description: string;
  price: string;
  strengths: string[];
  weaknesses: string[];
  market_position: string;
  threat_level: "HIGH" | "MED" | "LOW";
}

export interface Investor {
  name: string;
  role: string;
  archetype: "yc_partner" | "vc" | "angel";
  focus: string;
}

export interface MarketEvent {
  month: number;
  type: "tailwind" | "downturn" | "competitor" | "viral" | "regulation";
  text: string;
  impact: string;
  color: string;
}

export interface MonthData {
  month: number;
  mrr: number;
  arr: number;
  customers: number;
  new_customers: number;
  churned_customers: number;
  churn_rate: number;
  events: MarketEvent[];
  investor_feedback?: InvestorFeedback[];
}

export interface InvestorFeedback {
  investor: Investor;
  verdict: "yes" | "leaning_yes" | "neutral" | "leaning_no" | "no";
  quote: string;
}

export interface AIRecommendation {
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  impact: string;
}

export interface ImmediateAction {
  action: string;
  reason: string;
  timeframe: string;
  urgency: "critical" | "high" | "medium";
}

export interface Evidence {
  point: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface Verdict {
  headline: string;
  summary: string;
  outcome: "success" | "viable" | "at_risk" | "failure";
  confidence_score: number;
  confidence_rationale: string;
  immediate_actions: ImmediateAction[];
  evidence: Evidence[];
  final_mrr: number;
  final_arr: number;
  final_customers: number;
  final_churn: number;
  recommendations: AIRecommendation[];
}

export interface SimulationState {
  sim_id: string;
  status: "generating" | "running" | "complete" | "error";
  startup: StartupInput;
  personas: CustomerPersona[];
  competitors: Competitor[];
  investors: Investor[];
  months: MonthData[];
  events: MarketEvent[];
  verdict: Verdict | null;
}

// SSE event payloads
export type SSEEvent =
  | { type: "persona_added"; data: CustomerPersona }
  | { type: "competitor_added"; data: Competitor }
  | { type: "investor_added"; data: Investor }
  | { type: "generation_complete"; data: Record<string, never> }
  | { type: "month"; data: MonthData }
  | { type: "simulation_complete"; data: Verdict }
  | { type: "error"; data: { message: string } };

// Decision engine
export type DecisionType = "pricing" | "feature" | "marketing" | "expand";

export interface Decision {
  type: DecisionType;
  label: string;
  description: string;
  params: Record<string, unknown>;
  projected_impact: string;
}
