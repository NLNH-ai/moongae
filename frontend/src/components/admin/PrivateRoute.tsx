import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasAdminToken } from '../../utils/auth'

function PrivateRoute() {
  const location = useLocation()

  if (!hasAdminToken()) {
    return <Navigate replace state={{ from: location }} to="/admin" />
  }

  return <Outlet />
}

export default PrivateRoute
