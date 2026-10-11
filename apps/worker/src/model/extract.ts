/**
 * Pull a JSON value out of a model's reply.
 *
 * Real models narrate. They wrap the answer in ```json fences, add a sentence
 * before or after it, or (rarely) emit nothing but prose. None of that is
 * coerced away — extraction only *locates* the answer; the strict schema check
 * that follows decides whether it is acceptable (§11.8 check 1).
 */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced?.[1]) {
    const inner = fenced[1].trim();
    const parsed = tryParse(inner);
    if (parsed.ok) return parsed.value;
  }

  const trimmed = text.trim();
  const direct = tryParse(trimmed);
  if (direct.ok) return direct.value;

  const start = trimmed.indexOf("{");
  if (start === -1) {
    throw new Error("no JSON object found in the model reply");
  }
  const balanced = balancedObject(trimmed, start);
  if (balanced === null) {
    throw new Error("unbalanced JSON object in the model reply");
  }
  const parsed = tryParse(trimmed.slice(start, balanced));
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

function tryParse(text: string): { ok: true; value: unknown } | { ok: false; error: Error } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/** Length of the balanced object starting at `start`, or null. String-aware. */
function balancedObject(text: string, start: number): number | null {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return null;
}
