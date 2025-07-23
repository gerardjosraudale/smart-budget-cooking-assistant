import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function TestFirestore() {
  const addRecipe = async () => {
    try {
      const docRef = await addDoc(collection(db, "recipes"), {
        title: "Budget Mac & Cheese",
        ingredients: ["pasta", "cheddar", "milk"],
        time: "10 min",
        createdAt: serverTimestamp()
      });
      console.log("Document added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  return <button onClick={addRecipe}>Add Sample Recipe</button>;
}

export default TestFirestore;