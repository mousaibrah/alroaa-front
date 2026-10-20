import { z } from 'zod';

// Error messages are translation keys; the form renders them with t().
export const loginSchema = z.object({
	email: z.email('validation.emailInvalid'),
	password: z.string().min(1, 'validation.passwordRequired'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
