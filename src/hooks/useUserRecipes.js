import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

// Live list of the signed-in user's own recipes.
export function useUserRecipes() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "recipes"),
      where("uid", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(
      q,
      (snap) => {
        setRecipes(snap.docs.map((d) => ({ id: d.id, source: "user", ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  }, [currentUser]);

  return { recipes, loading };
}
