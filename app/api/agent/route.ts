import { NextResponse } from "next/server";

import { isGeminiConfigured, runGeminiAgent } from "@/lib/gemini";
import { runMockAgent } from "@/lib/mockAgent";
import type { AgentResponse } from "@/lib/types";

function safeErrorResponse(error: string, status = 500) {
  const now = Date.now();
  const response: AgentResponse = {
    answer: "Sorry, something went wrong while running the agent. A safe fallback was returned.",
    steps: [
      {
        id: "error-step",
        type: "error",
        title: "Agent error",
        description: "A safe fallback was returned instead of crashing the app.",
        status: "error",
        startedAt: now,
        endedAt: now,
        durationMs: 0
      }
    ],
    toolsUsed: [],
    mode: "mock",
    error
  };

  return NextResponse.json(response, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { message?: unknown } | null;
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return safeErrorResponse("Please enter a question before running the agent.", 400);
    }

    if (message.length > 2000) {
      return safeErrorResponse("Please keep the question under 2,000 characters.", 400);
    }

    if (isGeminiConfigured()) {
      const geminiResponse = await runGeminiAgent(message).catch(() => null);

      if (geminiResponse) {
        return NextResponse.json(geminiResponse);
      }
    }

    const response = await runMockAgent(message);
    return NextResponse.json(response);
  } catch {
    return safeErrorResponse("The agent route recovered from an unexpected server error.");
  }
}
