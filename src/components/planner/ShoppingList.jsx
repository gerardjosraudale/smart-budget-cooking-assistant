import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { buildShoppingList, shoppingListText } from "../../utils/shoppingList";

export default function ShoppingList({ days, recipesById, checked, onToggle, onClearChecked }) {
  const [hideChecked, setHideChecked] = useState(false);
  const { sections, count } = useMemo(() => buildShoppingList(days, recipesById), [days, recipesById]);

  // Only count check-offs for items that are still on this week's list.
  const checkedCount = sections.reduce((n, s) => n + s.items.filter((i) => checked[i.key]).length, 0);
  const remaining = count - checkedCount;

  const copy = async () => {
    const text = shoppingListText(sections, checked);
    if (!text) {
      toast("Everything is checked off");
      return;
    }
    try {
      await navigator.clipboard.writeText(`Shopping list\n\n${text}`);
      toast.success("Shopping list copied");
    } catch {
      toast.error("Couldn't copy. Your browser blocked clipboard access.");
    }
  };

  if (count === 0) {
    return (
      <Card>
        <CardHeader title="Shopping list" subtitle="Plan some dinners and their ingredients will show up here." />
        <CardBody />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Shopping list"
        subtitle={
          remaining === 0
            ? `All ${count} items checked off 🎉`
            : `${remaining} of ${count} items left, from this week's dinners`
        }
      />
      <CardBody>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={copy}>
            Copy list
          </Button>
          {checkedCount > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setHideChecked((v) => !v)}>
              {hideChecked ? "Show checked" : "Hide checked"}
            </Button>
          )}
          {checkedCount > 0 && (
            <Button size="sm" variant="ghost" onClick={onClearChecked}>
              Uncheck all
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {sections.map((section) => {
            const items = hideChecked ? section.items.filter((i) => !checked[i.key]) : section.items;
            if (items.length === 0) return null;
            return (
              <div key={section.name}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
                  {section.name}
                </h4>
                <ul>
                  {items.map((item) => {
                    const isChecked = !!checked[item.key];
                    const days = item.meals.map((m) => m.day).join(", ");
                    return (
                      <li key={item.key}>
                        <label className="flex items-start gap-3 py-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-bluetint"
                            checked={isChecked}
                            onChange={() => onToggle(item.key)}
                          />
                          <span className="min-w-0">
                            <span className={isChecked ? "line-through text-neutral-400" : ""}>{item.name}</span>
                            <span
                              className="block text-xs text-neutral-500 dark:text-neutral-400"
                              title={item.meals.map((m) => `${m.day}: ${m.title}`).join("\n")}
                            >
                              {item.meals.length > 1 ? `${item.meals.length} meals · ${days}` : `${days} · ${item.meals[0].title}`}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Tip: check off what you already have at home before you go.
        </p>
      </CardBody>
    </Card>
  );
}
