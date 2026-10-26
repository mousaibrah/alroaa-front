import { ApiError } from '../../api/client';
import { authErrorKey } from '../../auth/authError';

// Translation key for a failed profile or password change. A wrong
// current password comes back as 403 (a 401 would end the session).
export function accountErrorKey(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.status === 403) return 'account.errors.wrongPassword';
		if (error.status === 400 && /differ/i.test(error.message))
			return 'validation.passwordSame';
	}
	return authErrorKey(error);
}
