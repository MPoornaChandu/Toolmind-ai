import type {
  AgentResponse,
  AgentStep,
  CalculatorResult,
  SearchToolResult,
  ToolName,
  ToolResult,
  WeatherResult
} from "@/lib/types";
import { extractCalculationIntent, extractCity } from "@/lib/mockAgent";
import type { CalculationIntent } from "@/tools/calculator";
import { runCalculator } from "@/tools/calculator";
import { runWeatherTool } from "@/tools/weather";
import { runWebSearchTool } from "@/tools/webSearch";

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim().replace(/^models\//, "") || "gemini-3.5-flash";
const GEMINI_TIMEOUT_MS = 15000;
const MAX_GEMINI_TURNS = 4;

type GeminiToolName = ToolName;

interface GeminiFunctionCall {
  id?: string;
  name?: string;
  args?: Record<string, unknown>;
}

interface GeminiFunctionResponse {
  id?: string;
  name: string;
  response: Record<string, unknown>;
}

interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
  thought?: boolean;
  thoughtSignature?: string;
}

interface GeminiContent {
  role?: "user" | "model";
  parts?: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  error?: {
    message?: string;
  };
}

interface ExecutedToolCall {
  toolName: GeminiToolName;
  result: ToolResult;
  responsePart: GeminiPart;
}

const toolDeclarations = [
  {
    functionDeclarations: [
      {
        name: "calculator",
        description:
          "Use this for arithmetic, prices, percentages, growth, GST, taxi fares, and other numeric calculations. Pass a safe math expression such as '18 * 22'.",
        parameters: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description: "A numeric math expression using digits and operators, for example '18 * 22'."
            },
            distanceKm: {
              type: "number",
              description: "Optional distance in kilometers when calculating taxi or travel cost."
            },
            ratePerKm: {
              type: "number",
              description: "Optional rate per kilometer when calculating taxi or travel cost."
            }
          },
          required: ["expression"]
        }
      },
      {
        name: "weather",
        description:
          "Use this for current weather, rain, temperature, forecast, umbrella, humidity, or wind questions for a city.",
        parameters: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "City name, for example Hyderabad, Mumbai, Delhi, or Bengaluru."
            }
          },
          required: ["city"]
        }
      },
      {
        name: "web_search",
        description:
          "Use this for latest, current, recent, news, opportunity, internship, comparison, or web lookup requests.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to send to the web search provider."
            }
          },
          required: ["query"]
        }
      }
    ]
  }
];

function createTimedStep(step: Omit<AgentStep, "startedAt" | "endedAt" | "durationMs">, startedAt: number): AgentStep {
  const endedAt = Date.now();

  return {
    ...step,
    startedAt,
    endedAt,
    durationMs: Math.max(endedAt - startedAt, 0)
  };
}

function uniqueTools(tools: ToolName[]) {
  return Array.from(new Set(tools));
}

function isGeminiToolName(name?: string): name is GeminiToolName {
  return name === "calculator" || name === "weather" || name === "web_search";
}

