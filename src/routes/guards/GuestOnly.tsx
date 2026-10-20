import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { paths } from '@/routes/paths';

// Keeps logged-in users away from the login and register pages. Right after a
// login this guard re-renders first, so it must also honour the page the user
// came from (set by RequireAuth and the "Log in" links) instead of the profile.
export default function GuestOnly() {
	const { isAuthenticated } = useAuth();
	const location = useLocation();
	if (!isAuthenticated) return <Outlet />;
	const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
	const destination = from ? `${from.pathname}${from.search ?? ''}` : paths.profile;
	return <Navigate to={destination} replace />;
}
