import { request, toFormData } from './client';
import { endpoints } from './endpoints';
import { persist } from './auth';
import { saveUser } from './token';
import type {
	AuthResponse,
	ChangeEmailRequest,
	ChangePasswordRequest,
	ProfileUpdate,
	User,
} from '../types/auth';

const remember = (user: User): User => {
	saveUser(user);
	return user;
};

export const getMe = (signal?: AbortSignal): Promise<User> =>
	request<User>(endpoints.me, { signal }).then(remember);

export const updateProfile = (data: ProfileUpdate): Promise<User> =>
	request<User>(endpoints.me, { method: 'PATCH', body: data }).then(remember);

export const uploadProfileImage = (image: File): Promise<User> =>
	request<User>(endpoints.myImage, { method: 'PUT', body: toFormData({ image }) }).then(remember);

// Both need the current password and sign out every other session; the
// response carries the new token for this one.
export const changeEmail = (data: ChangeEmailRequest): Promise<AuthResponse> =>
	request<AuthResponse>(endpoints.myEmail, { method: 'PATCH', body: data }).then(persist);

export const changePassword = (data: ChangePasswordRequest): Promise<AuthResponse> =>
	request<AuthResponse>(endpoints.myPassword, { method: 'PUT', body: data }).then(persist);
