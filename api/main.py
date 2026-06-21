from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulations, stream
from config import get_settings

settings = get_settings()

app = FastAPI(title="MarketVerse API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulations.router)
app.include_router(stream.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
