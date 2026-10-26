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

// Translation key for a failed code check or resend on the verify email screen.
export function verifyErrorKey(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.status === 429) return 'verify.errors.wait';
		if (error.status === 400) {
			if (/expired/i.test(error.message)) return 'verify.errors.expired';
			if (/too many/i.test(error.message)) return 'verify.errors.tooMany';
			if (/already verified/i.test(error.message)) return 'verify.errors.alreadyVerified';
			return 'verify.errors.incorrect';
		}
	}
	return authErrorKey(error);
}
