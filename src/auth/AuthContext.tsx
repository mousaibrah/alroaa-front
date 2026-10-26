import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { EMAIL_NOT_VERIFIED, setUnauthorizedHandler, type ApiError } from '../api/client';
import { getMe } from '../api/users';
import { paths } from '@/routes/paths';
import type { VerifyEmailState } from '../components/auth/VerifyEmailForm';
import { clearAll } from '@/lib/queryCache';
import { clearSession, decodeToken, loadSession, type StoredSession } from '../api/token';
import {
	needsVerification,
	type LoginRequest,
	type RegisterRequest,
	type VerifyEmailRequest,
} from '../types/auth';
import { AuthContext, type AuthContextValue } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
	// Read synchronously so a reload never flashes the logged-out UI.
	const [session, setSession] = useState<StoredSession | null>(loadSession);

	const logout = useCallback(() => {
		clearSession();
		setSession(null);
	}, []);

	// Resolves to the verification details when the email isn't verified yet
	// (no session then), or null once logged in.
	const login = useCallback(async (data: LoginRequest) => {
		const response = await authApi.login(data);
		if (needsVerification(response)) return response;
		setSession(loadSession());
		return null;
	}, []);

	// New accounts are unverified: this only sends the code.
	const register = useCallback((data: RegisterRequest) => authApi.register(data), []);

	const verifyEmail = useCallback(async (data: VerifyEmailRequest) => {
		await authApi.verifyEmail(data);
		setSession(loadSession());
	}, []);

	const refreshSession = useCallback(() => setSession(loadSession()), []);

	const payload = useMemo(() => decodeToken(session?.token ?? null), [session]);

	const navigate = useNavigate();

	// The API client calls this when the backend answers 401 to an
	// authenticated request (revoked or invalid token). An account whose email
	// isn't verified is sent to the code screen, which emails a new code.
	useEffect(() => {
		setUnauthorizedHandler((error: ApiError) => {
			logout();
			if (error.code !== EMAIL_NOT_VERIFIED || !error.email) return;
			const state: VerifyEmailState = {
				email: error.email,
				resendAvailableIn: 0,
				sessionEnded: true,
				sendCode: true,
				from: { pathname: window.location.pathname, search: window.location.search },
			};
			navigate(paths.verifyEmail, { replace: true, state });
		});
	}, [logout, navigate]);

	// Checks a stored session once on load, so one the backend no longer
	// accepts (e.g. an unverified email) ends right away instead of on the
	// first protected request. Also refreshes the stored user.
	useEffect(() => {
		if (!loadSession()) return;
		const controller = new AbortController();
		getMe(controller.signal)
			.then(() => setSession(loadSession()))
			.catch(() => undefined); // a 401 already went through the handler above
		return () => controller.abort();
	}, []);

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
			verifyEmail,
			logout,
			refreshSession,
			hasPermission: (...required) => required.every((p) => permissions.includes(p)),
		};
	}, [session, payload, login, register, verifyEmail, logout, refreshSession]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
