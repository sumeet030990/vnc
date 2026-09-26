import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  loggedIn,
  loggedOut,
  selectIsAuthenticated,
  selectUser,
} from '../store/authSlice.js'

export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const login = useCallback(
    (loginResponse) => dispatch(loggedIn(loginResponse)),
    [dispatch],
  )
  const logout = useCallback(() => dispatch(loggedOut()), [dispatch])

  return { user, isAuthenticated, login, logout }
}
