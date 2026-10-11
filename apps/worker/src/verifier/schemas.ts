import { z } from "zod";
import { verifierOutputSchema } from "@unify/contracts";

/**
 * The shapes the model is allowed to produce.
 *
 * `verifierOutputSchema` (contracts) is the stored shape; the model is asked
 * for the same object *minus* `modelAndRun`, because run provenance — run id,
 * model, temperature, timing — is a fact the verifier records about the call,
 * not a claim the model gets to make about itself.
 */
export const modelOutputSchema = verifierOutputSchema.omit({ modelAndRun: true });
export type ModelOutput = z.infer<typeof modelOutputSchema>;

/** Pass 1's scope answer. */
export const scopeOutputSchema = z.strictObject({
  applicable: z.boolean(),
  reason: z.string().min(1),
  missingEvidence: z.string().nullable(),
});
export type ScopeOutput = z.infer<typeof scopeOutputSchema>;
