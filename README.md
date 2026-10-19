# Arise Coach

A personal, free AI workout coach. Deterministic code does the maths and the exercise filtering; Gemini only chooses and orders movements from a list your equipment allows.

- **Calculators:** BMI, BMR and maintenance calories (Mifflin-St Jeor), all computed locally. Body measurements are never sent to the AI.
- **Exercise library:** filtered in code by your equipment, level, low-impact setting and sore muscles. The model can only pick from what is left, by id, so it cannot invent a movement you cannot do.
- **Offline builder:** if there is no API key, the model is rate-limited, or it returns something invalid, a plan is built locally and the app tells you so.
- **Workout screen:** set tracking with reps and weight, rest timer (drift-free, beeps and vibration, screen stays awake), per-exercise swap, hold timers.
- **Adaptive:** after each session rate it (too easy / right / too hard) and mark sore muscles; the next plan uses that.
- **Storage:** profile, current session and history live in this browser's localStorage. Export/Import in History for backup.
- **PWA:** installable on your phone from the browser menu.

## Run it

```bash
npm install
cp .env.example .env.local      # then put your key in GEMINI_API_KEY
npm run dev                     # http://localhost:3000
```

Get a free key at https://aistudio.google.com/apikey. Without a key the app still works using the offline builder.

```bash
npm run typecheck
npm test
npm run build && npm start
```

## Deploy free on Vercel

1. Push this folder to a GitHub repo and import it in Vercel.
2. Add environment variables: `GEMINI_API_KEY`, and **`ACCESS_CODE`** (any long string).
3. Open the deployed app, go to Profile and settings, and enter the same access code once.

Without `ACCESS_CODE`, anyone who finds your URL can spend your free quota.

## Settings (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio key |
| `GEMINI_MODEL` | Optional. Default `gemini-flash-latest` |
| `GEMINI_FALLBACK_MODEL` | Optional. Default `gemini-flash-lite-latest` |
| `ACCESS_CODE` | Optional but recommended once public |

Free-tier limits and model names change over time. If generation starts falling back to offline plans, check your quota and the model names in Google AI Studio.

## Layout

```
app/                    page, layout, /api/generate-workout route
components/             exercise card, rest timer, sheets, history
hooks/                  countdown, wake lock, localStorage state
lib/                    calculators, exercise library, plan builder, schemas
lib/server/             Gemini call, prompt, orchestration, access guard
tests/                  unit tests
```

This is training guidance, not medical advice.
