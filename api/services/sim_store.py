"""
In-memory simulation store using asyncio.Queue for SSE.
No Redis required — works out of the box for dev.
Add Redis backing in production by swapping this module.
"""
import asyncio
from typing import Any

# sim_id -> simulation state dict
_states: dict[str, dict] = {}

# sim_id -> list of subscriber queues (one per SSE connection)
_subscribers: dict[str, list[asyncio.Queue]] = {}

# sim_id -> list of buffered events (so late-joining SSE gets history)
_event_log: dict[str, list[dict]] = {}


def create_sim(sim_id: str, initial_state: dict) -> None:
    _states[sim_id] = initial_state
    _subscribers[sim_id] = []
    _event_log[sim_id] = []


def get_sim(sim_id: str) -> dict | None:
    return _states.get(sim_id)


def update_sim(sim_id: str, updates: dict) -> None:
    if sim_id in _states:
        _states[sim_id].update(updates)


async def publish(sim_id: str, event_type: str, data: Any) -> None:
    event = {"type": event_type, "data": data}
    if sim_id in _event_log:
        _event_log[sim_id].append(event)
    for q in _subscribers.get(sim_id, []):
        await q.put(event)


def subscribe(sim_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    if sim_id not in _subscribers:
        _subscribers[sim_id] = []
    _subscribers[sim_id].append(q)
    return q


def unsubscribe(sim_id: str, q: asyncio.Queue) -> None:
    if sim_id in _subscribers:
        try:
            _subscribers[sim_id].remove(q)
        except ValueError:
            pass


def get_event_log(sim_id: str) -> list[dict]:
    return _event_log.get(sim_id, [])


def cleanup(sim_id: str) -> None:
    _states.pop(sim_id, None)
    _subscribers.pop(sim_id, None)
    _event_log.pop(sim_id, None)
