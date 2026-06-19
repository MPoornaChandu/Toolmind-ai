# ToolMind AI Architecture

## Product Overview

ToolMind AI is a full-stack agentic AI demo that shows how an assistant can receive a user prompt, decide which tool is useful, execute that tool on the server, and return both a final answer and an inspectable workflow trace.

The product is designed as a portfolio-ready AI tool-use platform. The main demo experience combines a chat input, sample prompts, mode badges, an agent timeline, and tool result cards.

## Agent and Tool Workflow

1. The user submits a task from the web UI.
2. The client sends the task to `POST /api/agent`.
3. The server validates the request.
4. If Gemini is configured, the Gemini agent can choose tools through function calling.
5. If Gemini is unavailable or not configured, the local fallback agent chooses tools with rule-based routing.
6. Selected tools execute on the server.
7. Tool outputs are converted into timeline steps and result cards.
8. The app returns a structured final answer to the UI.

Supported tools:

- Calculator
- Weather
- Web search

## API Flow

The main API entry point is `app/api/agent/route.ts`.

The route accepts a JSON body with a `message` field, validates empty or oversized prompts, and returns an `AgentResponse` object. The response includes:

- `answer`
- `steps`
- `toolsUsed`
- `mode`
- optional `error`

The API is designed to fail safely. Invalid input, tool failures, and unexpected server errors return structured JSON fallback responses instead of crashing the app.

## Gemini Integration

Gemini integration lives in `lib/gemini.ts`.

When `GEMINI_API_KEY` is present, the app calls the Gemini API with function declarations for the calculator, weather, and web search tools. Gemini can request one or more tool calls, the server executes them, and the tool responses are sent back to Gemini for final answer synthesis.

If Gemini returns an error, times out, or does not produce a usable response, the app falls back to the local agent path.

## UI Flow

The main page renders the following sections:

- Hero section
- Scroll story
- Agent demo
- Tool orbit
- Architecture overview
- Tool example cards
- Feature cards
- Footer

The agent demo is the primary product surface. It includes:

- Prompt input
- Demo prompt cards
- Loading state
- Error state
- Mode badges for Gemini/mock and Tavily/mock search
- Agent timeline
- Tool result cards

## Environment Variable Setup

Used environment variables:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
TAVILY_API_KEY=
```

Notes:

- `.env.local` must not be committed.
- API keys stay server-side.
- Vercel deployments must define the same variables in project settings.
- The app still works in fallback mode without these variables.

## Deployment Notes

The project is ready for Vercel deployment and has a live deployment at:

https://toolmind-ai-omega.vercel.app/#demo

Before deploying with live Gemini or Tavily behavior, add the required environment variables in Vercel.

## Current Limitations

- Gemini function calling depends on a valid server-side API key and model availability.
- Web search uses mock results when `TAVILY_API_KEY` is missing.
- Search citations are not yet displayed as a dedicated citation UI.
- Conversations and tool traces are not persisted.
- There is no authentication, workspace system, or user history yet.
- Light mode is not implemented.

## Future Improvements

- More tool integrations
- User authentication
- Tool execution history
- Saved workflows
- Real-time streaming responses
- Team workspace
- API usage analytics
- Advanced agent memory
- Role-based access
- More reliable tool error recovery
