import { createSlice } from '@reduxjs/toolkit'

export const AUTH_STORAGE_KEY = 'vnc.auth'

const emptyAuth = { token: null, user: null }

// Load the saved login so a page refresh keeps the user signed in.
function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    const saved = raw ? JSON.parse(raw) : null
    return saved?.token ? { token: saved.token, user: saved.user } : emptyAuth
  } catch {
    return emptyAuth
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: readStoredAuth,
  reducers: {
    // Payload is the /api/auth/login response: { token, user }.
    loggedIn: (_state, action) => ({
      token: action.payload.token,
      user: action.payload.user,
    }),
    loggedOut: () => emptyAuth,
  },
  selectors: {
    selectToken: (state) => state.token,
    selectUser: (state) => state.user,
    selectIsAuthenticated: (state) => Boolean(state.token),
  },
})

export const { loggedIn, loggedOut } = authSlice.actions
export const { selectToken, selectUser, selectIsAuthenticated } =
  authSlice.selectors
export default authSlice
