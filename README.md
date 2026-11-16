# ARISE: The System — Enterprise AI Sports Science & Hunter Progression Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.0-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-purple)](https://better-auth.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Sync-green?logo=mongodb)](https://mongodb.com/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-success)](#accessibility)

**ARISE: The System** is a production-grade, bilingual (English & Bengali) athletic training, sports nutrition, and gamified RPG progression system modeled on the Solo Leveling hunter universe. It couples client-side deterministic biomechanics and exercise filtering with a dual-AI consensus architecture (Google Gemini + OpenAI ChatGPT) and an unshakeable offline fallback engine.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js 15 App Router & React 19)"]
        UI["Bilingual Hunter HUD (EN / BN)"]
        LocalEngine["Local Sports Science Engine (Mifflin-St Jeor / Biomechanics)"]
        LocalStorage["Client Storage & Guest State"]
        AuthClient["Better Auth Client (@better-auth/infra Sentinel)"]
        UI --> LocalEngine
        UI --> LocalStorage
        UI --> AuthClient
    end

    subgraph Edge ["Serverless API & Security Layer"]
        Guard["Security Guard (Rate Limit / Access Code / 16KB Limit / 25s Timeout)"]
        AuthServer["Better Auth Server (MongoDB Session Store / Infra Dash)"]
        WorkoutAPI["/api/generate-workout"]
        DietAPI["/api/generate-diet"]
        CSP["Strict CSP & Security Headers (next.config.mjs)"]
    end

    subgraph Intelligence ["Dual-AI Consensus Engine"]
        Gemini["Google Gemini (Primary Coach)"]
        OpenAI["OpenAI ChatGPT (Secondary Peer Reviewer)"]
        ConsensusEngine["Consensus Verification (Biomechanics / Safety Check)"]
        OfflineBuilder["Deterministic Fallback Plan Generator"]
    end

    subgraph Persistence ["Cloud Persistence & Telemetry"]
        MongoDB["MongoDB Atlas (Better Auth Sessions & Cloud Database Sync)"]
    end

    Client -->|HTTPS / Strict Headers| Edge
    WorkoutAPI --> Guard
    DietAPI --> Guard
    Guard --> AuthServer
    WorkoutAPI --> Gemini
    WorkoutAPI --> OpenAI
    Gemini --> ConsensusEngine
    OpenAI --> ConsensusEngine
    ConsensusEngine -->|Fallback if unverified/offline| OfflineBuilder
    Client -->|Cloud Sync| MongoDB
    AuthServer -->|Sessions| MongoDB
```

---

## ✨ Key Features

1. **Dual-AI Consensus & Biomechanical Safety**:
   - Primary athletic generation orchestrated via **Google Gemini** with immediate secondary cross-verification by **OpenAI ChatGPT**.
   - If AI services are rate-limited, unreachable, or absent, the local deterministic engine produces compliant workout and nutrition plans instantly.
2. **Solo Leveling RPG Progression Engine**:
   - Complete hunter classification system (E-Rank to S-Rank, National Level).
   - Dynamic Level, EXP, Fatigue, HP/MP gauges, and 5-point attribute distribution (STR, AGI, VIT, INT, PER).
   - Milestone achievements, rank elevation ceremonies, and shadow army summons.
3. **Enterprise Security & Data Isolation**:
   - Cloud documents protected by user ID boundary verification.
   - Fail-fast environment variable validation via **Zod** (`lib/env.ts`).
   - Hardened HTTP headers: Strict Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.
4. **Resilient Cloud Sync with MongoDB Atlas**:
   - Real-time synchronization of profiles, workouts, goals, and evaluations with **MongoDB Atlas**.
   - Guest mode with automatic offline localStorage migration upon authentication.
5. **Full Internationalization (i18n)**:
   - High-fidelity English and Bengali (`bn`) localization across all screens, calculators, HUD elements, and voice cues.

---

## 🛠️ Environment Configuration

Copy the template to `.env.local`:

```bash
cp .env.example .env.local
```

### Required & Optional Variables

| Variable | Environment | Description |
| :--- | :--- | :--- |
| `BETTER_AUTH_SECRET` | Server | 32+ character cryptographic secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Server | Application base URL (`http://localhost:3000` or production domain) |
| `MONGODB_URI` | Server | MongoDB Atlas replica set URI for auth sessions & cloud sync |
| `MONGODB_DB_NAME` | Server | Database name (default: `fitness`) |
| `GEMINI_API_KEY` | Server | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `OPENAI_API_KEY` | Server | OpenAI API key (optional secondary reviewer) |
| `ACCESS_CODE` | Server | Optional security access PIN to protect public deployments |

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Next.js local development server
npm run dev

# 3. Access in browser
open http://localhost:3000
```

---

## 🧪 Testing & Verification

Every phase and release must pass the complete continuous integration verification suite:

```bash
# 1. Static TypeScript type checking
npm run typecheck

# 2. ESLint code hygiene and Best Practices audit
npm run lint

# 3. Vitest unit & integration test suite (61 tests)
npm run test

# 4. Database Row Level Security (RLS) compliance audit
npm run db:verify

# 5. Production bundle build
npm run build
```

---

## 🗄️ Database Migrations & RLS Verification

MongoDB Atlas collections and indexes can be initialized and seeded with 90+ exercises at any time:
```bash
npm run seed:mongo
```

---

## 🔒 Security Principles

- **Zero Hardcoded Secrets**: Secrets are validated strictly at runtime with Zod in `lib/env.ts`. No fallback keys exist in source code or Git history.
- **Defensive API Rate Limiting**: Tiered limits protect AI routes against resource exhaustion (Hunter: 20/hr, Access Code: 15/hr, Guest: 3/day).
- **Safe Timeouts & Payload Bounds**: AI generation calls are strictly bounded to 25 seconds with 16KB max payload checks.

---

## 📜 Medical & Sports Disclaimer

*ARISE: The System is an algorithmic and sports science educational guide, not a medical practitioner. Consult a qualified physician before starting any intense physical conditioning program.*
