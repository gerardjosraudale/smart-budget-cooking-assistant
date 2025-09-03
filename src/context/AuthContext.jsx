import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../utils/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value = {
    currentUser,
    loading,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
  }

  return <Ctx.Provider value={value}>{!loading && children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
