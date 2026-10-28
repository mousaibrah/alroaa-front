import { request, toFormData } from './client';
import { endpoints } from './endpoints';
import { saveSession } from './token';
import {
	needsVerification,
	type AuthResponse,
	type LoginRequest,
	type RegisterRequest,
	type ResetPasswordRequest,
	type VerificationRequired,
	type VerifyEmailRequest,
} from '../types/auth';

export const persist = (response: AuthResponse): AuthResponse => {
	saveSession({ token: response.accessToken, user: response.user });
	return response;
};

// An unverified account gets no token: the caller opens the code screen.
export const login = (data: LoginRequest): Promise<AuthResponse | VerificationRequired> =>
	request<AuthResponse | VerificationRequired>(endpoints.login, { method: 'POST', body: data }).then(
		(response) => (needsVerification(response) ? response : persist(response))
	);

// Multipart, so the optional profile picture goes along with the fields. The
// account starts unverified: a code is emailed and no token comes back.
export const register = (data: RegisterRequest): Promise<VerificationRequired> =>
	request<VerificationRequired>(endpoints.register, { method: 'POST', body: toFormData(data) });

// The right code verifies the email and logs the user in.
export const verifyEmail = (data: VerifyEmailRequest): Promise<AuthResponse> =>
	request<AuthResponse>(endpoints.verifyEmail, { method: 'POST', body: data }).then(persist);

export const resendVerification = (email: string): Promise<{ resendAvailableIn: number }> =>
	request<{ resendAvailableIn: number }>(endpoints.resendVerification, {
		method: 'POST',
		body: { email },
	});

// Emails a reset code. Answers the same whether or not the email has an account.
export const forgotPassword = (email: string): Promise<{ resendAvailableIn: number }> =>
	request<{ resendAvailableIn: number }>(endpoints.forgotPassword, {
		method: 'POST',
		body: { email },
	});

// The right code sets the new password, signs out other devices and logs in.
export const resetPassword = (data: ResetPasswordRequest): Promise<AuthResponse> =>
	request<AuthResponse>(endpoints.resetPassword, { method: 'POST', body: data }).then(persist);
