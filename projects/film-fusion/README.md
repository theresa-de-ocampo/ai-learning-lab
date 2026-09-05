# Film Fusion

A minimal Express + Vite Vanilla TypeScript demo that reimagines a film as a scene in your chosen style.

## Run locally

Requires Node.js 24 and an OpenAI API key with access to `gpt-image-2`.

1. Run `npm.cmd install`.
2. Copy `.env.example` to `.env` if it does not exist, then set `OPENAI_API_KEY` in `.env`.
3. Run `npm.cmd run start`.
4. Open http://localhost:5173.

`start` launches Express on port 3000 and Vite on port 5173 with labelled logs. Vite forwards `/api` requests to Express. Backend changes restart Node; frontend changes update through Vite. Ctrl+C stops both processes. After editing `.env`, restart the command to load the new key. A Node watch process stays alive after an application error so you can fix the code and save to restart it.

Use `npm` instead of `npm.cmd` on macOS/Linux.

## Production build

```powershell
npm.cmd run build
npm.cmd run serve
```

Open http://localhost:3000. Express serves both the compiled frontend in `dist` and the API. The key is read only by Node and never included in the frontend build. The local `.env` file is ignored by Git.

Node.js 24 runs `server.ts` directly using native TypeScript type stripping. Run `npm.cmd run typecheck` to check both frontend and server types; `build` also runs this check. `tsconfig.server.json` uses Node's module rules separately from the frontend's browser/bundler configuration. No separate server compilation or runtime dependency is needed.

## Structure

```text
server.ts          All backend application logic
index.html         Semantic page markup
src/main.ts        Examples, form handling, and image/loading/error states
src/style.css      Responsive styling
vite.config.ts     Development proxy
.env.example       Configuration template
```

There are no routers, controllers, or service files: this demo has one API endpoint. No database, account system, saved history, or external film lookup is used. Generated images remain only in the current browser page.

## API

`POST /api/generate` accepts JSON:

```json
{ "filmTitle": "Interstellar", "style": "Watercolor" }
```

Both fields must be strings containing 1–200 characters after trimming. Success returns HTTP 200 with `{ "imageDataUrl": "data:image/png;base64,..." }`. Errors return `{ "error": "A readable explanation." }` with an appropriate 4xx or 5xx status.

Each submission requests one 1024×1024 PNG at medium quality from `gpt-image-2`. The server timeout is two minutes; SDK retries are disabled. The browser prevents duplicate submissions and retains the last successful image when a later attempt fails. Real image generation uses your OpenAI API account and incurs API usage.
