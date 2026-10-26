import { z } from 'zod';
import { email, requiredText } from './fields';

// Limits match the backend ContactDto. The phone is free text here (any
// country, written any way), so it gets the backend's loose check.
export const contactSchema = z.object({
	name: requiredText('validation.nameRequired', 200),
	phone: z
		.string()
		.trim()
		.min(1, { message: 'validation.phoneRequired', abort: true })
		.regex(/^\+?[0-9\s-]{7,20}$/, 'validation.phoneInvalid'),
	email,
	message: requiredText('validation.messageRequired', 5000),
	// Honeypot: a hidden field that people leave empty and bots fill in.
	website: z.string(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
