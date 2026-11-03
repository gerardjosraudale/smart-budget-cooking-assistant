import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

// The weekly budget stored on the user's profile document.
export function useWeeklyBudget() {
  const { currentUser } = useAuth();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    return onSnapshot(
      doc(db, "users", currentUser.uid),
      (snap) => {
        const v = snap.exists() ? snap.data().weeklyBudget : null;
        setBudget(typeof v === "number" ? v : null);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  }, [currentUser]);

  const saveBudget = (value) =>
    setDoc(
      doc(db, "users", currentUser.uid),
      { uid: currentUser.uid, weeklyBudget: value },
      { merge: true }
    );

  return { budget, loading, saveBudget };
}
