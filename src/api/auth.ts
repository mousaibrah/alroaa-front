import { request } from './client';
import { endpoints } from './endpoints';
import { saveSession } from './token';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const persist = (response: AuthResponse): AuthResponse => {
	saveSession({ token: response.accessToken, user: response.user });
	return response;
};

export const login = (data: LoginRequest): Promise<AuthResponse> =>
	request<AuthResponse>(endpoints.login, { method: 'POST', body: data }).then(persist);

export const register = (data: RegisterRequest): Promise<AuthResponse> =>
	request<AuthResponse>(endpoints.register, { method: 'POST', body: data }).then(persist);
