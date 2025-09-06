import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Card, CardBody, CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import toast from "react-hot-toast";

export default function RecipeList() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "recipes"),
      where("uid", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecipes(docs);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  const remove = async (id) => {
    if (!confirm("Delete this recipe?")) return;
    await deleteDoc(doc(db, "recipes", id));
    toast.success("Recipe deleted");
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
        <CardBody>No recipes yet. Add one above!</CardBody>
      </Card>
    );
  }

  const total = recipes.reduce(
    (sum, r) => sum + (typeof r.cost === "number" ? r.cost : 0),
    0
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        Your recipes <span className="text-sm text-neutral-500">(Budget total: ${total.toFixed(2)})</span>
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map((r) => (
          <li key={r.id}>
            <Card>
              <CardHeader title={r.title} subtitle={`${r.time} • $${r.cost ?? "?"}`} />
              <CardBody>
                <ul className="text-sm text-neutral-700 dark:text-neutral-300 list-disc list-inside mb-3">
                  {r.ingredients?.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
                {r.steps?.length > 0 && (
                  <ol className="text-sm text-neutral-500 dark:text-neutral-400 list-decimal list-inside mb-3">
                    {r.steps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>
                )}

                {/* ✅ Plan toggle */}
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <button
                    className={`px-3 h-8 rounded-xl ${
                      r.planned
                        ? "bg-bluetint text-white"
                        : "bg-silver dark:bg-white/10"
                    }`}
                    onClick={async () => {
                      await updateDoc(doc(db, "recipes", r.id), {
                        planned: !r.planned,
                      });
                      toast.success(
                        r.planned ? "Removed from plan" : "Added to plan"
                      );
                    }}
                  >
                    {r.planned ? "Planned ✓" : "Add to plan"}
                  </button>
                  <Button variant="ghost" onClick={() => remove(r.id)}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
