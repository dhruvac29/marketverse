"""
Phase 2: Run 24-month simulation month by month.
"""
import random
import json
from models.startup import (
    StartupInput, CustomerPersona, Competitor, Investor,
    MonthData, MarketEvent
)
from services.claude_service import generate_structured
from config import get_settings

# Event color map
EVENT_COLORS = {
    "tailwind": "oklch(0.8 0.16 150)",
    "downturn": "oklch(0.8 0.14 70)",
    "competitor": "oklch(0.7 0.15 25)",
    "viral": "oklch(0.8 0.16 150)",
    "regulation": "#4b515c",
}


def _base_adoption_rate(personas: list[CustomerPersona]) -> float:
    avg_score = sum(p.adoption_score for p in personas) / len(personas)
    return avg_score / 100 * 0.35  # max 35% monthly acquisition rate


async def run_month(
    month: int,
    startup: StartupInput,
    personas: list[CustomerPersona],
    competitors: list[Competitor],
    prev_month: MonthData | None,
    active_modifiers: dict,
    settings=None,
) -> tuple[MonthData, dict]:
    """
    Run a single month of simulation.
    Returns (MonthData, updated_modifiers).
    Uses Claude for event generation; customer math is deterministic for speed.
    """
    if settings is None:
        settings = get_settings()

    prev_customers = prev_month.customers if prev_month else 0
    prev_mrr = prev_month.mrr if prev_month else 0.0

    # 1. Market agent: generate events via Claude (lightweight prompt)
    events = await _generate_month_events(month, startup, competitors, prev_mrr, active_modifiers, settings)

    # 2. Apply event modifiers
    new_modifiers = dict(active_modifiers)
    acq_modifier = 1.0
    churn_modifier = 1.0

    for ev in events:
        if ev.type == "tailwind":
            new_modifiers[f"tailwind_{month}"] = {"months": 4, "acq": 1.2, "churn": 0.9}
        elif ev.type == "downturn":
            new_modifiers[f"downturn_{month}"] = {"months": 4, "acq": 0.78, "churn": 1.3}
        elif ev.type == "competitor":
            new_modifiers[f"competitor_{month}"] = {"months": 3, "acq": 0.9, "churn": 1.25}
        elif ev.type == "viral":
            new_modifiers[f"viral_{month}"] = {"months": 2, "acq": 1.45, "churn": 1.0}
        elif ev.type == "regulation":
            new_modifiers[f"regulation_{month}"] = {"months": 2, "acq": 0.85, "churn": 1.1}

    # Sum active modifiers
    for key in list(new_modifiers.keys()):
        mod = new_modifiers[key]
        if mod["months"] > 0:
            acq_modifier *= mod.get("acq", 1.0)
            churn_modifier *= mod.get("churn", 1.0)
            new_modifiers[key] = {**mod, "months": mod["months"] - 1}
        else:
            del new_modifiers[key]

    # 3. Customer math (deterministic, fast)
    base_rate = _base_adoption_rate(personas)
    pricing_value = _parse_price(startup.pricing)
    price_sensitivity = max(0.5, 1.0 - (pricing_value / 200))  # higher price = lower acquisition

    new_customers = max(0, int(prev_customers * base_rate * acq_modifier * price_sensitivity) + random.randint(0, 3))
    base_churn = 0.032
    churn_rate = min(0.15, base_churn * churn_modifier)
    churned = max(0, int(prev_customers * churn_rate))

    customers = prev_customers + new_customers - churned
    mrr = round(customers * pricing_value / 1000, 2)  # in $k

    return MonthData(
        month=month,
        mrr=mrr,
        arr=round(mrr * 12, 2),
        customers=customers,
        new_customers=new_customers,
        churned_customers=churned,
        churn_rate=round(churn_rate, 3),
        events=events,
    ), new_modifiers


