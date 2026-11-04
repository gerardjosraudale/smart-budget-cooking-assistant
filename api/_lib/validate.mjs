// Input and output validation for /api/suggest. Pure functions, easy to test.

const clampInt = (v, min, max, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

// Strip control characters so pasted text can't break the prompt or the UI.
const cleanText = (v, max) =>
  // eslint-disable-next-line no-control-regex
  typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

const cleanList = (v, maxItems, maxLen) =>
  Array.isArray(v)
    ? [...new Set(v.map((x) => cleanText(x, maxLen).toLowerCase()).filter(Boolean))].slice(0, maxItems)
    : [];

/** Returns { ok: true, value } or { ok: false, error } */
export function parseSuggestRequest(body) {
  if (!body || typeof body !== "object") return { ok: false, error: "Request body must be JSON." };
  const pantry = cleanList(body.pantry, 40, 40);
  if (pantry.length === 0) return { ok: false, error: "Add at least one pantry item first." };

  let budgetLeft = null;
  if (body.budgetLeft != null && body.budgetLeft !== "") {
    const n = Number(body.budgetLeft);
    if (!Number.isFinite(n)) return { ok: false, error: "budgetLeft must be a number." };
    budgetLeft = Math.min(1000, Math.max(0, Math.round(n * 100) / 100));
  }

  return {
    ok: true,
    value: {
      pantry,
      budgetLeft,
      servings: clampInt(body.servings, 1, 12, 4),
      dietary: cleanList(body.dietary, 10, 40),
      avoid: cleanList(body.avoid, 14, 80), // dinners already planned this week
    },
  };
}

// JSON schema the model must fill in (sent as a tool definition).
export const SUGGESTION_SCHEMA = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short dinner name" },
          summary: { type: "string", description: "One sentence on why it's a good cheap dinner" },
          servings: { type: "integer" },
          timeMinutes: { type: "integer" },
          estimatedCost: {
            type: "number",
            description: "Estimated US grocery cost in dollars for the ingredients to buy (not pantry items)",
          },
          fromPantry: { type: "array", items: { type: "string" }, description: "Pantry items this dinner uses" },
          toBuy: { type: "array", items: { type: "string" }, description: "Ingredients the user still needs to buy" },
          steps: { type: "array", items: { type: "string" }, description: "Short steps, no numbering" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["title", "summary", "servings", "timeMinutes", "estimatedCost", "fromPantry", "toBuy", "steps"],
      },
    },
  },
  required: ["suggestions"],
};

/** Check the model's output before it reaches the browser. Drops anything malformed. */
export function sanitizeSuggestions(raw) {
  const list = Array.isArray(raw?.suggestions) ? raw.suggestions : [];
  return list
    .map((s) => {
      const title = cleanText(s?.title, 80);
      const steps = Array.isArray(s?.steps)
        ? s.steps.map((x) => cleanText(x, 300).replace(/^\d+\s*[.)]\s*/, "")).filter(Boolean).slice(0, 12)
        : [];
      const cost = Number(s?.estimatedCost);
      if (!title || steps.length === 0 || !Number.isFinite(cost) || cost < 0) return null;
      return {
        title,
        summary: cleanText(s.summary, 200),
        servings: clampInt(s.servings, 1, 12, 4),
        timeMinutes: clampInt(s.timeMinutes, 5, 240, 30),
        estimatedCost: Math.round(Math.min(cost, 200) * 100) / 100,
        fromPantry: cleanList(s.fromPantry, 20, 40),
        toBuy: cleanList(s.toBuy, 20, 40),
        steps,
        tags: cleanList(s.tags, 5, 20),
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}
