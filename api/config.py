from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    sim_ttl_seconds: int = 604800  # 7 days

    model_generation: str = "claude-sonnet-4-6"
    model_evaluation: str = "claude-haiku-4-5-20251001"
    model_investor: str = "claude-sonnet-4-6"
    model_verdict: str = "claude-opus-4-8"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
