import { ApiError } from '../api/client';

// Maps a failed auth request to a translation key. The backend sends English
// messages, so known statuses are translated here instead of shown raw.
export function authErrorKey(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.status === 401) return 'auth.errors.invalidCredentials';
		if (error.status === 409 && /phone/i.test(error.message)) return 'auth.errors.phoneTaken';
		if (error.status === 409) return 'auth.errors.emailTaken';
		if (error.status === 400 && /saudi/i.test(error.message)) return 'validation.phoneSaudi';
		if (error.status === 413) return 'auth.errors.imageTooLarge';
		if (error.status === 400) return 'auth.errors.invalidData';
		if (error.status === 0 || error.status >= 500) return 'auth.errors.server';
	}
	if (error instanceof TypeError) return 'auth.errors.network'; // fetch failed
	return 'auth.errors.unknown';
}
