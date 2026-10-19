"use server";

import { revalidatePath } from "next/cache";
import { RULE_COLUMNS, type RuleRow } from "@/lib/data/rules";
import { nextRuleVersion, type RuleEdits } from "@/lib/domain/rule-version";
import { getSessionClient, requireUser } from "./audit";

export interface SaveRuleOutcome {
  ok: boolean;
  version?: number;
  error?: string;
}

/**
 * Save a rule's settings as its next version, under the caller's session
 * (RLS: rules_insert_authenticated, 00004). A concurrent save of the same
 * rule loses on the primary key and is reported, never merged.
 */
export async function saveRuleVersionAction(ruleId: string, edits: RuleEdits): Promise<SaveRuleOutcome> {
  try {
    const client = await getSessionClient();
    await requireUser(client);
    const latest = await client
      .from("rules")
      .select(`${RULE_COLUMNS}, resolution_options`)
      .eq("id", ruleId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest.error) throw new Error(`rules: ${latest.error.message}`);
    if (!latest.data) return { ok: false, error: `No rule ${ruleId}.` };
    const next = nextRuleVersion(latest.data as RuleRow, edits);
    if ("error" in next) return { ok: false, error: next.error };
    const insert = await client.from("rules").insert(next.row);
    if (insert.error) {
      if (insert.error.code === "23505") return { ok: false, error: "Someone saved this rule first. Reload and try again." };
      throw new Error(`rules: ${insert.error.message}`);
    }
    revalidatePath("/policies");
    return { ok: true, version: next.row.version };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
