import { configureStore } from '@reduxjs/toolkit'
import authSlice, { AUTH_STORAGE_KEY } from './authSlice.js'

// Redux holds only the login response; other API data lives in React Query.
export const store = configureStore({
  reducer: {
    [authSlice.reducerPath]: authSlice.reducer,
  },
})

// Save the login whenever it changes, so it survives a refresh.
let savedAuth = store.getState().auth
store.subscribe(() => {
  const { auth } = store.getState()
  if (auth === savedAuth) return
  savedAuth = auth
  try {
    if (auth.token) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    else localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Storage blocked (e.g. private mode) — the session just won't survive a refresh.
  }
})
