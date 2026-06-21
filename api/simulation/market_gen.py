"""
Phase 1: Generate customer personas, competitors, and investors using Claude.
"""
import asyncio
from models.startup import StartupInput, CustomerPersona, Competitor, Investor
from services.claude_service import generate_structured
from config import get_settings


async def generate_personas(startup: StartupInput) -> list[CustomerPersona]:
    settings = get_settings()
    prompt = f"""Generate 20 realistic customer archetypes for this startup:

Startup: {startup.name}
Description: {startup.description}
Target Market: {startup.market}
Pricing: {startup.pricing}
Category: {startup.category}

Create diverse personas ranging from high-fit (adoption score 80-95) to poor-fit (30-50).
Include a mix of business types, sizes, and technical sophistication levels.

Return a JSON array of exactly 20 personas with these fields:
{{
  "name": "string",
  "age": number,
  "role": "string (job title)",
  "industry": "string",
  "business_size": "Micro|Small|Medium",
  "annual_revenue": "string (e.g. $180k)",
  "budget": number (monthly software budget in USD),
  "tech_score": number (1-100, technical sophistication),
  "pain_points": ["string", "string"],
  "buying_behavior": "string",
  "adoption_score": number (0-100, likelihood to adopt this product)
}}"""

    data = await generate_structured(prompt, settings.model_generation, max_tokens=6000)
    personas = data if isinstance(data, list) else data.get("personas", [])
    return [CustomerPersona(**p) for p in personas[:20]]


async def generate_competitors(startup: StartupInput) -> list[Competitor]:
    settings = get_settings()
    prompt = f"""Generate 5 realistic competitors for this startup:

Startup: {startup.name}
Description: {startup.description}
Market: {startup.market}
Pricing: {startup.pricing}
Category: {startup.category}

Create a mix of threat levels: 1 HIGH, 2 MED, 2 LOW.
Include both direct competitors and adjacent alternatives.

Return a JSON array of exactly 5 competitors:
{{
  "name": "string",
  "description": "string (one sentence)",
  "price": "string (e.g. $29/mo)",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "market_position": "string",
  "threat_level": "HIGH|MED|LOW"
}}"""

    data = await generate_structured(prompt, settings.model_generation, max_tokens=2000)
    competitors = data if isinstance(data, list) else data.get("competitors", [])
    return [Competitor(**c) for c in competitors[:5]]


async def generate_investors(startup: StartupInput) -> list[Investor]:
    settings = get_settings()
    prompt = f"""Generate 5 investor personas for evaluating this startup:

Startup: {startup.name} — {startup.description}
Category: {startup.category}, Pricing: {startup.pricing}, Market: {startup.market}

Create exactly these 5 archetypes with realistic names and roles relevant to this specific market:
1. A YC Partner — high growth bar, cares about retention and PMF signal
2. A Venture Capitalist at a firm known for this category (Series A/B focus)
3. An Angel Investor who is a former operator or founder in this exact industry
4. A Corporate Venture Capital partner from a strategic company in this space
5. A Growth-stage VC (Series B/C) who cares about scalability and unit economics

Make names, firms, and backgrounds highly specific to {startup.category} and {startup.market}.
For example, if it's restaurant tech, include someone from Toast or Square's investment arm.

Return JSON array of exactly 5:
[{{
  "name": "string (realistic full name)",
  "role": "string (specific title and firm/fund name)",
  "archetype": "yc_partner|vc|angel",
  "focus": "string (specific investment thesis relevant to this startup)"
}}]"""

    data = await generate_structured(prompt, settings.model_generation, max_tokens=1200)
    investors = data if isinstance(data, list) else data.get("investors", [])
    return [Investor(**inv) for inv in investors[:5]]


async def generate_market(startup: StartupInput) -> tuple[list[CustomerPersona], list[Competitor], list[Investor]]:
    """Run all three generators in parallel."""
    personas, competitors, investors = await asyncio.gather(
        generate_personas(startup),
        generate_competitors(startup),
        generate_investors(startup),
    )
    return personas, competitors, investors
