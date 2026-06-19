# Tool Workflow

## What Tool Use Means

Tool use means the assistant does not rely only on generated text. It can decide that a task needs an external capability, call that capability, inspect the result, and then use the result to produce a clearer answer.

In ToolMind AI, tools are server-side functions that provide specific capabilities:

- Calculator for numeric reasoning
- Weather lookup for current weather conditions
- Web search for current information when Tavily is configured

## How This Project Demonstrates Agentic AI

ToolMind AI demonstrates an agentic loop:

```text
User task -> request analysis -> tool selection -> tool execution -> result processing -> final answer
```

The UI makes this loop visible with an agent timeline, mode badges, tool result cards, and a final response panel.

## How the Assistant Selects Tools

The project has two tool-selection paths:

- **Gemini mode:** When `GEMINI_API_KEY` is configured, Gemini receives function declarations for the supported tools and can request tool calls.
- **Mock fallback mode:** When Gemini is not configured or unavailable, a local rule-based agent checks the prompt for weather, calculation, and search intent.

Both paths return the same response shape so the frontend can render the workflow consistently.

## How Tool Outputs Become Final Answers

Each tool returns structured data:

- Weather returns city, temperature, conditions, rain data, and a recommendation.
- Calculator returns the expression, numeric result, formatted result, and explanation.
- Web search returns a query, result list, source, and mock/live status.

The agent converts those outputs into timeline entries and a concise final answer. The UI then shows both the summarized answer and the detailed tool trace.

## Current Limitations

- The fallback router is keyword and pattern based.
- Web search needs `TAVILY_API_KEY` for live results.
- Gemini mode needs `GEMINI_API_KEY` and a compatible model.
- Tool traces are not saved after page refresh.
- The app does not yet include user accounts or workflow history.

## Future Improvements

- Add more real-world tools and API integrations.
- Add conversation persistence.
- Stream intermediate steps in real time.
- Add citation cards for search results.
- Add tool execution history.
- Add stronger automated tests for routing, tool execution, and fallback paths.
