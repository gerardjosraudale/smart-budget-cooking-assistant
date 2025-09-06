import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input, Label, Textarea } from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function Profile() {
  const { currentUser } = useAuth();
  const [weeklyBudget, setWeeklyBudget] = useState("");
  const [dietary, setDietary] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        setWeeklyBudget(d.weeklyBudget ?? "");
        setDietary(Array.isArray(d.dietary) ? d.dietary.join(", ") : "");
      }
      setLoaded(true);
    }
    load();
  }, [currentUser]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          uid: currentUser.uid,
          weeklyBudget: weeklyBudget ? Number(weeklyBudget) : null,
          dietary: dietary
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        { merge: true }
      );
      toast.success("Profile saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader title="Profile" subtitle="Your preferences & budget" />
        <CardBody>
          {!loaded ? (
            <p>Loading…</p>
          ) : (
            <form onSubmit={onSave} className="space-y-4">
              <div>
                <Label htmlFor="budget">Weekly budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={weeklyBudget}
                  onChange={(e) => setWeeklyBudget(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="diet">Dietary tags (comma separated)</Label>
                <Textarea
                  id="diet"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="chicken-free, dairy-free, vegetarian"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
