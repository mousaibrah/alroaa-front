import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import type { Permission } from '../../auth/permissions';
import { paths } from '@/routes/paths';

// Route guard. Logged-out users go to /login (and come back afterwards);
// logged-in users missing a required permission go to /forbidden.
export default function RequireAuth({
	permissions = [],
	roles,
}: {
	permissions?: Permission[];
	// When set, the user's role must be one of these (e.g. ['admin']).
	roles?: string[];
}) {
	const { isAuthenticated, hasPermission, role } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to={paths.login} replace state={{ from: location }} />;
	}
	if (!hasPermission(...permissions) || (roles && (!role || !roles.includes(role)))) {
		return <Navigate to={paths.forbidden} replace />;
	}
	return <Outlet />;
}
