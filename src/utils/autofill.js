import { DAYS } from "./week";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fill the empty days of a week plan with recipes that fit a budget.
 *
 * - Days that already have a meal are kept as they are.
 * - Picks are random for variety, but each pick leaves enough budget to fill
 *   the remaining empty days with the cheapest recipes available.
 * - Avoids repeating a recipe in the same week when the pool allows it.
 *
 * @param {object} days     current plan, e.g. { mon: meal|null, ... }
 * @param {Array}  recipes  candidates with a numeric `cost`
 * @param {number|null} budget weekly budget; null means no limit
 * @returns {{ days: object, filled: number, overBudget: boolean }}
 */
export function autoFillWeek(days, recipes, budget) {
  const pool = recipes.filter((r) => typeof r.cost === "number" && r.cost >= 0);
  const next = { ...days };
  const empty = DAYS.map((d) => d.key).filter((k) => !next[k]);
  if (pool.length === 0 || empty.length === 0) {
    return { days: next, filled: 0, overBudget: false };
  }

  const used = new Set(Object.values(next).filter(Boolean).map((m) => m.recipeId));
  const spent = Object.values(next).reduce((s, m) => s + (m?.cost || 0), 0);
  let remaining = budget == null ? Infinity : budget - spent;

  // Cheapest total for `n` more meals chosen from `candidates` (excluding `skip`),
  // cycling through them if there are fewer candidates than meals.
  const minCostFor = (n, candidates, skip) => {
    const costs = candidates.filter((r) => r !== skip).map((r) => r.cost).sort((a, b) => a - b);
    if (n === 0) return 0;
    if (costs.length === 0) return skip ? skip.cost * n : 0;
    let total = 0;
    for (let i = 0; i < n; i++) total += costs[i % costs.length];
    return total;
  };

  let overBudget = false;
  empty.forEach((dayKey, i) => {
    const daysLeftAfter = empty.length - i - 1;
    const fresh = pool.filter((r) => !used.has(r.id));
    const candidates = fresh.length ? fresh : pool;
    // A pick fits if, after it, the cheapest unused recipes can still fill the other days.
    const fits = candidates.filter(
      (r) => r.cost + minCostFor(daysLeftAfter, candidates, r) <= remaining + 1e-9
    );

    let pick;
    if (fits.length) {
      pick = shuffle(fits)[0];
    } else {
      // Nothing fits: take the cheapest so we go over budget by as little as possible.
      pick = [...candidates].sort((a, b) => a.cost - b.cost)[0];
      overBudget = budget != null;
    }

    used.add(pick.id);
    remaining -= pick.cost;
    next[dayKey] = toMeal(pick);
  });

  return { days: next, filled: empty.length, overBudget };
}

// What we store in a plan: a snapshot, so the plan still shows if the recipe is deleted.
export function toMeal(recipe) {
  return {
    recipeId: recipe.id,
    source: recipe.source || "user",
    title: recipe.title,
    cost: typeof recipe.cost === "number" ? recipe.cost : 0,
    servings: recipe.servings || null,
    time: recipe.time || "",
  };
}
