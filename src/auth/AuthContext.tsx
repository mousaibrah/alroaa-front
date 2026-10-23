import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { clearAll } from '@/lib/queryCache';
import { clearSession, decodeToken, loadSession, type StoredSession } from '../api/token';
import type { LoginRequest, RegisterRequest } from '../types/auth';
import { AuthContext, type AuthContextValue } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
	// Read synchronously so a reload never flashes the logged-out UI.
	const [session, setSession] = useState<StoredSession | null>(loadSession);

	const logout = useCallback(() => {
		clearSession();
		setSession(null);
	}, []);

	const login = useCallback(async (data: LoginRequest) => {
		await authApi.login(data);
		setSession(loadSession());
	}, []);

	const register = useCallback(async (data: RegisterRequest) => {
		await authApi.register(data);
		setSession(loadSession());
	}, []);

	const refreshSession = useCallback(() => setSession(loadSession()), []);

	const payload = useMemo(() => decodeToken(session?.token ?? null), [session]);

	// The API client calls this when the backend answers 401 to an
	// authenticated request (revoked or invalid token).
	useEffect(() => {
		setUnauthorizedHandler(logout);
	}, [logout]);

	// Log out the moment the token expires, even if the tab is idle.
	useEffect(() => {
		if (!payload) return;
		const ms = Math.max(payload.exp * 1000 - Date.now(), 0);
		// setTimeout overflows past ~24.8 days, so clamp it. Tokens that long-lived
		// would log out early; the default is 1h.
		const timer = setTimeout(logout, Math.min(ms, 2 ** 31 - 1));
		return () => clearTimeout(timer);
	}, [payload, logout]);

	// Keep tabs in sync: logging in or out in one tab updates the others.
	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === null || e.key === 'access_token' || e.key === 'auth_user') {
				clearAll(); // another tab changed who is signed in
				setSession(loadSession());
			}
		};
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	const value = useMemo<AuthContextValue>(() => {
		const permissions = payload?.permissions ?? [];
		return {
			user: session?.user ?? null,
			role: payload?.role ?? null,
			permissions,
			isAuthenticated: session !== null,
			login,
			register,
			logout,
			refreshSession,
			hasPermission: (...required) => required.every((p) => permissions.includes(p)),
		};
	}, [session, payload, login, register, logout, refreshSession]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
