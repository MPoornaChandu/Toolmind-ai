import type {
  AgentResponse,
  AgentStep,
  CalculatorResult,
  SearchToolResult,
  ToolName,
  WeatherResult
} from "@/lib/types";
import type { CalculationIntent } from "@/tools/calculator";
import { runCalculator, toNumber } from "@/tools/calculator";
import { runWeatherTool } from "@/tools/weather";
import { runWebSearchTool } from "@/tools/webSearch";

const cities = [
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Bangalore",
  "Chennai",
  "Pune",
  "Kolkata",
  "Goa",
  "Jaipur",
  "Ahmedabad"
];

const weatherKeywords = [
  "weather",
  "rain",
  "temperature",
  "umbrella",
  "forecast",
  "hot",
  "cold",
  "humid",
  ...cities
];

const calculatorKeywords = [
  "calculate",
  "cost",
  "price",
  "total",
  "interest",
  "investment",
  "percent",
  "percentage",
  "gst",
  "km",
  "per km",
  "rupees",
  "₹",
  "rs",
  "inr"
];

const searchKeywords = [
  "search",
  "latest",
  "recent",
  "news",
  "current",
  "internships",
  "opportunities",
  "compare",
  "pricing",
  "trends"
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function includesKeyword(message: string, keywords: string[]) {
  const normalized = message.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function hasMathOperator(message: string) {
  return /\d\s*[+\-*/^]\s*\d/.test(message);
}

function uniqueTools(tools: ToolName[]) {
  return Array.from(new Set(tools));
}

function createTimedStep(step: Omit<AgentStep, "startedAt" | "endedAt" | "durationMs">, startedAt: number): AgentStep {
  const endedAt = Date.now();

  return {
    ...step,
    startedAt,
    endedAt,
    durationMs: Math.max(endedAt - startedAt, 0)
  };
}

export function extractCity(message: string) {
  const normalized = message.toLowerCase();
  const foundCity = cities.find((city) => {
    const lowerCity = city.toLowerCase();
    return (
      normalized.includes(`in ${lowerCity}`) ||
      normalized.includes(`${lowerCity} weather`) ||
      normalized.includes(lowerCity)
    );
  });

  if (foundCity === "Bangalore") {
    return "Bengaluru";
  }

  return foundCity ?? "Hyderabad";
}

function extractDirectExpression(message: string) {
  const normalized = message
    .replace(/,/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/₹/g, "")
    .replace(/\b(?:rs\.?|inr)\b/gi, "");

  const candidates =
    normalized
      .match(/[0-9\s.()+\-*/^]+/g)
      ?.map((candidate) => candidate.trim())
      .filter((candidate) => /[+\-*/^]/.test(candidate) && /\d/.test(candidate)) ?? [];

  return candidates.sort((a, b) => b.length - a.length)[0];
}

export function extractCalculationIntent(message: string): CalculationIntent {
  const distanceFirstTaxiMatch = message.match(
    /(\d+(?:\.\d+)?)\s*(?:km|kilometers?)\s*(?:at|@|for|x|×)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*km|\/km|per\s*km)?/i
  );

  if (distanceFirstTaxiMatch) {
    const distanceKm = Number(distanceFirstTaxiMatch[1]);
    const ratePerKm = Number(distanceFirstTaxiMatch[2]);

    return {
      kind: "taxi_cost",
      expression: `${distanceKm} * ${ratePerKm}`,
      distanceKm,
      ratePerKm
    };
  }

  const rateFirstTaxiMatch = message.match(
    /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*km|\/km|per\s*km)\s*(?:for|at)?\s*(\d+(?:\.\d+)?)\s*(?:km|kilometers?)/i
  );

  if (rateFirstTaxiMatch) {
    const ratePerKm = Number(rateFirstTaxiMatch[1]);
    const distanceKm = Number(rateFirstTaxiMatch[2]);

    return {
      kind: "taxi_cost",
      expression: `${distanceKm} * ${ratePerKm}`,
      distanceKm,
      ratePerKm
    };
  }

  const compoundMatch =
    message.match(
      /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(?:at|@)\s*(\d+(?:\.\d+)?)\s*%\s*(?:[^0-9]{0,60})?for\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i
    ) ??
    message.match(
      /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(?:at|@)\s*(\d+(?:\.\d+)?)\s*%/i
    );

  if (compoundMatch) {
    const principal = toNumber(compoundMatch[1] ?? "0");
    const ratePercent = Number(compoundMatch[2] ?? 0);
    const years = Number(compoundMatch[3] ?? 1);

    return {
      kind: "compound_growth",
      expression: `${principal} * (1 + ${ratePercent} / 100) ^ ${years}`,
      principal,
      ratePercent,
      years
    };
  }

  const gstMatch = message.match(
    /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(?:after|including|incl\.?|inclusive\s+of)\s*(\d+(?:\.\d+)?)\s*%\s*gst/i
  );

  if (gstMatch) {
    const finalPrice = toNumber(gstMatch[1] ?? "0");
    const gstPercent = Number(gstMatch[2] ?? 0);

    return {
      kind: "gst_reverse",
      expression: `${finalPrice} / (1 + ${gstPercent} / 100)`,
      finalPrice,
      gstPercent
    };
  }

  const percentageMatch = message.match(
    /(\d+(?:\.\d+)?)\s*%\s*(?:of|on)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i
  );

  if (percentageMatch) {
    const percent = Number(percentageMatch[1] ?? 0);
    const base = toNumber(percentageMatch[2] ?? "0");

    return {
      kind: "percentage",
      expression: `${base} * ${percent} / 100`,
      percent,
      base
    };
  }

  return {
    kind: "direct_expression",
    expression: extractDirectExpression(message) ?? "0"
  };
}

