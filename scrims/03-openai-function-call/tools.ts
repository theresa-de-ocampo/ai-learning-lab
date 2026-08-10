import type { Tool } from "openai/resources/responses/responses";
import type { Location, Weather, WeatherApiResponse } from "./types/index.js";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`${response.status} ${errorMessage}`);
  }

  return response.json() as T;
}

async function getLocation(): Promise<Location> {
  const fields = [
    "status",
    "message",
    "country",
    "countryCode",
    "region",
    "regionName",
    "city",
    "zip",
    "lat",
    "lon"
  ].join(",");

  const response = await fetch(`http://ip-api.com/json/?fields=${fields}`);

  return await handleResponse<Location>(response);
}

async function getWeather(location: string): Promise<Weather> {
  const { WEATHER_API_KEY } = process.env;

  if (!WEATHER_API_KEY) {
    throw new Error("Missing WEATHER_API_KEY");
  }

  const response = await fetch(
    `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=no`
  );

  const data = await handleResponse<WeatherApiResponse>(response);

  const { current } = data;

  return {
    tempInCelsius: current.temp_c,
    description: current.condition.text,
    humidity: current.humidity,
    precipitationInMillimeters: current.precip_in,
    chanceOfRain: current.chance_of_rain,
    chanceOfSnow: current.chance_of_snow,
    windKph: current.wind_kph,
    gustKph: current.gust_kph,
    uv: current.uv
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWeatherArgs(args: unknown): args is { location: string } {
  return (
    isRecord(args) &&
    typeof args.location === "string" &&
    args.location.trim().length > 0
  );
}

export const tools: Tool[] = [
  {
    type: "function",
    name: "getLocation",
    description: "Get's the current location of the user.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "getWeather",
    description:
      "Gets the current weather for a location. Pass the user-provided location string when available. If no location is provided, call getLocation first and pass a comma-separated string using lat, and lon.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description:
            "A location query such as city, region, country, or latitude/longitude."
        }
      },
      required: ["location"],
      additionalProperties: false
    },
    strict: true
  }
];

export const availableTools = {
  getLocation: async () => getLocation(),
  getWeather: async (args: unknown) => {
    if (!isWeatherArgs(args)) {
      throw new Error("Invalid arguments for getWeather");
    }

    return getWeather(args.location);
  }
};

export type ToolName = keyof typeof availableTools;

export function isValidTool(name: string): name is ToolName {
  return Object.hasOwn(availableTools, name);
}
