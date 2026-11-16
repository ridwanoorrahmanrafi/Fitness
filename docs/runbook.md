# ARISE : The System - Operational Runbook

## 1. Deployment Procedures

### Vercel Production Deployment
1. Connect the GitHub repository to Vercel.
2. Set Framework Preset to **Next.js**.
3. Add required environment variables:
   - `NEXT_PUBLIC_APP_URL`: `https://your-domain.vercel.app`
   - `BETTER_AUTH_SECRET`: Generate via `openssl rand -base64 32`
   - `BETTER_AUTH_URL`: `https://your-domain.vercel.app`
   - `MONGODB_URI`: MongoDB Atlas Connection String
   - `GEMINI_API_KEY`: Google AI Studio API Key
   - `OPENAI_API_KEY`: (Optional) OpenAI API Key for live Dual-AI consensus
4. Deploy the `main` branch.

---

## 2. Database Initialization (MongoDB Atlas)

To seed the exercise catalog and initialize MongoDB indexes:
```bash
npm run seed:mongo
```

---

## 3. Health Checks & Diagnostics

The application exposes a real-time system status endpoint:
- **URL**: `GET /api/system-status`
- **Output**: Returns service health for Better Auth, Gemini API, and MongoDB connectivity.

---

## 4. Incident Response & Troubleshooting

### Scenario A: Google Gemini / OpenAI 429 Rate Limit
- **Symptom**: User requests take longer or console displays `Dual-AI reviewer error or rate limit, falling back`.
- **System Behavior**: The system automatically degrades to autonomous deterministic generation. Workouts are built using the verified internal exercise catalog; diets are calibrated using the local Bangladeshi food database.
- **Action**: Check Google Cloud Console / OpenAI Dashboard billing and quota allocations.

### Scenario B: React Client Chunk Loading Error
- **Symptom**: Page displays loading spinner indefinitely or logs `TypeError: __webpack_modules__[moduleId] is not a function`.
- **Root Cause**: `.next` build cache mismatch caused by running `next build` while a dev server was active.
- **Action**: Stop dev server, delete `.next` directory (`rm -rf .next`), and restart `npm run dev`.

### Scenario C: Secret Compromise or Key Rotation
- **Action**:
  1. Immediately revoke the compromised key in Google AI Studio / OpenAI / MongoDB Atlas.
  2. Generate a new key and update the Vercel Project Environment Variables.
  3. Trigger an immediate redeployment in Vercel to invalidate cached edge instances.
