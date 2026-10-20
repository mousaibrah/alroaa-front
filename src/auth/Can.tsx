import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import type { Permission } from './permissions';

// Renders children only when the user holds all the listed permissions.
export default function Can({
	permissions,
	children,
}: {
	permissions: Permission[];
	children: ReactNode;
}) {
	const { hasPermission } = useAuth();
	return hasPermission(...permissions) ? <>{children}</> : null;
}
