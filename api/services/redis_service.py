import json
import redis.asyncio as redis
from config import get_settings


_client: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _client
    if _client is None:
        settings = get_settings()
        _client = redis.from_url(settings.redis_url, decode_responses=True)
    return _client


async def set_sim_state(sim_id: str, state: dict) -> None:
    r = get_redis()
    settings = get_settings()
    await r.hset(f"sim:{sim_id}", mapping={k: json.dumps(v) if not isinstance(v, str) else v for k, v in state.items()})
    await r.expire(f"sim:{sim_id}", settings.sim_ttl_seconds)


async def get_sim_state(sim_id: str) -> dict | None:
    r = get_redis()
    data = await r.hgetall(f"sim:{sim_id}")
    if not data:
        return None
    result = {}
    for k, v in data.items():
        try:
            result[k] = json.loads(v)
        except (json.JSONDecodeError, TypeError):
            result[k] = v
    return result


async def append_month(sim_id: str, month_data: dict) -> None:
    r = get_redis()
    settings = get_settings()
    await r.rpush(f"sim:{sim_id}:months", json.dumps(month_data))
    await r.expire(f"sim:{sim_id}:months", settings.sim_ttl_seconds)


async def get_months(sim_id: str) -> list[dict]:
    r = get_redis()
    items = await r.lrange(f"sim:{sim_id}:months", 0, -1)
    return [json.loads(i) for i in items]


async def publish_event(sim_id: str, event_type: str, data: dict) -> None:
    r = get_redis()
    msg = json.dumps({"type": event_type, "data": data})
    await r.publish(f"sim:{sim_id}:channel", msg)


async def subscribe_channel(sim_id: str):
    r = get_redis()
    pubsub = r.pubsub()
    await pubsub.subscribe(f"sim:{sim_id}:channel")
    return pubsub
