import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../utils/firebase";
import { useAuth } from "../../context/AuthContext";
import { Card, CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import { DAYS } from "../../utils/week";
import { formatMoney } from "../../utils/format";

const STAPLES = ["rice", "pasta", "eggs", "black beans", "onion", "potatoes", "canned tomatoes", "chicken", "tortillas", "cheese"];

export default function SmartSuggestions({ days, budgetLeft, pantry, dietary, onSavePantry, onPlan }) {
  const { currentUser } = useAuth();
  const [input, setInput] = useState("");
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const [status, setStatus] = useState({}); // index -> "saved" | day label
  const [targetDay, setTargetDay] = useState({});

  const firstEmptyDay = DAYS.find((d) => !days[d.key])?.key || "mon";

  const updatePantry = async (items) => {
    try {
      await onSavePantry(items);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save your pantry");
    }
  };

  const addItems = (text) => {
    const add = text
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const next = [...new Set([...pantry, ...add])].slice(0, 40);
    if (next.length !== pantry.length) updatePantry(next);
    setInput("");
  };

  const suggest = async () => {
    setLoading(true);
    setStatus({});
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          pantry,
          servings,
          budgetLeft,
          dietary,
          avoid: Object.values(days).filter(Boolean).map((m) => m.title),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!data) throw new Error("Suggestions need the server. Locally, run the app with `vercel dev`.");
      if (!res.ok) throw new Error(data.error || "Couldn't get suggestions.");
      setSuggestions(data.suggestions);
      setRemaining(data.remaining);
    } catch (err) {
      toast.error(err.message || "Couldn't get suggestions.");
    } finally {
      setLoading(false);
    }
  };

  // Save a suggestion as one of the user's recipes; returns it with its new id.
  const saveRecipe = async (s) => {
    const recipe = {
      uid: currentUser.uid,
      title: s.title,
      ingredients: [...s.toBuy, ...s.fromPantry],
      steps: s.steps,
      time: `${s.timeMinutes} min`,
      cost: s.estimatedCost,
      servings: s.servings,
      tags: s.tags,
      aiGenerated: true,
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, "recipes"), recipe);
    return { ...recipe, id: ref.id, source: "user" };
  };

  const save = async (s, i) => {
    try {
      await saveRecipe(s);
      setStatus((st) => ({ ...st, [i]: "Saved to My recipes" }));
      toast.success("Saved to My recipes");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save recipe");
    }
  };

  const plan = async (s, i) => {
    const dayKey = targetDay[i] || firstEmptyDay;
    const label = DAYS.find((d) => d.key === dayKey).label;
    try {
      const recipe = await saveRecipe(s);
      await onPlan(dayKey, recipe);
      setStatus((st) => ({ ...st, [i]: `Planned for ${label}` }));
      toast.success(`Added to ${label}`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't add to your plan");
    }
  };

  return (
    <Card>
      <CardHeader
        title="✨ Dinner ideas from your pantry"
        subtitle="Tell us what you have. We'll suggest cheap dinners that use it and fit what's left of your budget."
      />
      <CardBody className="space-y-4">
        <div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addItems(input);
            }}
          >
            <Input
              aria-label="Add pantry items"
              placeholder="Add items, e.g. rice, eggs, beans"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={!input.trim()}>
              Add
            </Button>
          </form>

          {pantry.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Pantry">
              {pantry.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-silver dark:bg-white/10 pl-3 pr-1 h-8 text-sm"
                >
                  {item}
                  <button
                    className="h-6 w-6 rounded-full hover:bg-black/10 dark:hover:bg-white/20"
                    aria-label={`Remove ${item}`}
                    onClick={() => updatePantry(pantry.filter((p) => p !== item))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="mr-2">Quick add:</span>
              {STAPLES.map((s) => (
                <button
                  key={s}
                  onClick={() => addItems(s)}
                  className="mr-2 mb-2 inline-flex h-7 items-center rounded-full border border-dashed border-neutral-300 dark:border-white/20 px-3 hover:border-bluetint hover:text-bluetint"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            Servings
            <select
              className="h-10 rounded-xl bg-white dark:bg-white/5 card-border px-2"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={suggest} disabled={loading || pantry.length === 0}>
            {loading ? "Thinking…" : "Suggest 3 dinners"}
          </Button>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {budgetLeft != null && (budgetLeft > 0 ? `${formatMoney(budgetLeft)} left this week` : "Budget used up, ideas will be extra cheap")}
            {remaining != null && ` · ${remaining} suggestions left today`}
            {dietary.length > 0 && ` · ${dietary.join(", ")}`}
          </span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-neutral-100 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestions.map((s, i) => (
                <li key={`${s.title}-${i}`} className="rounded-2xl card-border p-4 flex flex-col gap-2 bg-white dark:bg-white/5">
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {s.timeMinutes} min · ~{formatMoney(s.estimatedCost)} to buy · serves {s.servings}
                    </div>
                  </div>
                  {s.summary && <p className="text-sm text-neutral-700 dark:text-neutral-300">{s.summary}</p>}
                  {s.fromPantry.length > 0 && (
                    <p className="text-xs">
                      <span className="font-medium text-green-700 dark:text-green-400">Uses: </span>
                      {s.fromPantry.join(", ")}
                    </p>
                  )}
                  {s.toBuy.length > 0 && (
                    <p className="text-xs">
                      <span className="font-medium">To buy: </span>
                      {s.toBuy.join(", ")}
                    </p>
                  )}
                  <details className="text-sm">
                    <summary className="cursor-pointer text-bluetint">Steps</summary>
                    <ol className="mt-1 list-decimal list-inside text-neutral-600 dark:text-neutral-400 space-y-0.5">
                      {s.steps.map((step, j) => (
                        <li key={j}>{step}</li>
                      ))}
                    </ol>
                  </details>
                  <div className="mt-auto pt-2">
                    {status[i] ? (
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">✓ {status[i]}</p>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          aria-label="Day"
                          className="h-8 rounded-xl bg-white dark:bg-white/5 card-border px-2 text-sm"
                          value={targetDay[i] || firstEmptyDay}
                          onChange={(e) => setTargetDay((t) => ({ ...t, [i]: e.target.value }))}
                        >
                          {DAYS.map((d) => (
                            <option key={d.key} value={d.key}>
                              {d.short}
                              {days[d.key] ? " (replace)" : ""}
                            </option>
                          ))}
                        </select>
                        <Button size="sm" onClick={() => plan(s, i)}>
                          Add to plan
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => save(s, i)}>
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              AI-generated ideas with rough cost estimates. Double-check ingredients for allergies.
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
