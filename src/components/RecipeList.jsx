import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../utils/firebase";
import { useUserRecipes } from "../hooks/useUserRecipes";
import { Card, CardBody, CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import { costPerServing, formatMoney, formatTime, stripStepNumber } from "../utils/format";

export default function RecipeList() {
  const { recipes, loading } = useUserRecipes();

  const remove = async (id) => {
    if (!confirm("Delete this recipe? Dinners already planned with it stay in your plan.")) return;
    try {
      await deleteDoc(doc(db, "recipes", id));
      toast.success("Recipe deleted");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't delete recipe");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>Loading your recipes…</CardBody>
      </Card>
    );
  }

  if (recipes.length === 0) {
    return (
      <Card>
        <CardBody className="text-neutral-700 dark:text-neutral-300">
          You haven't added your own recipes yet. The planner already includes starter recipes. Add your
          family's favorites below to plan with them too.
        </CardBody>
      </Card>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {recipes.map((r) => {
        const per = costPerServing(r);
        const subtitle = [
          formatTime(r.time),
          formatMoney(r.cost),
          r.servings && `serves ${r.servings}`,
          per != null && `${formatMoney(per)}/serving`,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={r.id}>
            <Card className="h-full">
              <CardHeader title={r.title} subtitle={subtitle} />
              <CardBody>
                <ul className="text-sm text-neutral-700 dark:text-neutral-300 list-disc list-inside mb-3">
                  {r.ingredients?.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
                {r.steps?.length > 0 && (
                  <ol className="text-sm text-neutral-500 dark:text-neutral-400 list-decimal list-inside mb-3">
                    {r.steps.map((s, idx) => (
                      <li key={idx}>{stripStepNumber(s)}</li>
                    ))}
                  </ol>
                )}
                <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                  Delete
                </Button>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
