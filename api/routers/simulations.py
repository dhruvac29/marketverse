import uuid
import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException
from models.startup import SimulationCreate, DecisionRequest, StartupInput
from simulation.engine import run_simulation
from services.sim_store import create_sim, get_sim, get_event_log

router = APIRouter(prefix="/v1/simulations", tags=["simulations"])


@router.post("")
async def create_simulation(body: SimulationCreate, background_tasks: BackgroundTasks):
    sim_id = f"sim_{uuid.uuid4().hex[:12]}"
    startup = StartupInput(**body.model_dump())

    create_sim(sim_id, {
        "status": "generating",
        "startup_name": startup.name,
        "startup": startup.model_dump(),
    })

    background_tasks.add_task(run_simulation, sim_id, startup)
    return {"sim_id": sim_id, "status": "generating"}


@router.get("/{sim_id}")
async def get_simulation(sim_id: str):
    state = get_sim(sim_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    events = get_event_log(sim_id)
    months = [e["data"] for e in events if e["type"] == "month"]
    return {**state, "months": months}


@router.post("/{sim_id}/decisions")
async def apply_decision(sim_id: str, body: DecisionRequest, background_tasks: BackgroundTasks):
    state = get_sim(sim_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Simulation not found")

    stream_id = f"decision_{uuid.uuid4().hex[:8]}"
    # Phase 4: re-simulation from body.from_month with modified params
    return {"stream_id": stream_id, "sim_id": sim_id, "from_month": body.from_month}
