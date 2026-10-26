import { z } from 'zod';
import {
	checkPasswordsMatch,
	checkPhone,
	currentPassword,
	dob,
	newPassword,
	phoneFields,
	requiredText,
} from './fields';

// Limits match the backend UpdateProfileDto / ChangePasswordDto.
// Accounts from before phone numbers may leave it empty until they add one;
// once set it can be changed but not removed.
export const profileSchema = (hasPhone: boolean) =>
	z
		.object({
			firstName: requiredText('validation.firstNameRequired', 100),
			lastName: requiredText('validation.lastNameRequired', 100),
			// 'none' clears the gender.
			gender: z.enum(['none', '0', '1']),
			// '' clears the date of birth.
			dob,
			...phoneFields,
		})
		.superRefine(checkPhone(hasPhone));

export const passwordSchema = z
	.object({ currentPassword, newPassword, confirmPassword: z.string() })
	.superRefine(checkPasswordsMatch('newPassword'))
	.refine((d) => d.newPassword === '' || d.newPassword !== d.currentPassword, {
		message: 'validation.passwordSame',
		path: ['newPassword'],
	});

export type ProfileFormValues = z.infer<ReturnType<typeof profileSchema>>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
