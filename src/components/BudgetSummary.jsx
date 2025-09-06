import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { Card, CardBody, CardHeader } from "./ui/Card";

export default function BudgetSummary() {
  const { currentUser } = useAuth();
  const [plannedTotal, setPlannedTotal] = useState(0);
  const [weeklyBudget, setWeeklyBudget] = useState(null);

  useEffect(() => {
    // Listen to planned recipes
    const q = query(
      collection(db, "recipes"),
      where("uid", "==", currentUser.uid),
      where("planned", "==", true)
    );
    const unsub = onSnapshot(q, (snap) => {
      const total = snap.docs.reduce((sum, d) => {
        const v = d.data().cost;
        return sum + (typeof v === "number" ? v : 0);
      }, 0);
      setPlannedTotal(total);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    // Load user profile budget once
    (async () => {
      const ref = doc(db, "users", currentUser.uid);
      const s = await getDoc(ref);
      setWeeklyBudget(s.exists() ? s.data().weeklyBudget ?? null : null);
    })();
  }, [currentUser]);

  const diff = weeklyBudget != null ? weeklyBudget - plannedTotal : null;
  const status =
    diff == null ? "—" : diff >= 0 ? `Under by $${diff.toFixed(2)}` : `Over by $${Math.abs(diff).toFixed(2)}`;

  return (
    <Card className="mt-6">
      <CardHeader title="This week’s plan" subtitle="Budget summary" />
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Weekly budget</div>
            <div className="text-2xl font-semibold">
              {weeklyBudget != null ? `$${weeklyBudget.toFixed(2)}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Planned total</div>
            <div className="text-2xl font-semibold">${plannedTotal.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Status</div>
            <div className={`text-2xl font-semibold ${diff != null && diff < 0 ? "text-red-600" : "text-green-600"}`}>
              {status}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
