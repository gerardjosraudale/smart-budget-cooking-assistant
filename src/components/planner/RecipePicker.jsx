import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import { costPerServing, formatMoney, formatTime } from "../../utils/format";

export default function RecipePicker({ dayLabel, starterRecipes, userRecipes, onPick, onClose }) {
  const [tab, setTab] = useState("starter");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const list = useMemo(() => {
    const source = tab === "starter" ? starterRecipes : userRecipes;
    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.ingredients?.some((i) => i.toLowerCase().includes(q)) ||
        r.tags?.some((t) => t.includes(q))
    );
  }, [tab, search, starterRecipes, userRecipes]);

  const tabClass = (t) =>
    `px-3 h-9 rounded-xl text-sm font-medium ${
      tab === t ? "bg-bluetint text-white" : "bg-silver dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Choose dinner for ${dayLabel}`}
        className="w-full sm:max-w-xl max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-steel shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Dinner for {dayLabel}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              ✕
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <button className={tabClass("starter")} onClick={() => setTab("starter")}>
              Starter recipes ({starterRecipes.length})
            </button>
            <button className={tabClass("mine")} onClick={() => setTab("mine")}>
              My recipes ({userRecipes.length})
            </button>
          </div>
          <Input
            className="mt-3"
            placeholder="Search recipes, ingredients, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <ul className="overflow-y-auto p-3 space-y-2">
          {list.length === 0 && (
            <li className="p-4 text-sm text-neutral-600 dark:text-neutral-400">
              {tab === "mine" && userRecipes.length === 0
                ? "You haven't added any recipes yet. Use the starter recipes, or add your own below the planner."
                : "No recipes match your search."}
            </li>
          )}
          {list.map((r) => {
            const per = costPerServing(r);
            return (
              <li key={r.id}>
                <button
                  onClick={() => onPick(r)}
                  className="w-full text-left p-3 rounded-2xl hover:bg-silver dark:hover:bg-white/10 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {[formatTime(r.time), r.servings && `serves ${r.servings}`, ...(r.tags || [])]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">{formatMoney(r.cost)}</div>
                    {per != null && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{formatMoney(per)}/serving</div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        {tab === "starter" && (
          <p className="px-5 py-3 border-t border-black/5 dark:border-white/10 text-xs text-neutral-500 dark:text-neutral-400">
            Starter costs are rough US grocery estimates. Prices vary by store.
          </p>
        )}
      </div>
    </div>
  );
}
