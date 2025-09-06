import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-steel">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Smart Budget Cooking
          </span>
        </Link>

        {currentUser ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600 dark:text-neutral-300 hidden sm:block">
              {currentUser?.email}
            </span>
            <Link to="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <div className="w-8 h-8 rounded-2xl bg-silver dark:bg-white/10 flex items-center justify-center text-xs font-semibold">
              {currentUser?.email?.slice(0, 1).toUpperCase()}
            </div>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
