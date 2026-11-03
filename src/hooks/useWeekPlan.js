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
        setDays({ ...emptyDays(), ...(snap.exists() ? snap.data().days : {}) });
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
      updatedAt: serverTimestamp(),
    });
  };

  const setDay = (dayKey, meal) => saveDays({ ...days, [dayKey]: meal });

  return { days, loading, error, saveDays, setDay };
}
