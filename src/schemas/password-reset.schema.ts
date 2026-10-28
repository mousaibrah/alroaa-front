import { z } from 'zod';
import { checkPasswordsMatch, email, newPassword } from './fields';

// Limits match the backend ForgotPasswordDto / ResetPasswordDto.
export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
	.object({
		code: z.string().regex(/^\d{6}$/, 'validation.codeRequired'),
		newPassword,
		confirmPassword: z.string(),
	})
	.superRefine(checkPasswordsMatch('newPassword'));

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
