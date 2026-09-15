# Souvik Pramanik — Advanced AI DevOps Assistant v8

Resilient Gemini-backed AI gateway for the portfolio. The browser calls the Node/Express backend; Gemini credentials remain server-side.

## v8 improvements

- Primary stable Gemini model: `gemini-3.6-flash`
- Automatic fallback chain: `gemini-3.6-flash` → `gemini-3.5-flash-lite` → `gemini-3.5-flash`
- Exponential backoff for transient `429`, `500`, `502`, `503`, and `504` errors
- Bounded retries per model
- `/api/health` reports configured models and retry policy
- `/api/ask` reports which model actually answered and whether fallback was used
- Existing AI modes and Linux terminal `ask` command remain compatible
- Optional Google Search grounding remains available through the `liveWeb` request flag

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` beside `server.js`:

```env
GEMINI_API_KEY=your_private_key
GEMINI_MODELS=gemini-3.6-flash,gemini-3.5-flash-lite,gemini-3.5-flash
GEMINI_RETRIES=2
GEMINI_RETRY_BASE_MS=800
PORT=3000
ALLOWED_ORIGIN=http://localhost:3000
GITHUB_USERNAME=Souvik-Pramanik
```

Do not commit `.env` or the API key.

3. Start:

```bash
npm start
```

4. Open `http://localhost:3000` and use the portfolio terminal:

```bash
ask "how does docker networking work?"
```

## Model selection

To change the failover order, edit `GEMINI_MODELS` as a comma-separated list. Keep stable model IDs in production.

The gateway intentionally does not retry invalid-key or other non-transient 4xx errors. Temporary capacity/rate errors are retried with exponential backoff, then the next model is tried.
