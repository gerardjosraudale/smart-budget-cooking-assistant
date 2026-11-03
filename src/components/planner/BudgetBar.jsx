import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import { formatMoney } from "../../utils/format";

export default function BudgetBar({ budget, planned, onSaveBudget }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  const startEdit = () => {
    setValue(budget != null ? String(budget) : "");
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const n = Number(value);
    if (!value || !Number.isFinite(n) || n <= 0) {
      toast.error("Enter a budget greater than $0");
      return;
    }
    try {
      await onSaveBudget(Math.round(n * 100) / 100);
      setEditing(false);
      toast.success("Budget saved");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save budget");
    }
  };

  if (editing || budget == null) {
    return (
      <form onSubmit={save} className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="weekly-budget" className="block text-sm font-medium mb-1">
            Weekly dinner budget ($)
          </label>
          <Input
            id="weekly-budget"
            type="number"
            inputMode="decimal"
            min="1"
            step="0.01"
            placeholder="60"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-40"
            autoFocus={editing}
          />
        </div>
        <Button type="submit">Save budget</Button>
        {editing && budget != null && (
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
        {budget == null && (
          <p className="w-full text-sm text-neutral-600 dark:text-neutral-400">
            Set a budget to see how your week adds up. Planned so far: {formatMoney(planned)}
          </p>
        )}
      </form>
    );
  }

  const left = budget - planned;
  const over = left < 0;
  const pct = budget > 0 ? Math.min(100, (planned / budget) * 100) : 0;
  const barColor = over ? "bg-red-500" : pct > 85 ? "bg-amber-500" : "bg-green-500";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          <span className="text-2xl font-semibold text-ink dark:text-silver">{formatMoney(planned)}</span>{" "}
          of {formatMoney(budget)} planned
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${over ? "text-red-600" : "text-green-700 dark:text-green-400"}`}>
            {over ? `${formatMoney(-left)} over budget` : `${formatMoney(left)} left`}
          </span>
          <Button size="sm" variant="ghost" onClick={startEdit}>
            Edit
          </Button>
        </div>
      </div>
      <div
        className="mt-2 h-3 w-full rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={planned}
        aria-label="Budget used"
      >
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
