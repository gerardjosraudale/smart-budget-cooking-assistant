import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function GuestRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null; // or a tiny spinner
  return currentUser ? <Navigate to="/" replace /> : children;
}
