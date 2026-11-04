import { DAYS } from "./week";

// Store sections, in the order they're shown. First matching rule wins, so
// more specific rules come first ("chicken broth" is pantry, "hamburger buns" is bakery).
export const SECTIONS = ["Produce", "Meat & seafood", "Dairy & eggs", "Bakery", "Frozen", "Pantry & other"];

const RULES = [
  ["Frozen", ["frozen", "hash brown"]],
  ["Bakery", ["tortilla", "bun", "bagel", "bread", "pita"]],
  ["Pantry & other", ["broth", "canned", "noodle", "pasta", "macaroni", "spaghetti", "penne", "sauce", "mix", "seasoning", "powder", "oil", "rice", "flour", "sugar"]],
  ["Meat & seafood", ["chicken", "beef", "pork", "sausage", "tuna", "pepperoni", "turkey", "fish", "salmon", "shrimp", "bacon", "ham"]],
  ["Dairy & eggs", ["egg", "cheese", "cheddar", "mozzarella", "parmesan", "milk", "butter", "sour cream", "yogurt", "cream"]],
  ["Produce", ["onion", "garlic", "carrot", "celery", "broccoli", "potato", "pepper", "cabbage", "lime", "lemon", "cilantro", "spinach", "zucchini", "fruit", "ginger", "tomato", "lettuce", "apple", "banana", "cucumber", "mushroom", "avocado"]],
];

export function sectionFor(name) {
  const n = name.toLowerCase();
  for (const [section, words] of RULES) {
    if (words.some((w) => new RegExp(`\\b${w}`).test(n))) return section;
  }
  return "Pantry & other";
}

// "2 cups Rice " -> "rice"; drops leading amounts and units people sometimes type.
export function cleanIngredient(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\d\s/.½¼¾-]+(cups?|tbsp|tsp|tablespoons?|teaspoons?|lbs?|pounds?|oz|ounces?|g|kg|cans?|packages?|bags?)?\.?\s+(of\s+)?/, "")
    .trim();
}

// Key used to merge near-duplicates: "eggs"/"egg", "carrots"/"carrot".
export function ingredientKey(name) {
  return name.replace(/(?<=[a-z]{3})(es|s)$/, "");
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Combine the ingredients of every planned dinner into one list.
 *
 * @param {object} days          plan days, e.g. { mon: meal|null, ... }
 * @param {Map}    recipesById   current recipes (starter + user) by id
 * @returns {{ sections: {name: string, items: object[]}[], count: number }}
 */
export function buildShoppingList(days, recipesById) {
  const items = new Map();
  DAYS.forEach((d) => {
    const meal = days[d.key];
    if (!meal) return;
    // Prefer the live recipe; fall back to the snapshot saved with the plan.
    const ingredients = recipesById.get(meal.recipeId)?.ingredients || meal.ingredients || [];
    const seenThisMeal = new Set();
    ingredients.forEach((raw) => {
      const name = cleanIngredient(raw);
      if (!name) return;
      const key = ingredientKey(name);
      if (seenThisMeal.has(key)) return;
      seenThisMeal.add(key);
      if (!items.has(key)) {
        items.set(key, { key, name: capitalize(name), section: sectionFor(name), meals: [] });
      }
      items.get(key).meals.push({ day: d.short, title: meal.title });
    });
  });

  const sections = SECTIONS.map((name) => ({
    name,
    items: [...items.values()]
      .filter((i) => i.section === name)
      .sort((a, b) => b.meals.length - a.meals.length || a.name.localeCompare(b.name)),
  })).filter((s) => s.items.length > 0);

  return { sections, count: items.size };
}

// Plain-text version for copying into a text message or notes app.
export function shoppingListText(sections, checked = {}) {
  return sections
    .map((s) => {
      const lines = s.items.filter((i) => !checked[i.key]).map((i) => `• ${i.name}`);
      return lines.length ? `${s.name}\n${lines.join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}
