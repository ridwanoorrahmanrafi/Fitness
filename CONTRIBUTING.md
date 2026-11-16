# Contributing to ARISE : The System

Thank you for your interest in contributing to **ARISE : The System**! We maintain enterprise-grade software standards, deterministic sports science algorithms, and strict security invariants across our codebase.

---

## 1. Development Principles

1. **Deterministic Biomechanical Safety**:
   - Exercise calculations must adhere strictly to verified sports-science formulas (IPF DOTS, Epley / Brzycki 1RM, Mifflin-St Jeor BMR).
   - All progression algorithms must scale adaptively with Hunter Rank and respect physical limitations.

2. **Security & Zero-Secrets Policy**:
   - Never commit or log API keys, access tokens, or service credentials.
   - All environment variables are validated at runtime via Zod in `lib/env.ts`.

3. **Bilingual Requirement (English & Bangla)**:
   - Every user-facing UI label, button, and prompt must be fully localized in both English (`en`) and Bangla (`bn`). Zero Korean characters in the UI.

4. **Offline First & Zero Data Loss**:
   - The application must function deterministically even without internet access or when AI endpoints are unreachable.
   - Guest data must be safely migratable to authenticated cloud sessions without loss.

---

## 2. Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start local development server
npm run dev

# 4. Run test suite
npm test -- --run

# 5. Verify types and lint
npm run typecheck
npm run lint
```

---

## 3. Pull Request Standards

Before submitting a Pull Request, ensure that:
1. `npm run typecheck` passes with 0 errors.
2. `npm run lint` passes with 0 errors.
3. `npm test -- --run` passes 100% of test suites.
4. `npm run build` generates the production bundle without errors.
5. All new features are covered by dedicated Vitest unit/integration tests.
