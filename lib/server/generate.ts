import { allowedExercises, buildOfflinePlan, fitToTime, sanitizeAiPlan } from "../builder";
import { profileStats } from "../calc";
import { LlmPlanSchema } from "../schemas";
import type { Feedback, GenerateRequest, PlanMeta, Profile, WorkoutPlan } from "../types";
import { SYSTEM_INSTRUCTION, buildPrompt, buildResponseSchema } from "./prompt";

export interface ModelCallArgs {
  model: string;
  system: string;
  prompt: string;
  schema: object;
}
export type ModelCaller = (args: ModelCallArgs) => Promise<string>;

export interface GenerateOutput {
  plan: WorkoutPlan;
  meta: PlanMeta;
  warning?: string;
}

function statusOf(err: unknown): number | undefined {
  const s = (err as { status?: unknown })?.status;
  return typeof s === "number" ? s : undefined;
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200);
}

/**
 * Orchestrates generation:
 *  1. hard-filter the exercise library in code
 *  2. ask the model to choose from that list (structured JSON)
 *  3. validate + clamp everything; retry once with the error; try the fallback model
 *  4. if all of that fails, build deterministically and say so
 */
export async function generatePlan(
  req: GenerateRequest,
  opts: { callModel?: ModelCaller; models: string[] },
): Promise<GenerateOutput> {
  const { profile, feedback } = req;
  const meta: PlanMeta = (({ bmi, bmiCategory, bmr, tdee }) => ({ bmi, bmiCategory, bmr, tdee }))(profileStats(profile));
  const seed = req.seed ?? Math.floor(Math.random() * 1_000_000_000);

  const offline = (warning?: string): GenerateOutput => {
    const { plan, warnings } = buildOfflinePlan(profile, feedback, seed);
    const all = [warning, ...warnings].filter(Boolean).join(" ");
    return { plan, meta, warning: all || undefined };
  };

  if (req.offline) return offline();
  if (!opts.callModel) {
    return offline("No Gemini API key is configured on the server, so this plan was built locally (no AI).");
  }

  const { exercises: allowed, warnings: allowedWarnings } = allowedExercises(profile, feedback?.soreMuscles ?? []);
  if (allowed.length < 4) {
    return offline("Too little matches your equipment for the AI to work with, so this plan was built locally.");
  }

  const prompt = buildPrompt(profile, feedback, allowed);
  const schema = buildResponseSchema(allowed, profile);
  let lastIssue = "";

  for (const model of opts.models) {
    let attemptPrompt = prompt;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = await opts.callModel({ model, system: SYSTEM_INSTRUCTION, prompt: attemptPrompt, schema });
        const parsed = LlmPlanSchema.parse(JSON.parse(text));
        const plan = sanitizeAiPlan(parsed, profile, feedback, allowed, model);
        return { plan, meta, warning: allowedWarnings.join(" ") || undefined };
      } catch (err) {
        lastIssue = describe(err);
        const status = statusOf(err);
        // Rate limit / auth / missing model: retrying the same model will not help.
        if (status === 429 || status === 401 || status === 403 || status === 404) break;
        attemptPrompt = `${prompt}\n\nYour previous reply was rejected (${lastIssue}). Reply again with valid JSON that follows the schema and only uses allowed ids.`;
      }
    }
  }

  console.error("AI generation failed, using offline builder:", lastIssue);
  return offline("The AI coach was unavailable (rate limit or an invalid reply), so this plan was built locally.");
}

export type { Feedback, Profile };
export { fitToTime };
