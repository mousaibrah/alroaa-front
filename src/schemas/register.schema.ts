import { z } from 'zod';

// Error messages are translation keys; the form renders them with t().
// Limits match the backend RegisterDto.
export const registerSchema = z
	.object({
		firstName: z
			.string()
			.trim()
			.min(1, 'validation.firstNameRequired')
			.max(100, 'validation.tooLong'),
		lastName: z
			.string()
			.trim()
			.min(1, 'validation.lastNameRequired')
			.max(100, 'validation.tooLong'),
		email: z.email('validation.emailInvalid').max(255, 'validation.tooLong'),
		password: z.string().min(8, 'validation.passwordMin').max(72, 'validation.passwordMax'),
		confirmPassword: z.string(),
		role: z.enum(['student', 'instructor']),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'validation.passwordsMismatch',
		path: ['confirmPassword'],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;
