# Changelog - ARISE : The System

All notable changes to this project are documented in this file, adhering to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-11-05 (MongoDB Atlas Migration & Architecture Modernization)
- **Added**: Native MongoDB Atlas integration for multi-tenant cloud synchronization (profiles, workouts, goals, evaluations).
- **Added**: Automated MongoDB exercise seeder (`scripts/seed_mongodb_exercises.ts`) seeding all 93 scientific movements.
- **Changed**: Migrated Better Auth database adapter to MongoDB Atlas natively.
- **Removed**: Completely eradicated Supabase client/server dependencies, scripts, environment variables, and schemas.

---

## [1.0.0] - 2026-10-27 (Enterprise Industry-Level Release)

### Phase 1: Security, Secrets Sanitization & Database Hardening
- **Added**: Runtime environment variable validation using Zod in `lib/env.ts`.
- **Changed**: Completely eradicated hardcoded database fallback credentials, service keys, and test passwords from source code.
- **Added**: Hardened Content Security Policy (CSP) and HTTP security headers in `next.config.mjs`.
- **Added**: Serverless route guards with 16KB payload limits and tiered sliding-window rate limiting in `lib/server/guard.ts`.

### Phase 2: Auth, Identity & Session Consolidation
- **Added**: Zero-data-loss guest migration engine in `lib/guest-migration.ts` with automated unit tests.
- **Added**: Unified hunter authentication state machine hook `useHunterAuth.ts`.
- **Changed**: Synchronized Better Auth and cloud sessions into a unified `UserAccount` identity model.
- **Changed**: Updated `components/HunterAuthModal.tsx` and `app/page.tsx` with automatic background migration upon login and account creation.

### Phase 3: Deterministic Sports Science & Interactive Biomechanics
- **Added**: Validated 1-Repetition Maximum (1RM) engine implementing Epley and Brzycki equations with safe high-rep handling.
- **Added**: Official International Powerlifting Federation (IPF) DOTS polynomial formula and athletic classification standards.
- **Added**: Interactive `components/StrengthCalculatorCard.tsx` with real-time percentage tables, DOTS gauge, and metric/imperial toggling.
- **Changed**: Audited 100% of the movement catalog in `lib/exercises.ts` with automated tests asserting zero broken progression references.
- **Added**: Quick-access profile and strength calculator buttons in top navigation and settings drawer.

### Phase 4: Dual-AI Intelligence & Consensus Hardening
- **Added**: Biomechanical peer-review consensus engine between Google Gemini and OpenAI ChatGPT in `lib/server/consensus.ts`.
- **Added**: Defensive prompt injection firewall in `lib/server/prompt.ts` with XML boundary encapsulation (`<user_data>`).
- **Added**: Resilient JSON code-fence parser (`extractJson`) stripping markdown fences and conversational LLM preambles.
- **Changed**: Clamped consensus safety scores within $[60, 100]$ to prevent model score hallucination.
- **Added**: Fail-open degradation to deterministic sports-science rules upon third-party rate limits.

### Phase 5: Solo Leveling RPG Progression & Enterprise CI/CD
- **Added**: Rank-adaptive Daily Quest scaling in `lib/systemStats.ts` preventing beginner overtraining injuries.
- **Added**: Monarch Mode unlocking the legendary 100/100/100/10km workout for elite hunters.
- **Added**: Dynamic metabolic fatigue model and active recovery reduction mechanics.
- **Fixed**: Node.js ESM bundler compatibility in `tailwind.config.ts` via `createRequire`.
- **Added**: Multi-job GitHub Actions CI pipeline in `.github/workflows/ci.yml`.
- **Added**: Open-source repository governance templates (`CONTRIBUTING.md`, PR template, bug report, and feature request templates).

### Phase 6: PWA Hardening, Dynamic SEO & Release Packaging
- **Added**: Enterprise `public/manifest.webmanifest` with Obsidian theme `#020510` and app shortcuts.
- **Added**: Custom offline Service Worker in `public/sw.js` with cache-first static strategy and network-first API routing.
- **Added**: Dynamic `app/sitemap.ts` and `app/robots.ts` for automated search engine crawling.
- **Added**: Rich OpenGraph, Twitter cards, and Schema.org `SoftwareApplication` JSON-LD structured data in `app/layout.tsx`.
- **Added**: Comprehensive system documentation: `docs/architecture.md`, `docs/security.md`, and `docs/runbook.md`.
