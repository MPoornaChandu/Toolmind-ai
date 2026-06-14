import type { WeatherResult } from "@/lib/types";

const WEATHER_TIMEOUT_MS = 6000;

const cityFallbacks: Record<string, { latitude: number; longitude: number; country: string }> = {
  hyderabad: { latitude: 17.385, longitude: 78.4867, country: "India" },
  mumbai: { latitude: 19.076, longitude: 72.8777, country: "India" },
  delhi: { latitude: 28.6139, longitude: 77.209, country: "India" },
  bengaluru: { latitude: 12.9716, longitude: 77.5946, country: "India" },
  bangalore: { latitude: 12.9716, longitude: 77.5946, country: "India" },
  chennai: { latitude: 13.0827, longitude: 80.2707, country: "India" },
  pune: { latitude: 18.5204, longitude: 73.8567, country: "India" },
  kolkata: { latitude: 22.5726, longitude: 88.3639, country: "India" },
  goa: { latitude: 15.2993, longitude: 74.124, country: "India" },
  jaipur: { latitude: 26.9124, longitude: 75.7873, country: "India" },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714, country: "India" }
};

interface GeocodingResponse {
  results?: Array<{
    name?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }>;
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    rain?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    precipitation_probability_max?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

function fetchWithTimeout(url: string, timeoutMs = WEATHER_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

export function mapWeatherCodeToText(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  return "Unknown";
}

function buildRecommendation(rain: number, precipitationProbabilityMax: number) {
  if (rain > 0 || precipitationProbabilityMax > 40) {
    return "Carry an umbrella. Rain or high precipitation probability is showing in the forecast.";
  }

  return "Umbrella is probably not needed based on the current forecast.";
}

function buildFallback(city: string): WeatherResult {
  const key = city.toLowerCase();
  const fallback = cityFallbacks[key] ?? cityFallbacks.hyderabad;
  const normalizedCity = key === "bangalore" ? "Bengaluru" : city;

  return {
    city: normalizedCity || "Hyderabad",
    country: fallback.country,
    latitude: fallback.latitude,
    longitude: fallback.longitude,
    temperature: 28,
    humidity: 58,
    rain: 0,
    precipitation: 0,
    windSpeed: 8,
    weatherCode: 1,
    conditionText: "Cloudy",
    precipitationProbabilityMax: 25,
    recommendation:
      "Weather API fallback is active. Umbrella is probably not needed, but check live weather before leaving.",
    source: "Open-Meteo",
    isFallback: true
  };
}

export async function runWeatherTool(city: string): Promise<WeatherResult> {
  try {
    const encodedCity = encodeURIComponent(city);
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=1&language=en&format=json`;
    const geocodingResponse = await fetchWithTimeout(geocodingUrl);

    if (!geocodingResponse.ok) {
      return buildFallback(city);
    }

    const geocoding = (await geocodingResponse.json()) as GeocodingResponse;
    const location = geocoding.results?.[0];

    if (!location || location.latitude == null || location.longitude == null) {
      return buildFallback(city);
    }

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const forecastResponse = await fetchWithTimeout(forecastUrl);

    if (!forecastResponse.ok) {
      return buildFallback(location.name ?? city);
    }

    const forecast = (await forecastResponse.json()) as ForecastResponse;
    const current = forecast.current;

    if (!current) {
      return buildFallback(location.name ?? city);
    }

    const rain = current.rain ?? 0;
    const precipitation = current.precipitation ?? 0;
    const probability = forecast.daily?.precipitation_probability_max?.[0] ?? 0;
    const weatherCode = current.weather_code ?? 0;

    return {
      city: location.name ?? city,
      country: location.country ?? "India",
      latitude: location.latitude,
      longitude: location.longitude,
      temperature: current.temperature_2m ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      rain,
      precipitation,
      windSpeed: current.wind_speed_10m ?? 0,
      weatherCode,
      conditionText: mapWeatherCodeToText(weatherCode),
      precipitationProbabilityMax: probability,
      recommendation: buildRecommendation(rain, probability),
      source: "Open-Meteo",
      isFallback: false
    };
  } catch {
    return buildFallback(city);
  }
}
