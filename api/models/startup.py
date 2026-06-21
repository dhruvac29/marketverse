from pydantic import BaseModel
from typing import Literal


class StartupInput(BaseModel):
    name: str
    description: str
    market: str
    pricing: str
    category: str


class CustomerPersona(BaseModel):
    name: str
    age: int
    role: str
    industry: str
    business_size: str
    annual_revenue: str
    budget: float
    tech_score: int
    pain_points: list[str]
    buying_behavior: str
    adoption_score: int


class Competitor(BaseModel):
    name: str
    description: str
    price: str
    strengths: list[str]
    weaknesses: list[str]
    market_position: str
    threat_level: Literal["HIGH", "MED", "LOW"]


class Investor(BaseModel):
    name: str
    role: str
    archetype: Literal["yc_partner", "vc", "angel"]
    focus: str


class MarketEvent(BaseModel):
    month: int
    type: Literal["tailwind", "downturn", "competitor", "viral", "regulation"]
    text: str
    impact: str
    color: str


class MonthData(BaseModel):
    month: int
    mrr: float
    arr: float
    customers: int
    new_customers: int
    churned_customers: int
    churn_rate: float
    events: list[MarketEvent] = []
    investor_feedback: list[dict] | None = None


class AIRecommendation(BaseModel):
    priority: Literal["high", "medium", "low"]
    title: str
    detail: str
    impact: str


class ImmediateAction(BaseModel):
    action: str
    reason: str
    timeframe: str
    urgency: Literal["critical", "high", "medium"]


class Evidence(BaseModel):
    point: str
    sentiment: Literal["positive", "negative", "neutral"]


class Verdict(BaseModel):
    headline: str
    summary: str
    outcome: Literal["success", "viable", "at_risk", "failure"]
    confidence_score: int
    confidence_rationale: str
    immediate_actions: list[ImmediateAction]
    evidence: list[Evidence]
    final_mrr: float
    final_arr: float
    final_customers: int
    final_churn: float
    recommendations: list[AIRecommendation]


class SimulationCreate(BaseModel):
    name: str
    description: str
    market: str
    pricing: str
    category: str


class DecisionRequest(BaseModel):
    type: Literal["pricing", "feature", "marketing", "expand"]
    params: dict
    from_month: int
