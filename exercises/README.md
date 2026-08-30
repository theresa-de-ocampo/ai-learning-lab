# Exercises

Small chapter exercises share a single Node package from this folder.

- `package.json`, `package-lock.json`, and `tsconfig.json` live only at the exercises root.
- `shared/` contains helpers used by more than one chapter.
- Chapter folders may keep their own `lib/` folder for helpers that are specific to that chapter.
- `artifacts/` stores generated outputs from exercise runs.
- `assets/` stores source data used by exercises.

Environment variables are checked at the exercise or helper that needs them:

- `OPENAI_COMPATIBLE_ENV`: `AI_KEY`, `AI_URL`, `AI_MODEL`
- `HUGGING_FACE_ENV`: `HF_TOKEN`
- `SUPABASE_ENV`: `SUPABASE_URL`, `SUPABASE_API_KEY`

## Run An Exercise

Create a `.env` file inside the chapter folder that contains the exercise you want to run. Do not put exercise `.env` files at the exercises root.

For example:

```text
exercises/
  01-intro-to-ai/
    .env
    01-chat-completions.ts
  07-vercel-ai-sdk/
    .env
    01-embeddings.ts
```

Run exercises from inside their chapter folder:

```bash
cd exercises/07-vercel-ai-sdk
npx tsx 01-embeddings.ts
```

Use the filename for whichever exercise you want to run:

```bash
npx tsx 05-web-search.ts
```
