import { z } from 'zod';
import { currentPassword, email } from './fields';

export const loginSchema = z.object({
	email,
	password: currentPassword,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
