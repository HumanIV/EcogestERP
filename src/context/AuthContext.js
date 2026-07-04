import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AUTH_KEY = 'usuarioActual'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.user && parsed.accessToken) {
      const decoded = decodeJwt(parsed.accessToken)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        return { user: parsed.user, token: parsed.accessToken }
      }
    }
    localStorage.removeItem(AUTH_KEY)
    return null
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = readSession()
    if (session) {
      setUser(session.user)
      setToken(session.token)
    }
    setLoading(false)

    const handleLogout = () => {
      logout()
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    if (!result.success) {
      return result
    }

    const { accessToken, user: userData } = result.data

    if (userData.rol === 'ciudadano') {
      return { success: false, error: 'Acceso denegado. Este portal es solo para administración.' }
    }
    const userPayload = { ...userData }

    const session = { user: userPayload, accessToken }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))

    setUser(userPayload)
    setToken(accessToken)

    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
    setToken(null)
  }, [])

  const register = useCallback(async (data) => {
    const result = await authService.register(data)
    if (!result.success) {
      return result
    }

    const { accessToken, user: userData } = result.data
    const userPayload = { ...userData }

    const session = { user: userPayload, accessToken }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))

    setUser(userPayload)
    setToken(accessToken)

    return { success: true }
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return ctx
}

export default AuthContext
