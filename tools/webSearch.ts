import type { SearchToolResult } from "@/lib/types";

const TAVILY_TIMEOUT_MS = 7000;

function mockSearch(query: string): SearchToolResult {
  return {
    query,
    results: [
      {
        title: "Web search not enabled",
        url: "",
        content: "Add TAVILY_API_KEY in .env.local to enable real-time web search."
      }
    ],
    isMock: true,
    source: "mock-search"
  };
}

interface TavilyResponse {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    snippet?: string;
  }>;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = TAVILY_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

export async function runWebSearchTool(query: string): Promise<SearchToolResult> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();

  if (!apiKey) {
    return mockSearch(query);
  }

  try {
    const response = await fetchWithTimeout("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false
      })
    });

    if (!response.ok) {
      return mockSearch(query);
    }

    const payload = (await response.json()) as TavilyResponse;
    const results =
      payload.results?.slice(0, 5).map((item) => ({
        title: item.title ?? "Untitled result",
        url: item.url ?? "",
        content: item.content ?? item.snippet ?? "No snippet returned."
      })) ?? [];

    if (results.length === 0) {
      return mockSearch(query);
    }

    return {
      query,
      results,
      isMock: false,
      source: "tavily"
    };
  } catch {
    return mockSearch(query);
  }
}
