export type AgentStepStatus = "pending" | "running" | "completed" | "error";

export type ToolName = "calculator" | "weather" | "web_search";

export type AgentStepType = "thinking" | "tool" | "result" | "final" | "error";

export type AgentMode = "mock" | "gemini";

export interface AgentRequest {
  message: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

export interface WeatherResult {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rain: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  precipitationProbabilityMax: number;
  recommendation: string;
  source: "Open-Meteo";
  isFallback: boolean;
}

export interface CalculatorResult {
  expression: string;
  result: number;
  explanation: string;
  formattedResult: string;
  source: "mathjs/custom-calculator";
}

export interface SearchToolResult {
  query: string;
  results: SearchResultItem[];
  isMock: boolean;
  source: "tavily" | "mock-search";
}

export type ToolResult = WeatherResult | CalculatorResult | SearchToolResult;

export interface AgentStep {
  id: string;
  type: AgentStepType;
  toolName?: ToolName;
  title: string;
  description: string;
  status: AgentStepStatus;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  result?: ToolResult;
}

export interface AgentResponse {
  answer: string;
  steps: AgentStep[];
  toolsUsed: ToolName[];
  mode: AgentMode;
  error?: string;
}
