import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import BudgetBar from "./BudgetBar";
import RecipePicker from "./RecipePicker";
import { STARTER_RECIPES } from "../../data/starterRecipes";
import { useUserRecipes } from "../../hooks/useUserRecipes";
import { useWeeklyBudget } from "../../hooks/useWeeklyBudget";
import { useWeekPlan } from "../../hooks/useWeekPlan";
import { autoFillWeek, toMeal } from "../../utils/autofill";
import { DAYS, addWeeks, dayDate, formatWeekRange, toISODate, weekStartOf } from "../../utils/week";
import { costPerServing, formatMoney, formatTime } from "../../utils/format";

export default function WeekPlanner() {
  const [weekStart, setWeekStart] = useState(() => weekStartOf());
  const [pickingDay, setPickingDay] = useState(null);
  const { recipes: userRecipes } = useUserRecipes();
  const { budget, saveBudget } = useWeeklyBudget();
  const { days, loading, error, saveDays, setDay } = useWeekPlan(weekStart);

  const thisWeek = weekStartOf();
  const today = toISODate(new Date());
  const planned = useMemo(
    () => Object.values(days).reduce((s, m) => s + (m?.cost || 0), 0),
    [days]
  );
  const filledCount = Object.values(days).filter(Boolean).length;

  const run = async (fn, okMsg) => {
    try {
      await fn();
      if (okMsg) toast.success(okMsg);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.code === "permission-denied"
          ? "Permission denied saving your plan. Check the Firestore rules."
          : "Couldn't save your plan. Please try again."
      );
    }
  };

  const pick = (recipe) => {
    const day = pickingDay;
    setPickingDay(null);
    run(() => setDay(day, toMeal(recipe)));
  };

  const autoFill = () => {
    if (budget == null) {
      toast.error("Set your weekly budget first so auto-fill can stay within it.");
      document.getElementById("weekly-budget")?.focus();
      return;
    }
    const pool = [...STARTER_RECIPES, ...userRecipes];
    const { days: next, filled, overBudget } = autoFillWeek(days, pool, budget);
    if (filled === 0) {
      toast("Every day already has a dinner. Remove one to auto-fill it.");
      return;
    }
    run(
      () => saveDays(next),
      overBudget
        ? `Filled ${filled} days, but nothing fit the remaining budget. Picked the cheapest options.`
        : `Filled ${filled} ${filled === 1 ? "day" : "days"}`
    );
  };

  const clearWeek = () => {
    if (!confirm("Remove all dinners from this week?")) return;
    run(() => saveDays(Object.fromEntries(DAYS.map((d) => [d.key, null]))), "Week cleared");
  };

  const pickingLabel = DAYS.find((d) => d.key === pickingDay)?.label;

  return (
    <section aria-labelledby="planner-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="planner-heading" className="text-2xl font-semibold tracking-tight">
            Dinner plan
          </h2>
          <div className="mt-1 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
            <Button size="sm" variant="ghost" aria-label="Previous week" onClick={() => setWeekStart(addWeeks(weekStart, -1))}>
              ‹
            </Button>
            <span className="min-w-[9rem] text-center font-medium">{formatWeekRange(weekStart)}</span>
            <Button size="sm" variant="ghost" aria-label="Next week" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              ›
            </Button>
            {weekStart !== thisWeek && (
              <Button size="sm" variant="ghost" onClick={() => setWeekStart(thisWeek)}>
                This week
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {filledCount > 0 && (
            <Button variant="ghost" onClick={clearWeek}>
              Clear week
            </Button>
          )}
          <Button onClick={autoFill} disabled={loading}>
            ✨ Auto-fill my week
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <BudgetBar budget={budget} planned={planned} onSaveBudget={saveBudget} />
        </CardBody>
      </Card>

      {error && (
        <p className="text-sm text-red-600">
          {error.code === "permission-denied"
            ? "Your plan couldn't be loaded: permission denied. The Firestore rules need to allow the plans collection."
            : "Your plan couldn't be loaded. Please refresh."}
        </p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DAYS.map((d, i) => {
          const meal = days[d.key];
          const date = dayDate(weekStart, i);
          const isToday = toISODate(date) === today;
          const per = meal ? costPerServing(meal) : null;
          return (
            <li key={d.key}>
              <Card className={`h-full ${isToday ? "ring-2 ring-bluetint/60" : ""}`}>
                <CardBody className="flex h-full flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold">{d.label}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {isToday ? "Today" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {loading ? (
                    <div className="h-14 rounded-xl bg-neutral-100 dark:bg-white/5 animate-pulse" />
                  ) : meal ? (
                    <>
                      <div>
                        <div className="font-medium">{meal.title}</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {[formatTime(meal.time), formatMoney(meal.cost), per != null && `${formatMoney(per)}/serving`]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                      <div className="mt-auto flex gap-2 text-sm">
                        <Button size="sm" variant="secondary" onClick={() => setPickingDay(d.key)}>
                          Swap
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => run(() => setDay(d.key, null))}>
                          Remove
                        </Button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setPickingDay(d.key)}
                      className="mt-auto h-14 rounded-xl border-2 border-dashed border-neutral-300 dark:border-white/15 text-sm text-neutral-600 dark:text-neutral-400 hover:border-bluetint hover:text-bluetint"
                    >
                      + Add dinner
                    </button>
                  )}
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ul>

      {pickingDay && (
        <RecipePicker
          dayLabel={pickingLabel}
          starterRecipes={STARTER_RECIPES}
          userRecipes={userRecipes}
          onPick={pick}
          onClose={() => setPickingDay(null)}
        />
      )}
    </section>
  );
}
