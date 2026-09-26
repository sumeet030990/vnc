import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'

const STORAGE_KEY = 'vnc.user'

// TODO: the backend has no token yet, so this only remembers who logged in.
// Anyone can edit localStorage — add a server-side session/token before going live.
function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredUser(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked (e.g. private mode) — the session just won't survive a refresh.
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback((nextUser) => {
    writeStoredUser(nextUser)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    writeStoredUser(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export default AuthProvider
