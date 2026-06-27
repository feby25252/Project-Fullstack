import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loading from './Loading';

export default function AdminRoute() {
  const { isLoggedIn, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <Outlet />;
}
