import { z } from 'zod';
import {
	checkPasswordsMatch,
	checkPhone,
	dob,
	email,
	image,
	newPassword,
	phoneFields,
	requiredText,
} from './fields';

// Limits match the backend RegisterDto.
export const registerSchema = z
	.object({
		firstName: requiredText('validation.firstNameRequired', 100),
		lastName: requiredText('validation.lastNameRequired', 100),
		email,
		...phoneFields,
		password: newPassword,
		confirmPassword: z.string(),
		gender: z.enum(['0', '1']),
		dob,
		image,
	})
	.superRefine(checkPasswordsMatch('password'))
	.superRefine(checkPhone());

export type RegisterFormValues = z.infer<typeof registerSchema>;
