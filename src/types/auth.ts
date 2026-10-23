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

// Permissions are not in the body; they are read from the token claims.
export interface AuthResponse {
	user: User;
	role: string;
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
	// Sent as multipart/form-data; `image` is the optional profile picture.
	image?: File | null;
	gender?: 0 | 1;
	dob?: string;
}

// PATCH /users/me: `null` clears gender or dob.
export interface ProfileUpdate {
	firstName?: string;
	lastName?: string;
	gender?: 0 | 1 | null;
	dob?: string | null;
}

export interface ChangeEmailRequest {
	email: string;
	currentPassword: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
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
