import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import z from "zod";

async function getWeatherByCity(city: string) {
  let weather = {
    temp: "28.6°C",
    forecast: "Light rain shower"
  };

  if (city === "new york") {
    weather = { temp: "22°C", forecast: "Partly cloudy with a breeze" };
  } else if (city === "london") {
    weather = { temp: "16°C", forecast: "Rainy and overcast" };
  }

  return weather;
}

function buildServer() {
  const server = new McpServer({
    name: "weather-fetcher",
    version: "1.0.0"
  });

  server.registerTool(
    "getWeatherByCity",
    {
      description: "Get weather data in the US.",
      inputSchema: z.object({
        city: z.string()
      })
    },
    async ({ city }: { city: string }) => {
      const weather = await getWeatherByCity(city.toLowerCase());

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weather)
          }
        ]
      };
    }
  );

  server.registerResource(
    "listAvailableCities",
    "weather://cities",
    {
      mimeType: "text/plain"
    },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.href,
            text: `- London (UK) - New York (USA)`
          }
        ]
      };
    }
  );

  return server;
}

async function main() {
  const transport = new StdioServerTransport();
  const server = buildServer();
  await server.connect(transport);

  console.error("🌤️  Weather MCP Server Started!");
  console.error("🛠️  Tool: getWeatherDataByCityName");
  console.error("📚 Resource: weather://cities");
  console.error("🏙️  Supported Cities: New York, London");
  console.error("✅ Server ready!");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
