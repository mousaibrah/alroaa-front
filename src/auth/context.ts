import { createContext } from 'react';
import type { LoginRequest, RegisterRequest, User } from '../types/auth';
import type { Permission } from './permissions';

export interface AuthContextValue {
	user: User | null;
	role: string | null;
	permissions: string[];
	isAuthenticated: boolean;
	login: (data: LoginRequest) => Promise<void>;
	register: (data: RegisterRequest) => Promise<void>;
	logout: () => void;
	hasPermission: (...required: Permission[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
