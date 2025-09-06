import { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Card, CardBody, CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import { Input, Label, Textarea } from "./ui/Input";
import toast from "react-hot-toast";

export default function RecipeForm() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title || !ingredients || !time) {
      toast.error("Please fill in title, ingredients, and time");
      return;
    }
    setSaving(true);
    try {
      const ingArr = ingredients.split(",").map((s) => s.trim()).filter(Boolean);
      const stepsArr = steps ? steps.split("\n").map((s) => s.trim()).filter(Boolean) : [];
      await addDoc(collection(db, "recipes"), {
        uid: currentUser.uid,
        title,
        ingredients: ingArr,
        steps: stepsArr,
        time,
        cost: cost ? Number(cost) : null,
        planned: false,                  // ✅ new
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setIngredients("");
      setSteps("");
      setTime("");
      setCost("");
      toast.success("Recipe added");     // ✅ feedback
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Add a recipe"
        subtitle="Keep it simple. Estimate cost to track your budget."
      />
      <CardBody>
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chicken rice bowl"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
            <Input
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="rice, chicken, soy sauce, broccoli"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="steps">Steps (one per line, optional)</Label>
            <Textarea
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={"1. Marinate\n2. Stir fry\n3. Serve"}
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="20 min"
            />
          </div>

          <div>
            <Label htmlFor="cost">Estimated cost ($)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="7.50"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add recipe"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
