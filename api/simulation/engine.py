"""
SimulationEngine: market generation + 24-month run.
Publishes SSE events via in-memory asyncio queues (no Redis needed).
"""
import asyncio
from models.startup import StartupInput
from simulation.market_gen import generate_personas, generate_competitors, generate_investors
from simulation.month_runner import run_month, generate_verdict
from services.sim_store import publish, update_sim
from config import get_settings


async def run_simulation(sim_id: str, startup: StartupInput) -> None:
    settings = get_settings()

    try:
        # ── Phase 1: Market generation (parallel) ────────────────────────────
        update_sim(sim_id, {"status": "generating"})

        personas, competitors, investors = await asyncio.gather(
            _gen_personas(sim_id, startup),
            _gen_competitors(sim_id, startup),
            _gen_investors(sim_id, startup),
        )

        await publish(sim_id, "generation_complete", {})
        update_sim(sim_id, {"status": "running"})

        # ── Phase 2: 24-month simulation ─────────────────────────────────────
        months = []
        prev_month = None
        active_modifiers: dict = {}

        for month_num in range(1, 25):
            month_data, active_modifiers = await run_month(
                month=month_num,
                startup=startup,
                personas=personas,
                competitors=competitors,
                prev_month=prev_month,
                active_modifiers=active_modifiers,
                settings=settings,
            )
            months.append(month_data)
            prev_month = month_data

            await publish(sim_id, "month", month_data.model_dump())

            # Pacing: ~220ms per month = ~5s total for 24 months
            # Actual Claude calls add latency naturally
            await asyncio.sleep(0.05)

        # ── Phase 3: Final verdict ────────────────────────────────────────────
        verdict_data = await generate_verdict(startup, months, investors, settings)
        await publish(sim_id, "simulation_complete", verdict_data)
        update_sim(sim_id, {"status": "complete", "verdict": verdict_data})

    except Exception as e:
        await publish(sim_id, "error", {"message": str(e)})
        update_sim(sim_id, {"status": "error"})
        raise


async def _gen_personas(sim_id: str, startup: StartupInput):
    personas = await generate_personas(startup)
    for p in personas:
        await publish(sim_id, "persona_added", p.model_dump())
        await asyncio.sleep(0.03)
    return personas


async def _gen_competitors(sim_id: str, startup: StartupInput):
    competitors = await generate_competitors(startup)
    for c in competitors:
        await publish(sim_id, "competitor_added", c.model_dump())
        await asyncio.sleep(0.03)
    return competitors


async def _gen_investors(sim_id: str, startup: StartupInput):
    investors = await generate_investors(startup)
    for inv in investors:
        await publish(sim_id, "investor_added", inv.model_dump())
    return investors
