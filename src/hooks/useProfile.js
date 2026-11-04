import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

// Live view of the user's profile document: weekly budget, pantry, dietary tags.
export function useProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({ budget: null, pantry: [], dietary: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    return onSnapshot(
      doc(db, "users", currentUser.uid),
      (snap) => {
        const d = snap.exists() ? snap.data() : {};
        setProfile({
          budget: typeof d.weeklyBudget === "number" ? d.weeklyBudget : null,
          pantry: Array.isArray(d.pantry) ? d.pantry : [],
          dietary: Array.isArray(d.dietary) ? d.dietary : [],
        });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  }, [currentUser]);

  const save = (fields) =>
    setDoc(doc(db, "users", currentUser.uid), { uid: currentUser.uid, ...fields }, { merge: true });

  return {
    ...profile,
    loading,
    saveBudget: (value) => save({ weeklyBudget: value }),
    savePantry: (items) => save({ pantry: items }),
  };
}
