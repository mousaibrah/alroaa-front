import { invalidateAll } from '@/lib/queryCache';
import { clearSession, getToken } from './token';
import type { ApiErrorBody } from '../types/common';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

// Called when the backend rejects the token (401), so the app can log out.
let onUnauthorized: (() => void) | undefined;
export const setUnauthorizedHandler = (handler: () => void): void => {
	onUnauthorized = handler;
};

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	params?: Record<string, string | number | boolean | undefined>;
	signal?: AbortSignal;
	// A successful change normally marks cached data stale; frequent background
	// calls (progress heartbeats) opt out.
	keepCache?: boolean;
	// Lets the request finish while the page is closing (last progress save).
	keepalive?: boolean;
}

// Multipart sends every field as text; missing values are left out (an empty
// description is sent, so it can be cleared).
export const toFormData = (data: object): FormData => {
	const form = new FormData();
	for (const [key, value] of Object.entries(data)) {
		if (value === undefined || value === null) continue;
		form.append(key, value instanceof File ? value : String(value));
	}
	return form;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { method = 'GET', body, params, signal, keepCache = false, keepalive = false } = options;

	const url = new URL(path, BASE_URL);
	for (const [key, value] of Object.entries(params ?? {})) {
		if (value !== undefined) url.searchParams.set(key, String(value));
	}

	// FormData (file uploads) sets its own multipart Content-Type.
	const isForm = body instanceof FormData;
	const headers: Record<string, string> = {};
	if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
	const token = getToken();
	if (token) headers.Authorization = `Bearer ${token}`;

	const response = await fetch(url, {
		method,
		headers,
		body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
		signal,
		keepalive,
	});

	if (!response.ok) {
		const error = (await response.json().catch(() => null)) as ApiErrorBody | null;
		// Only treat 401 as "logged out" when we actually sent a token; a failed
		// login also returns 401.
		if (response.status === 401 && token) {
			clearSession();
			onUnauthorized?.();
		}
		const message = Array.isArray(error?.message) ? error.message.join(', ') : error?.message;
		throw new ApiError(response.status, message ?? response.statusText);
	}

	if (method !== 'GET' && !keepCache) invalidateAll();

	return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
