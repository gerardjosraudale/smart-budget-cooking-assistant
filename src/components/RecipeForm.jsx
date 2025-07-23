import { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function RecipeForm() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title || !ingredients || !time) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "recipes"), {
        title,
        ingredients: ingredients.split(",").map((i) => i.trim()),
        time,
        createdAt: serverTimestamp(),
      });
      toast.success("Recipe added!");
      setTitle("");
      setIngredients("");
      setTime("");
    } catch (err) {
      toast.error("Failed to add recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 max-w-md mx-auto mb-8">
      <h2 className="text-xl font-semibold">Add a Custom Recipe</h2>
      <input
        type="text"
        placeholder="Title"
        className="border p-2 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Ingredients (comma-separated)"
        className="border p-2 w-full"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
      <input
        type="text"
        placeholder="Time (e.g., 15 min)"
        className="border p-2 w-full"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
      >
        {loading ? "Adding..." : "Add Recipe"}
      </button>
    </div>
  );
}
