import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { DAYS } from "../utils/week";

const emptyDays = () => Object.fromEntries(DAYS.map((d) => [d.key, null]));

// One Firestore document per user per week: plans/{uid}_{weekStart}
export function useWeekPlan(weekStart) {
  const { currentUser } = useAuth();
  const [days, setDays] = useState(emptyDays);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const planRef = currentUser ? doc(db, "plans", `${currentUser.uid}_${weekStart}`) : null;

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    return onSnapshot(
      doc(db, "plans", `${currentUser.uid}_${weekStart}`),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setDays({ ...emptyDays(), ...(data.days || {}) });
        setChecked(data.checked || {});
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );
  }, [currentUser, weekStart]);

  const saveDays = (nextDays) => {
    setDays(nextDays); // optimistic; the snapshot listener confirms
    return setDoc(planRef, {
      uid: currentUser.uid,
      weekStart,
      days: nextDays,
      checked, // keep shopping-list check-offs when the plan changes
      updatedAt: serverTimestamp(),
    });
  };

  // Shopping-list check-offs live on the same weekly document.
  const saveChecked = (nextChecked) => {
    setChecked(nextChecked);
    return setDoc(planRef, {
      uid: currentUser.uid,
      weekStart,
      days,
      checked: nextChecked,
      updatedAt: serverTimestamp(),
    });
  };

  const toggleChecked = (key) => {
    const next = { ...checked };
    if (next[key]) delete next[key];
    else next[key] = true;
    return saveChecked(next);
  };

  const setDay = (dayKey, meal) => saveDays({ ...days, [dayKey]: meal });

  return { days, checked, loading, error, saveDays, setDay, toggleChecked, saveChecked };
}
