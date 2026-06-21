"use client";

import { SSEEvent } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function connectSimulationStream(
  simId: string,
  onEvent: (event: SSEEvent) => void,
  onError?: (err: Event) => void
): () => void {
  const url = `${API_URL}/v1/simulations/${simId}/stream`;
  const source = new EventSource(url);

  const eventTypes: SSEEvent["type"][] = [
    "persona_added",
    "competitor_added",
    "investor_added",
    "generation_complete",
    "month",
    "simulation_complete",
    "error",
  ];

  eventTypes.forEach((eventType) => {
    source.addEventListener(eventType, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent({ type: eventType, data } as SSEEvent);
      } catch {
        console.error("SSE parse error", e.data);
      }
    });
  });

  if (onError) {
    source.onerror = onError;
  }

  // Return cleanup function
  return () => source.close();
}

export async function createSimulation(startup: {
  name: string;
  description: string;
  market: string;
  pricing: string;
  category: string;
}): Promise<{ sim_id: string }> {
  const res = await fetch(`${API_URL}/v1/simulations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(startup),
  });

  if (!res.ok) {
    throw new Error(`Failed to create simulation: ${res.statusText}`);
  }

  return res.json();
}

export async function applyDecision(
  simId: string,
  decision: { type: string; params: Record<string, unknown>; from_month: number }
): Promise<{ stream_id: string }> {
  const res = await fetch(`${API_URL}/v1/simulations/${simId}/decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decision),
  });

  if (!res.ok) {
    throw new Error(`Failed to apply decision: ${res.statusText}`);
  }

  return res.json();
}
