import type { Tool } from "openai/resources/responses/responses";
import type { Location, Weather } from "./types/index.js";

async function handleResponse(response: Response) {
  let result = null;

  if (response.ok) {
    result = response.json();
  } else {
    const errorMessage = await response.text();
    console.error(`${response.status} ${errorMessage}`);
  }

  return result;
}

async function getLocation(): Promise<Location | null> {
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

  return (await handleResponse(response)) as Location | null;
}

async function getWeather(lat: number, lon: number): Promise<Weather | null> {
  let result = null;
  const { WEATHER_API_KEY } = process.env;

  if (!WEATHER_API_KEY) {
    console.error("Missing WEATHER_API_KEY");
    return null;
  }

  const response = await fetch(
    `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
  );

  const data = (await handleResponse(response)) as { current: any };

  if (data) {
    const { current } = data;
    result = {
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

  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWeatherArgs(args: unknown): args is { lat: number; lon: number } {
  return (
    isRecord(args) &&
    typeof args.lat === "number" &&
    typeof args.lon === "number"
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
      "Get's the current weather based on the location (latitude, longitude).",
    parameters: {
      type: "object",
      properties: {
        lat: {
          type: "number"
        },
        lon: {
          type: "number"
        }
      },
      required: ["lat", "lon"],
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

    return getWeather(args.lat, args.lon);
  }
};

export type ToolName = keyof typeof availableTools;

export function isValidTool(name: string): name is ToolName {
  return Object.hasOwn(availableTools, name);
}
