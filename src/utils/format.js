export function formatMoney(n) {
  return typeof n === "number" && Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

// "20" -> "20 min"; leaves "1 hr" or "20 min" alone.
export function formatTime(t) {
  if (t == null || t === "") return "";
  const s = String(t).trim();
  return /^\d+$/.test(s) ? `${s} min` : s;
}

export function costPerServing(recipe) {
  const { cost, servings } = recipe || {};
  if (typeof cost !== "number" || !servings) return null;
  return cost / servings;
}

// "1. Marinate" / "2) Stir fry" / "- Serve" -> "Marinate" / "Stir fry" / "Serve"
export function stripStepNumber(step) {
  return String(step).replace(/^\s*(?:\d+\s*[.)]|[-*•])\s*/, "");
}