function detectTools(message: string): ToolName[] {
  const tools: ToolName[] = [];

  if (includesKeyword(message, weatherKeywords)) {
    tools.push("weather");
  }

  if (includesKeyword(message, calculatorKeywords) || hasMathOperator(message)) {
    tools.push("calculator");
  }

  if (includesKeyword(message, searchKeywords)) {
    tools.push("web_search");
  }

  return uniqueTools(tools);
}

function summarizeWeather(result: WeatherResult) {
  const fallbackNote = result.isFallback ? " Fallback weather data is being shown because the live API was unavailable." : "";
  return `${result.city} is around ${Math.round(result.temperature)}°C with ${result.conditionText.toLowerCase()}. ${result.recommendation}${fallbackNote}`;
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

function generateFinalAnswer(results: {
  weather?: WeatherResult;
  calculator?: CalculatorResult;
  search?: SearchToolResult;
}) {
  const parts: string[] = [];

  if (results.weather) {
    parts.push(`Weather result: ${summarizeWeather(results.weather)}`);
  }

  if (results.calculator) {
    parts.push(`Calculator result: ${summarizeCalculation(results.calculator)}`);
  }

  if (results.search) {
    parts.push(`Search result: ${summarizeSearch(results.search)}`);
  }

  if (parts.length === 0) {
    return "I can answer best when the question needs a calculator, weather lookup, or web search. Try one of the demo prompts to see the agent loop.";
  }

  if (results.weather && results.calculator) {
    parts.push("Final suggestion: use the weather recommendation before leaving, and use the calculated number for planning your cost or budget.");
  }

  return parts.join(" ");
}

export async function runMockAgent(message: string): Promise<AgentResponse> {
  const steps: AgentStep[] = [];
  const toolsUsed = detectTools(message);
  const results: {
    weather?: WeatherResult;
    calculator?: CalculatorResult;
    search?: SearchToolResult;
  } = {};

  let startedAt = Date.now();
  await sleep(120);
  steps.push(
    createTimedStep(
      {
        id: "step-1",
        type: "thinking",
        title: "Understanding request",
        description: "Agent is analyzing the question and deciding which tools are needed.",
        status: "completed"
      },
      startedAt
    )
  );

  startedAt = Date.now();
  await sleep(80);
  steps.push(
    createTimedStep(
      {
        id: "step-2",
        type: "thinking",
        title: toolsUsed.length > 0 ? "Tool router ready" : "No tool required",
        description:
          toolsUsed.length > 0
            ? `Selected ${toolsUsed.map((tool) => tool.replace("_", " ")).join(", ")} for this request.`
            : "The prompt did not match a supported tool, so the agent will return a safe guidance answer.",
        status: "completed"
      },
      startedAt
    )
  );

  let stepIndex = 3;

  for (const tool of toolsUsed) {
    if (tool === "weather") {
      const city = extractCity(message);
      startedAt = Date.now();
      const result = await runWeatherTool(city);
      results.weather = result;
      steps.push(
        createTimedStep(
          {
            id: `step-${stepIndex++}`,
            type: "tool",
            toolName: "weather",
            title: "Weather tool selected",
            description: `Checking weather for ${city}.`,
            status: "completed",
            result
          },
          startedAt
        )
      );

      startedAt = Date.now();
      await sleep(60);
      steps.push(
        createTimedStep(
          {
            id: `step-${stepIndex++}`,
            type: "result",
            toolName: "weather",
            title: "Weather result received",
            description: summarizeWeather(result),
            status: "completed",
            result
          },
          startedAt
        )
      );
    }

    if (tool === "calculator") {
      const calculationIntent = extractCalculationIntent(message);
      startedAt = Date.now();
      const result = await runCalculator(calculationIntent);
      results.calculator = result;
      steps.push(
        createTimedStep(
          {
            id: `step-${stepIndex++}`,
            type: "tool",
            toolName: "calculator",
            title: "Calculator tool selected",
            description: "Running the safest matching formula with mathjs.",
            status: "completed",
            result
          },
          startedAt
        )
      );

      startedAt = Date.now();
      await sleep(60);
      steps.push(
        createTimedStep(
          {
            id: `step-${stepIndex++}`,
            type: "result",
            toolName: "calculator",
            title: "Calculation result ready",
            description: summarizeCalculation(result),
            status: "completed",
            result
          },
          startedAt
        )
      );
    }

    if (tool === "web_search") {
      startedAt = Date.now();
      const result = await runWebSearchTool(message);
      results.search = result;
      steps.push(
        createTimedStep(
          {
            id: `step-${stepIndex++}`,
            type: "tool",
            toolName: "web_search",
            title: "Web search tool selected",
            description: "Searching for current information with Tavily when configured.",
            status: "completed",
            result
          },
          startedAt
        )
      );

      startedAt = Date.now();
      await sleep(60);
      steps.push(
        createTimedStep(
          {
            id: `step-${stepIndex++}`,
            type: "result",
            toolName: "web_search",
            title: "Search result ready",
            description: summarizeSearch(result),
            status: "completed",
            result
          },
          startedAt
        )
      );
    }
  }

  const answer = generateFinalAnswer(results);

  startedAt = Date.now();
  await sleep(80);
  steps.push(
    createTimedStep(
      {
        id: `step-${stepIndex}`,
        type: "final",
        title: "Final answer",
        description: answer,
        status: "completed"
      },
      startedAt
    )
  );

  return {
    answer,
    steps,
    toolsUsed,
    mode: "mock"
  };
}
