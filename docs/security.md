# ARISE : The System - Security Specification & Threat Model

## 1. Security Architecture Principles

1. **Zero Hardcoded Secrets**:
   - Zero API keys, project references, or fallback passwords exist in client bundles, server routes, or source repositories.
   - Runtime configuration is strictly validated on application boot via Zod schemas in `lib/env.ts`.

2. **Defense in Depth**:
   - Security boundaries exist at the HTTP transport layer (CSP & HSTS headers), API gateway layer (16KB payload limit & rate limiting), application layer (Zod request parsing & prompt sanitization), and database layer (PostgreSQL Row-Level Security).

---

## 2. Threat Model & Mitigations

| Threat Vector | Severity | Attack Mechanism | Implemented Mitigation |
| :--- | :--- | :--- | :--- |
| **Cross-Tenant Data Leakage** | Critical | Unauthorized user queries another user's workout or evaluation records. | PostgreSQL Row-Level Security (RLS) enforced on all tables; `auth.uid() = user_id` strictly verified on SELECT/INSERT/UPDATE/DELETE. |
| **Prompt Injection / Jailbreak** | High | Attacker embeds `<system>` or `ignore previous instructions` in physical limitations to hijack AI output. | `sanitizeUserInput` strips XML tags, markdown blocks, and known jailbreak triggers; user inputs are encapsulated within explicit `<user_data>` boundary tags. |
| **Denial of Service / Quota Exhaustion** | High | Automated bot spams `/api/generate-workout` or `/api/generate-diet` to burn external LLM API credits. | In-memory sliding-window rate limiting (Hunter: 20/hr, Access Code: 15/hr, Guest: 3/24h) plus a strict 16KB POST payload ceiling. |
| **XSS & Framing Attacks** | Medium | Malicious script injection or clickjacking in iframes. | Strict Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`. |
| **Service Dependency Outages** | Medium | Gemini or OpenAI API encounters an outage or returns HTTP 429. | Automatic timeout (25s) and fallback to deterministic local sports-science algorithms. |

---

## 3. Database Security & Tenant Isolation

MongoDB Atlas collections (`profiles`, `workout_sessions`, `user_goals`, `progress_evaluations`, `player_stats`) enforce strict tenant boundaries:
- All mutations and queries require authenticated sessions (`userId` matching the authenticated Better Auth identity).
- Compound unique indexes on `userId` ensure fast lookup and eliminate unauthorized cross-tenant data leaks.
- All MongoDB queries execute server-side within Next.js API route handlers; credentials never leak to client bundles.

---

## 4. Environment Configuration Audit

All environment variables must conform to `lib/env.ts`:
- `BETTER_AUTH_SECRET`: $\ge 32$ characters
- `BETTER_AUTH_URL`: Valid HTTP/HTTPS URL
- `MONGODB_URI`: Valid MongoDB connection URI (`mongodb+srv://...`)
- `GEMINI_API_KEY` & `OPENAI_API_KEY`: Server-side only
