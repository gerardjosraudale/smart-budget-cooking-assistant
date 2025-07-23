// src/App.jsx
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from "./context/ProtectedRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Logout from "./components/Logout";
import { useAuth } from "./context/AuthContext";
import TestFirestore from "./components/TestFirestore";
import RecipeList from "./components/RecipeList";
import RecipeForm from "./components/RecipeForm";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      <h1 className="text-4xl font-extrabold text-purple-700 mb-4">
        Smart Budget Cooking Assistant
      </h1>

      <nav className="mb-4 text-sm space-x-3">
        <Link className="text-blue-600 hover:underline" to="/">Home</Link>
        <Link className="text-blue-600 hover:underline" to="/signup">Signup</Link>
        <Link className="text-blue-600 hover:underline" to="/login">Login</Link>
        {currentUser && <Logout />}
      </nav>

      {currentUser ? (
        <>
          <p className="mb-4 text-gray-600">Welcome, {currentUser.email}</p>
          <TestFirestore />
          <RecipeForm />
        </>
      ) : (
        <p className="text-red-500">You are not logged in.</p>
      )}

      <Routes>
  <Route
    path="/"
    element={
      <ProtectedRoute>
        <>
          <div>Welcome Home!</div>
          <RecipeList />
        </>
      </ProtectedRoute>
    }
  />
  <Route path="/signup" element={<Signup />} />
  <Route path="/login" element={<Login />} />
</Routes>
    </div>
  );
}

export default App;
