import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Container from './components/layout/Container'
import RecipeForm from './components/RecipeForm'
import RecipeList from './components/RecipeList'
import Signup from './pages/Signup'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext'
import GuestRoute from "./context/GuestRoute";


<Routes>
  <Route
    path="/"
    element={
      currentUser ? (
        <div className="space-y-6 pb-10">
          <RecipeForm />
          <RecipeList />
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
</Routes>

function Hero() {
  return (
    <div className="pt-8 pb-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Smart Budget Cooking</h1>
      <p className="mt-3 text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl">Plan meals, control costs, and cook simply. Built with Firebase + Vite.</p>
    </div>
  )
}

export default function App() {
  const { currentUser } = useAuth()
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
                <div className="space-y-6 pb-10">
                  <RecipeForm />
                  <RecipeList />
                </div>
              ) : (
                <div className="max-w-2xl py-12 text-neutral-700 dark:text-neutral-300">
                  <p className="text-lg">Sign in to add recipes and see your personalized list.</p>
                </div>
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Container>
    </div>
  )
}
