import { z } from 'zod';
import { phoneError } from '../utils/phone';

// Building blocks shared by the form schemas. Error messages are translation
// keys (validation.*); the forms render them with t(). Limits match the backend DTOs.

// Profile pictures the backend accepts (MAX_IMAGE_SIZE_MB, default 10).
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_MB = 10;

// Today as YYYY-MM-DD in the user's own time zone (what <input type="date"> shows).
export const today = (): string => {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Trimmed text that must not be empty.
export const requiredText = (requiredKey: string, max: number) =>
	z.string().trim().min(1, requiredKey).max(max, 'validation.tooLong');

// Trimmed, so a space added by the keyboard does not fail the check. Empty
// input gets "required" instead of "invalid".
export const email = z
	.string()
	.trim()
	.min(1, 'validation.emailRequired')
	.max(255, 'validation.tooLong')
	.pipe(z.email('validation.emailInvalid'));

// The current password: only needs to be there (bcrypt ignores bytes past 72).
export const currentPassword = z
	.string()
	.min(1, 'validation.passwordRequired')
	.max(72, 'validation.passwordMax');

export const newPassword = z
	.string()
	.min(1, { message: 'validation.passwordRequired', abort: true })
	.min(8, 'validation.passwordMin')
	.max(72, 'validation.passwordMax');

// Optional date of birth: '' or a real YYYY-MM-DD date (not 2001-02-30)
// between 1900 and today.
export const dob = z
	.string()
	.refine(
		(v) =>
			v === '' ||
			(/^\d{4}-\d{2}-\d{2}$/.test(v) &&
				v >= '1900-01-01' &&
				new Date(`${v}T00:00:00Z`).toISOString().startsWith(v)),
		'validation.dobInvalid'
	)
	.refine((v) => v === '' || v <= today(), 'validation.dobFuture');

export const image = z
	.instanceof(File)
	.nullable()
	.refine((f) => !f || IMAGE_TYPES.includes(f.type), 'validation.imageType')
	.refine((f) => !f || f.size <= MAX_IMAGE_MB * 1024 * 1024, 'validation.imageSize');

// Dialing code + national number, checked together (Saudi numbers have their
// own rule). Add with .superRefine(checkPhone()) on an object that has both.
export const phoneFields = {
	countryCode: z.string(),
	phoneNumber: z.string().trim(),
};

export const checkPhone =
	(required = true) =>
	(data: { countryCode: string; phoneNumber: string }, ctx: z.RefinementCtx) => {
		if (!required && data.phoneNumber === '') return;
		const error = phoneError(data.countryCode, data.phoneNumber);
		if (error) ctx.addIssue({ code: 'custom', message: error, path: ['phoneNumber'] });
	};

// Adds a "passwords do not match" error on confirmPassword.
export const checkPasswordsMatch =
	<K extends string>(field: K) =>
	(data: Record<K | 'confirmPassword', string>, ctx: z.RefinementCtx) => {
		if (data.confirmPassword === '') {
			ctx.addIssue({ code: 'custom', message: 'validation.confirmRequired', path: ['confirmPassword'] });
		} else if (data[field] !== data.confirmPassword) {
			ctx.addIssue({ code: 'custom', message: 'validation.passwordsMismatch', path: ['confirmPassword'] });
		}
	};