async def _generate_month_events(
    month: int,
    startup: StartupInput,
    competitors: list[Competitor],
    prev_mrr: float,
    active_modifiers: dict,
    settings,
) -> list[MarketEvent]:
    """Ask Claude (haiku) whether any market event fires this month."""
    # Probability gates to avoid calling Claude every month
    event_chance = 0.25
    if month % 4 != 0 and random.random() > event_chance:
        return []

    comp_names = [c.name for c in competitors[:3]]
    prompt = f"""Month {month} of a 24-month startup simulation.

Startup: {startup.name} ({startup.category}), Pricing: {startup.pricing}
Current MRR: ${prev_mrr:.1f}k
Competitors: {', '.join(comp_names)}
Active market conditions: {list(active_modifiers.keys()) or 'none'}

Should any market event occur this month? Choose at most one, or none.

Event types:
- tailwind: AI/tech adoption wave boosts the category
- downturn: Economic pressure reduces SMB budgets
- competitor: A competitor makes an aggressive move (price cut or new feature)
- viral: Product gets unexpected social media attention
- regulation: New compliance requirement affects the market

If an event should fire, return:
{{"type": "tailwind|downturn|competitor|viral|regulation", "text": "one-line description", "impact": "brief impact statement"}}

If no event this month, return:
{{"type": null}}"""

    try:
        data = await generate_structured(prompt, settings.model_evaluation, max_tokens=200)
        if data.get("type"):
            ev_type = data["type"]
            return [MarketEvent(
                month=month,
                type=ev_type,
                text=data.get("text", f"Market event: {ev_type}"),
                impact=data.get("impact", ""),
                color=EVENT_COLORS.get(ev_type, "#4b515c"),
            )]
    except Exception:
        pass
    return []


async def generate_verdict(
    startup: StartupInput,
    months: list[MonthData],
    investors: list[Investor],
    settings=None,
) -> dict:
    """Generate final verdict using Opus for max quality."""
    if settings is None:
        settings = get_settings()

    final = months[-1]
    peak_mrr = max(m.mrr for m in months)
    avg_churn = sum(m.churn_rate for m in months) / len(months)
    events_summary = [ev.text for m in months for ev in m.events]

    prompt = f"""You are evaluating a 24-month startup simulation.

Startup: {startup.name}
Description: {startup.description}
Pricing: {startup.pricing}
Category: {startup.category}
Target Market: {startup.market}

Final Results:
- MRR: ${final.mrr:.1f}k (peak: ${peak_mrr:.1f}k)
- ARR: ${final.arr:.1f}k
- Customers: {final.customers}
- Churn rate: {final.churn_rate:.1%} (avg: {avg_churn:.1%})
- Key events: {'; '.join(events_summary[:5]) if events_summary else 'None'}

Provide a comprehensive verdict JSON with ALL of the following fields:

{{
  "headline": "one-line verdict (max 12 words, honest and specific)",
  "summary": "2-3 sentence explanation with specific numbers from this simulation",
  "outcome": "success|viable|at_risk|failure",

  "confidence_score": <integer 0-100 reflecting likelihood of real-world success>,
  "confidence_rationale": "one sentence explaining the score — what drives it up or down",

  "immediate_actions": [
    {{"action": "Specific thing to do this week/month", "reason": "Why this is urgent right now based on the simulation data", "timeframe": "This week|30 days|60 days", "urgency": "critical|high|medium"}},
    {{"action": "...", "reason": "...", "timeframe": "...", "urgency": "..."}},
    {{"action": "...", "reason": "...", "timeframe": "...", "urgency": "..."}}
  ],

  "evidence": [
    {{"point": "Specific data point from simulation supporting the verdict", "sentiment": "positive|negative|neutral"}},
    {{"point": "...", "sentiment": "..."}},
    {{"point": "...", "sentiment": "..."}},
    {{"point": "...", "sentiment": "..."}},
    {{"point": "...", "sentiment": "..."}}
  ],

  "recommendations": [
    {{"priority": "high",   "title": "...", "detail": "Specific with numbers", "impact": "Quantified outcome"}},
    {{"priority": "high",   "title": "...", "detail": "Specific with numbers", "impact": "Quantified outcome"}},
    {{"priority": "high",   "title": "...", "detail": "Specific with numbers", "impact": "Quantified outcome"}},
    {{"priority": "medium", "title": "...", "detail": "Specific with numbers", "impact": "Quantified outcome"}},
    {{"priority": "medium", "title": "...", "detail": "Specific with numbers", "impact": "Quantified outcome"}},
    {{"priority": "low",    "title": "...", "detail": "Specific with numbers", "impact": "Quantified outcome"}}
  ]
}}

Confidence score guide: 80-100 = strong PMF, clear growth path; 60-79 = viable with known risks; 40-59 = significant pivots needed; 0-39 = fundamental problems.
Immediate actions must be urgent and timebound — things that if NOT done in the next 30-90 days will materially harm the outcome.
Evidence must mix positive signals and risk signals — at least 2 of each."""

    data = await generate_structured(prompt, settings.model_verdict, max_tokens=2500)
    data["final_mrr"] = final.mrr * 1000
    data["final_arr"] = final.arr * 1000
    data["final_customers"] = final.customers
    data["final_churn"] = final.churn_rate
    return data


def _parse_price(pricing_str: str) -> float:
    """Extract numeric price from strings like '$49/month'."""
    import re
    match = re.search(r'[\d.]+', pricing_str)
    return float(match.group()) if match else 49.0
