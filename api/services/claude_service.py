import json
import anthropic
from config import get_settings

_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        settings = get_settings()
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


async def generate_structured(prompt: str, model: str, max_tokens: int = 4096) -> dict:
    client = get_client()
    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system="You are a market simulation engine. Always respond with valid JSON only. No markdown, no explanation.",
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


async def generate_text(prompt: str, model: str, system: str = "", max_tokens: int = 1024) -> str:
    client = get_client()
    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system or "You are a startup market analyst providing clear, concise analysis.",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()
