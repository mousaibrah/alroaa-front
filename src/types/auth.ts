// Mirrors the backend auth DTOs (testback/src/auth).
export interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	image: string | null;
	gender: 0 | 1 | null; // 0 = male, 1 = female
	dob: string | null; // YYYY-MM-DD
	countryCode: string; // e.g. +966
	phoneNumber: string | null; // digits only; null for older accounts
	roleId: number;
	createdAt: string;
}

// Permissions are not in the body; they are read from the token claims.
export interface AuthResponse {
	user: User;
	role: string;
	accessToken: string;
}

// Register, and login while the email is unverified: no token yet, a 6-digit
// code was emailed and the code screen should open.
export interface VerificationRequired {
	verificationRequired: true;
	email: string;
	resendAvailableIn: number; // seconds until another code can be requested
}

export const needsVerification = (
	response: AuthResponse | VerificationRequired
): response is VerificationRequired => 'verificationRequired' in response;

export interface VerifyEmailRequest {
	email: string;
	code: string;
}

// POST /auth/reset-password: the emailed code and the new password.
export interface ResetPasswordRequest {
	email: string;
	code: string;
	newPassword: string;
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
	countryCode?: string; // defaults to +966
	phoneNumber: string;
}

// PATCH /users/me: `null` clears gender or dob. A phone number can be changed
// but not removed; either half sent alone keeps the other.
export interface ProfileUpdate {
	firstName?: string;
	lastName?: string;
	gender?: 0 | 1 | null;
	dob?: string | null;
	countryCode?: string;
	phoneNumber?: string;
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
