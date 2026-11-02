import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Input";
import Button from "../components/ui/Button";
import { friendlyAuthError } from "../utils/authErrors";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists for this email.
      if (err?.code === "auth/user-not-found") setSent(true);
      else setError(friendlyAuthError(err, "Couldn't send the reset email. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader title="Reset password" subtitle="We'll email you a link to choose a new one" />
        <CardBody>
          {sent ? (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox and spam folder.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-sm">
            <Link to="/login" className="text-bluetint hover:underline">Back to log in</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
