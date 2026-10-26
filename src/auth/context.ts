import { createContext } from 'react';
import type {
	LoginRequest,
	RegisterRequest,
	User,
	VerificationRequired,
	VerifyEmailRequest,
} from '../types/auth';
import type { Permission } from './permissions';

export interface AuthContextValue {
	user: User | null;
	role: string | null;
	permissions: string[];
	isAuthenticated: boolean;
	// Null once logged in; the verification details while the email is unverified.
	login: (data: LoginRequest) => Promise<VerificationRequired | null>;
	// Always ends in the code screen: new accounts start unverified.
	register: (data: RegisterRequest) => Promise<VerificationRequired>;
	verifyEmail: (data: VerifyEmailRequest) => Promise<void>;
	logout: () => void;
	// Re-reads the stored session after a profile or password change.
	refreshSession: () => void;
	hasPermission: (...required: Permission[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
