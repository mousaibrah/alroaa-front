import { z } from 'zod';

const today = () => new Date().toISOString().slice(0, 10);

const name = (required: string) =>
	z.string().trim().min(1, required).max(100, 'validation.tooLong');

const password = z.string().min(8, 'validation.passwordMin').max(72, 'validation.passwordMax');

// Error messages are translation keys; the forms render them with t().
// Limits match the backend UpdateProfileDto / ChangeEmailDto / ChangePasswordDto.
export const profileSchema = z.object({
	firstName: name('validation.firstNameRequired'),
	lastName: name('validation.lastNameRequired'),
	// 'none' clears the gender.
	gender: z.enum(['none', '0', '1']),
	// '' clears the date of birth.
	dob: z
		.string()
		.refine(
			(v) => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '1900-01-01'),
			'validation.dobInvalid'
		)
		.refine((v) => v === '' || v <= today(), 'validation.dobFuture'),
});

export const emailSchema = z.object({
	email: z.email('validation.emailInvalid').max(255, 'validation.tooLong'),
	currentPassword: z.string().min(1, 'validation.passwordRequired'),
});

export const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, 'validation.passwordRequired'),
		newPassword: password,
		confirmPassword: z.string(),
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		message: 'validation.passwordsMismatch',
		path: ['confirmPassword'],
	})
	.refine((d) => d.newPassword !== d.currentPassword, {
		message: 'validation.passwordSame',
		path: ['newPassword'],
	});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type EmailFormValues = z.infer<typeof emailSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

export { today };
