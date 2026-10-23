import { clearAll } from '@/lib/queryCache';
import type { TokenPayload, User } from '../types/auth';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

// Reads the token claims for UI decisions (e.g. hiding buttons). This does NOT
// verify the signature: the backend is the source of truth for authorization.
export const decodeToken = (token: string | null): TokenPayload | null => {
	if (!token) return null;
	try {
		const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
		return JSON.parse(json) as TokenPayload;
	} catch {
		return null;
	}
};

export const isTokenExpired = (payload: TokenPayload | null): boolean =>
	!payload || payload.exp * 1000 <= Date.now();

export interface StoredSession {
	token: string;
	user: User;
}

export const saveSession = ({ token, user }: StoredSession): void => {
	clearAll(); // nothing cached for the previous user may be shown
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Replaces the stored user after a profile change, keeping the token (and the
// cache: the same person is still signed in).
export const saveUser = (user: User): void => {
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = (): void => {
	clearAll();
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

// Returns the stored session, or null (and cleans up) when it is missing,
// corrupt or the token has expired.
export const loadSession = (): StoredSession | null => {
	const token = getToken();
	const rawUser = localStorage.getItem(USER_KEY);
	if (!token || !rawUser || isTokenExpired(decodeToken(token))) {
		clearSession();
		return null;
	}
	try {
		return { token, user: JSON.parse(rawUser) as User };
	} catch {
		clearSession();
		return null;
	}
};
