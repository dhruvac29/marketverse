import json
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.sim_store import get_sim, get_event_log, subscribe, unsubscribe

router = APIRouter(prefix="/v1/simulations", tags=["stream"])

DONE_EVENTS = {"simulation_complete", "error"}


@router.get("/{sim_id}/stream")
async def stream_simulation(sim_id: str):
    if get_sim(sim_id) is None:
        raise HTTPException(status_code=404, detail="Simulation not found")

    async def event_generator():
        # Send any events that already happened (client connected late)
        for event in get_event_log(sim_id):
            yield f"event: {event['type']}\ndata: {json.dumps(event['data'])}\n\n"
            if event["type"] in DONE_EVENTS:
                return

        # Subscribe for future events
        q = subscribe(sim_id)
        try:
            while True:
                try:
                    event = await asyncio.wait_for(q.get(), timeout=30.0)
                except asyncio.TimeoutError:
                    # Send keepalive comment so connection stays open
                    yield ": keepalive\n\n"
                    continue

                yield f"event: {event['type']}\ndata: {json.dumps(event['data'])}\n\n"

                if event["type"] in DONE_EVENTS:
                    break
        except asyncio.CancelledError:
            pass
        finally:
            unsubscribe(sim_id, q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
