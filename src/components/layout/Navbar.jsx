import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-black/30 border-b border-black/5 dark:border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-bluetint to-purple-600"></div>
          <span className="font-semibold">Smart Budget Cooking</span>
        </Link>
        <nav className="flex items-center gap-2">
          {!currentUser && (
            <>
              <Link to="/login"><Button variant="ghost">Log in</Button></Link>
              <Link to="/signup"><Button>Sign up</Button></Link>
            </>
          )}
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-300 hidden sm:block">{currentUser.email}</span>
              <div className="w-8 h-8 rounded-2xl bg-silver dark:bg-white/10 flex items-center justify-center text-xs font-semibold">
                {currentUser.email?.slice(0,1).toUpperCase()}
              </div>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
