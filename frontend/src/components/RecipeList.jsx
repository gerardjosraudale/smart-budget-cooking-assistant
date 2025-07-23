// src/components/RecipeList.jsx
import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

function RecipeList() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "recipes"), (snapshot) => {
      setRecipes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "recipes", id));
      toast.success("Recipe deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <h2>Your Recipes</h2>
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <h3>{recipe.title}</h3>
          <p><strong>Ingredients:</strong> {recipe.ingredients.join(", ")}</p>
          <p><strong>Time:</strong> {recipe.time}</p>
          <button onClick={() => handleDelete(recipe.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default RecipeList;
