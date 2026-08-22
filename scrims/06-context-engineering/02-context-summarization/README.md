# LLM Context Summarization

An AI engineering scrim that demonstrates how a chat application can preserve useful conversation continuity when the full transcript no longer fits inside an LLM context window.

The project starts with an intentionally long seeded conversation, lets the user keep chatting, and compacts older turns into an AI-generated summary before sending the next model request. The complete transcript remains available in browser state for the UI, while the model receives only a smaller working context made from the summary plus the most recent messages.

## What This Demonstrates

This repository is part of my AI learning portfolio. It focuses on context engineering rather than UI complexity, and shows several production-relevant LLM application patterns:

- **Context window management:** measuring conversation size before every model call instead of assuming the full chat history is safe to send.
- **Summarization-based compaction:** replacing older messages with a concise summary once the active context crosses a defined threshold.
- **Separation of display state and model state:** keeping the full conversation for the user while sending a reduced context to the LLM.
- **Token budget design:** reserving room for recent context, summary output, system/provider overhead, and the assistant's next response.
- **Failure handling:** surfacing summarization or generation errors in the chat instead of silently losing state.

## Token Budget Strategy

The app uses a fixed simulated context window and derives the compaction thresholds from it:

| Variable                | Formula |   Tokens |
| ----------------------- | ------: | -------: |
| Context window          |  `100%` | `32,768` |
| Compaction trigger      |   `80%` | `26,214` |
| Target after compaction |   `50%` | `16,384` |
| Max summary output      | `12.5%` |  `4,096` |

## Setup

Install dependencies:

```bash
npm install
```

Create an account at [OpenRouter](https://openrouter.ai/), generate an API key, then create a `.env` file in the project root:

```bash
OPENROUTER_KEY=your_openrouter_api_key
MODEL_ID=provider/model-id-with-33k-context
```

Use a model with a large enough context window for the seeded conversation. The app is configured around a `32,768` token context window in `constants.js`.

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

> [!WARNING]
> This is a learning exercise, so the OpenRouter key is exposed through the Vite client environment. In a production app, model calls should go through a backend endpoint so API keys stay server-side.

## Possible Extensions

- Add a server-side API route so provider keys are never exposed to the browser.
- Use model-specific tokenizers and context limits instead of a fixed simulated window.
- Store summaries as structured memory with fields for facts, decisions, open tasks, and unresolved questions.
