# OpenAI Function Call

A TypeScript example of an agentic workflow using the OpenAI Responses API. The agent can decide when to call available tools, such as looking up the user's location and fetching current weather, before producing its final answer.

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
AI_API_KEY=your_openai_api_key
AI_URL=https://api.openai.com/v1
AI_MODEL=gpt-5-nano
WEATHER_API_KEY=your_weatherapi_key
```

## Where to Get API Keys

- `AI_API_KEY`: create an OpenAI API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
- `AI_MODEL`: choose a supported model from the [OpenAI model docs](https://developers.openai.com/api/docs/models).
- `WEATHER_API_KEY`: sign up at [WeatherAPI.com](https://www.weatherapi.com/signup.aspx), then copy the token from your dashboard.

## Run

Type-check the project:

```bash
npm run typecheck
```

Build and run:

```bash
npx tsc
node dist/index.js
```
