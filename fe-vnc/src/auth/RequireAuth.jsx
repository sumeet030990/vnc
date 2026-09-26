import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth.js'

// Wrap any group of routes with this to keep them behind login.
function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Remember where the user was going so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default RequireAuth
