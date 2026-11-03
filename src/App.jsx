import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Container from "./components/layout/Container";
import RecipeForm from "./components/RecipeForm";
import RecipeList from "./components/RecipeList";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import WeekPlanner from "./components/planner/WeekPlanner";
import { useAuth } from "./context/AuthContext";
import GuestRoute from "./context/GuestRoute";
import ProtectedRoute from "./context/ProtectedRoute";

function Hero() {
  return (
    <div className="pt-8 pb-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Smart Budget Cooking</h1>
      <p className="mt-3 text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl">
        Plan a week of dinners that fits your grocery budget.
      </p>
    </div>
  );
}

export default function App() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-full">
      <Navbar />
      <Container>
        <Hero />
        <Routes>
          <Route
            path="/"
            element={
              currentUser ? (
                <div className="space-y-10 pb-16">
                  <WeekPlanner />
                  <section aria-labelledby="recipes-heading" className="space-y-4">
                    <h2 id="recipes-heading" className="text-2xl font-semibold tracking-tight">
                      My recipes
                    </h2>
                    <RecipeList />
                    <RecipeForm />
                  </section>
                </div>
              ) : (
                <div className="max-w-2xl py-12 text-neutral-700 dark:text-neutral-300">
                  <p className="text-lg">Sign in to add recipes and see your personalized list.</p>
                </div>
              )
            }
          />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Container>
    </div>
  );
}
