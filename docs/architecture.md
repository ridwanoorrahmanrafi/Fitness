# ARISE : The System - Architecture Specification

## 1. System Overview
**ARISE : The System** is an offline-first, dual-AI sports science and fitness intelligence web application inspired by the *Solo Leveling* manhwa. It bridges verified clinical exercise physiology (IPF DOTS formula, Epley & Brzycki 1RM estimators, Mifflin-St Jeor metabolic equations) with culturally authentic Bangladeshi sports nutrition and gamified RPG hunter progression.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    Client[Browser Client PWA] -->|Offline Cache / SW| LocalStorage[Encrypted LocalStorage]
    Client -->|Session Auth| BetterAuth[Better Auth Server /api/auth]
    Client -->|MongoDB Atlas Sync| MongoDB[(MongoDB Atlas Cluster)]
    
    subgraph Serverless Edge Engine
        WorkoutRoute[/api/generate-workout] --> RateLimiter[Sliding Window Rate Limiter]
        RateLimiter --> ZodGuard[16KB Zod Payload Guard]
        ZodGuard --> PrimaryAI[Primary Model: Google Gemini]
        ZodGuard --> SecondaryAI[Secondary Model: OpenAI ChatGPT]
        PrimaryAI --> ConsensusEngine[Dual-AI Biomechanical Reviewer]
        SecondaryAI --> ConsensusEngine
        ConsensusEngine --> DeterministicEngine[Local Deterministic Sports Science Engine]
    end
```

---

## 3. Core Modules & Subsystems

### A. Client State & Offline Engine (`hooks/useStoredState.ts`, `lib/session.ts`)
- **Hydration-Safe Storage**: `useStoredState` renders deterministic initial state on SSR, eliminating React hydration mismatch errors, then seamlessly hydrates from `localStorage`.
- **Zero-Data-Loss Guest Migration (`lib/guest-migration.ts`)**: When an unauthenticated guest logs in or registers via Better Auth, their local workout history, player attributes, and goals are migrated atomically to cloud MongoDB collections without losing a single logged repetition.

### B. Dual-AI Consensus & Security Firewall (`lib/server/consensus.ts`, `lib/server/prompt.ts`)
- **Biomechanical Cross-Verification**: When a workout plan or Bangladeshi diet is generated, a secondary model acts as a Sports Biomechanist / Clinical Nutritionist, verifying joint contraindications, compound lift sequencing, and macronutrient bioavailability.
- **Prompt Injection Neutralization**: `sanitizeUserInput` cleans all free-form limitation notes and wraps inputs inside `<user_data>` XML boundary fences, preventing jailbreaks or instruction overriding.
- **Fail-Open Fallback**: If third-party AI APIs face rate limits (HTTP 429), the system autonomously degrades to deterministic sports-science rules.

### C. Deterministic Sports Science Engine (`lib/calc.ts`, `lib/exercises.ts`)
- **1-Repetition Maximum (1RM)**: Calculated using the average of Epley ($w \cdot (1 + r/30)$) and Brzycki ($w \cdot (36 / (37 - r))$) formulas, safely handling $r \ge 37$ without divide-by-zero errors.
- **IPF DOTS Formula**: Official polynomial coefficients normalizing strength scores across male and female bodyweights ($40\text{kg} \le w \le 220\text{kg}$).
- **Exercise Catalog Integrity**: 100% of movements map to verified muscle groups, movement patterns, and equipment tags with zero dangling progression pointers.

### D. Solo Leveling RPG Progression (`lib/systemStats.ts`)
- **Rank-Adaptive Daily Quests**: Replaces static overtraining with physiologically calibrated demands ($20$ pushups for E-Rank up to $85$ pushups for S-Rank).
- **Monarch Mode**: Unlocks the legendary 100/100/100/10km challenge for high-level hunters with bonus stat rewards.
- **Dynamic Fatigue Model**: Calculates metabolic fatigue accumulation from workout sets ($+3.5\%$ per set) and active recovery reduction ($-25\%$ on rest days).
