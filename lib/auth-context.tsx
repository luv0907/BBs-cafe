'use client'

import * as React from 'react'
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User 
} from 'firebase/auth'
import { auth } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    console.log("AuthProvider: Initializing listener...")
    
    // Safety timeout: If Firebase takes way too long, stop blocking UI
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("AuthProvider: Timeout reached. Setting loading to false.")
        setLoading(false)
      }
    }, 10000)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthProvider: state changed", user ? "User found" : "No user")
      setUser(user)
      setLoading(false)
      clearTimeout(timeout)
    }, (error) => {
      console.error("AuthProvider: Auth error", error)
      setLoading(false)
      clearTimeout(timeout)
    })

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const login = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Login Error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