function getStringArg(args: Record<string, unknown> | undefined, key: string) {
  const value = args?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function getNumberArg(args: Record<string, unknown> | undefined, key: string) {
  const value = args?.[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function summarizeWeather(result: WeatherResult) {
  const fallbackNote = result.isFallback ? " Fallback weather data is being shown because the live API was unavailable." : "";
  return `${result.city} is around ${Math.round(result.temperature)} degrees C with ${result.conditionText.toLowerCase()}. ${result.recommendation}${fallbackNote}`;
}

function summarizeCalculation(result: CalculatorResult) {
  if (result.result === 0 && result.explanation.includes("fallback")) {
    return "The calculator could not safely extract a supported formula from the message.";
  }

  return `The calculated result is ${result.formattedResult}. Formula used: ${result.expression}.`;
}

function summarizeSearch(result: SearchToolResult) {
  if (result.isMock) {
    return "Real-time web search is not enabled yet. Add TAVILY_API_KEY to enable current results.";
  }

  const titles = result.results
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.title}`)
    .join(" ");

  return `Top search results found: ${titles}`;
}

function summarizeToolResult(toolName: GeminiToolName, result: ToolResult) {
  if (toolName === "weather") {
    return summarizeWeather(result as WeatherResult);
  }

  if (toolName === "calculator") {
    return summarizeCalculation(result as CalculatorResult);
  }

  return summarizeSearch(result as SearchToolResult);
}

function buildLocalFinalAnswer(results: Partial<Record<ToolName, ToolResult>>) {
  const parts: string[] = [];

  if (results.weather) {
    parts.push(`Weather result: ${summarizeWeather(results.weather as WeatherResult)}`);
  }

  if (results.calculator) {
    parts.push(`Calculator result: ${summarizeCalculation(results.calculator as CalculatorResult)}`);
  }

  if (results.web_search) {
    parts.push(`Search result: ${summarizeSearch(results.web_search as SearchToolResult)}`);
  }

  if (results.weather && results.calculator) {
    parts.push("Final suggestion: use the weather recommendation before leaving, and use the calculated number for planning your cost or budget.");
  }

  return parts.join(" ");
}

function extractText(content?: GeminiContent) {
  return content?.parts?.map((part) => part.text).filter(Boolean).join(" ").trim() ?? "";
}

function extractFunctionCalls(content?: GeminiContent) {
  return content?.parts?.map((part) => part.functionCall).filter((call): call is GeminiFunctionCall => Boolean(call?.name)) ?? [];
}

function buildCalculatorInput(args: Record<string, unknown> | undefined, message: string): CalculationIntent | string {
  const expression = getStringArg(args, "expression");
  const distanceKm = getNumberArg(args, "distanceKm");
  const ratePerKm = getNumberArg(args, "ratePerKm");

  if (distanceKm != null && ratePerKm != null) {
    return {
      kind: "taxi_cost",
      expression: expression || `${distanceKm} * ${ratePerKm}`,
      distanceKm,
      ratePerKm
    };
  }

  return expression || extractCalculationIntent(message);
}

function buildFunctionResponsePart(call: GeminiFunctionCall, result: ToolResult): GeminiPart {
  return {
    functionResponse: {
      name: call.name ?? "unknown_tool",
      id: call.id,
      response: { result }
    }
  };
}

function toolTitle(toolName: GeminiToolName) {
  if (toolName === "calculator") return "Calculator tool selected";
  if (toolName === "weather") return "Weather tool selected";
  return "Web search tool selected";
}

function toolDescription(toolName: GeminiToolName, args: Record<string, unknown> | undefined, message: string) {
  if (toolName === "calculator") {
    const expression = getStringArg(args, "expression") || extractCalculationIntent(message).expression;
    return `Gemini requested a calculator run for ${expression}.`;
  }

  if (toolName === "weather") {
    const city = getStringArg(args, "city") || extractCity(message);
    return `Gemini requested weather for ${city}.`;
  }

  const query = getStringArg(args, "query") || message;
  return `Gemini requested web search for "${query}".`;
}

async function executeToolCall(call: GeminiFunctionCall, message: string): Promise<ExecutedToolCall> {
  if (!isGeminiToolName(call.name)) {
    throw new Error("Unsupported Gemini tool call.");
  }

  if (call.name === "calculator") {
    const result = await runCalculator(buildCalculatorInput(call.args, message));
    return {
      toolName: "calculator",
      result,
      responsePart: buildFunctionResponsePart(call, result)
    };
  }

  if (call.name === "weather") {
    const city = getStringArg(call.args, "city") || extractCity(message);
    const result = await runWeatherTool(city);
    return {
      toolName: "weather",
      result,
      responsePart: buildFunctionResponsePart(call, result)
    };
  }

  const query = getStringArg(call.args, "query") || message;
  const result = await runWebSearchTool(query);

  return {
    toolName: "web_search",
    result,
    responsePart: buildFunctionResponsePart(call, result)
  };
}

async function fetchGeminiContent(apiKey: string, contents: GeminiContent[]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [
              {
                text:
                  "You are ToolMind AI. Use function calls for calculator, weather, and web_search tasks. " +
                  "For multi-tool requests, call every relevant tool before writing the final answer. " +
                  "After tool results are provided, synthesize a concise answer using only those results. " +
                  "Never reveal or ask for API keys."
              }
            ]
          },
          tools: toolDeclarations,
          generationConfig: {
            temperature: 0.2
          }
        }),
        signal: controller.signal
      }
    );

    const payload = (await response.json()) as GeminiResponse;

    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message ?? "Gemini request failed.");
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function runGeminiAgent(message: string): Promise<AgentResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  try {
    const contents: GeminiContent[] = [
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];
    const steps: AgentStep[] = [];
    const toolsUsed: ToolName[] = [];
    const results: Partial<Record<ToolName, ToolResult>> = {};

    for (let turn = 0; turn < MAX_GEMINI_TURNS; turn += 1) {
      const geminiStartedAt = Date.now();
      const response = await fetchGeminiContent(apiKey, contents);
      const modelContent = response.candidates?.[0]?.content;

      if (!modelContent?.parts?.length) {
        throw new Error("Gemini returned an empty response.");
      }

      const functionCalls = extractFunctionCalls(modelContent).filter((call) => isGeminiToolName(call.name));

      steps.push(
        createTimedStep(
          {
            id: `step-${steps.length + 1}`,
            type: "thinking",
            title: functionCalls.length > 0 ? "Gemini selected tools" : "Gemini finalized response",
            description:
              functionCalls.length > 0
                ? `Gemini requested ${functionCalls.map((call) => call.name?.replace("_", " ")).join(", ")}.`
                : "Gemini generated the final answer from the available context.",
            status: "completed"
          },
          geminiStartedAt
        )
      );

      if (functionCalls.length === 0) {
        const geminiAnswer = extractText(modelContent);
        const answer = geminiAnswer || buildLocalFinalAnswer(results);

        if (!answer) {
          return null;
        }

        const finalStartedAt = Date.now();
        steps.push(
          createTimedStep(
            {
              id: `step-${steps.length + 1}`,
              type: "final",
              title: "Final answer",
              description: answer,
              status: "completed"
            },
            finalStartedAt
          )
        );

        return {
          answer,
          steps,
          toolsUsed: uniqueTools(toolsUsed),
          mode: "gemini"
        };
      }

      contents.push(modelContent);

      const functionResponseParts: GeminiPart[] = [];

      for (const call of functionCalls) {
        const toolName = call.name as GeminiToolName;
        const toolStartedAt = Date.now();
        const executed = await executeToolCall(call, message);

        toolsUsed.push(executed.toolName);
        results[executed.toolName] = executed.result;
        functionResponseParts.push(executed.responsePart);

        steps.push(
          createTimedStep(
            {
              id: `step-${steps.length + 1}`,
              type: "tool",
              toolName: executed.toolName,
              title: toolTitle(executed.toolName),
              description: toolDescription(toolName, call.args, message),
              status: "completed",
              result: executed.result
            },
            toolStartedAt
          )
        );

        const resultStartedAt = Date.now();
        steps.push(
          createTimedStep(
            {
              id: `step-${steps.length + 1}`,
              type: "result",
              toolName: executed.toolName,
              title: "Tool result received",
              description: summarizeToolResult(executed.toolName, executed.result),
              status: "completed",
              result: executed.result
            },
            resultStartedAt
          )
        );
      }

      contents.push({
        role: "user",
        parts: functionResponseParts
      });
    }

    const answer = buildLocalFinalAnswer(results);

    if (!answer) {
      return null;
    }

    const finalStartedAt = Date.now();
    steps.push(
      createTimedStep(
        {
          id: `step-${steps.length + 1}`,
          type: "final",
          title: "Final answer",
          description: answer,
          status: "completed"
        },
        finalStartedAt
      )
    );

    return {
      answer,
      steps,
      toolsUsed: uniqueTools(toolsUsed),
      mode: "gemini"
    };
  } catch {
    return null;
  }
}
