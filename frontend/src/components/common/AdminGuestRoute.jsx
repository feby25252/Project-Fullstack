import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loading from './Loading';

/** Redirect to dashboard if admin is already logged in */
export default function AdminGuestRoute() {
  const { isLoggedIn, loading } = useAdminAuth();

  if (loading) return <Loading />;
  if (isLoggedIn) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}
