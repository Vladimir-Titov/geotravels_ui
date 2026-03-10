import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth-context'

export const RequireAuth = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate replace to='/auth' state={{ from: location.pathname }} />
  }

  return <Outlet />
}
