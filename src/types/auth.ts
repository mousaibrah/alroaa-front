// Mirrors the backend auth DTOs (testback/src/auth).
export interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	image: string | null;
	gender: 0 | 1 | null; // 0 = male, 1 = female
	dob: string | null; // YYYY-MM-DD
	roleId: number;
	createdAt: string;
}

export interface AuthResponse {
	user: User;
	role: string;
	permissions: string[];
	accessToken: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	image?: string;
	gender?: 0 | 1;
	dob?: string;
	role?: 'student' | 'instructor';
}

// Claims inside the access token (testback/src/auth/jwt-payload.ts).
export interface TokenPayload {
	sub: number;
	email: string;
	roleId: number;
	role: string;
	permissions: string[];
	iat: number;
	exp: number;
}
