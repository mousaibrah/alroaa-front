import { z } from 'zod';

// Error messages are translation keys; the form renders them with t().
export const contactSchema = z.object({
	name: z.string().trim().min(1, 'site.contact.errors.name'),
	phone: z.string().trim(),
	email: z.email('site.contact.errors.email'),
	message: z.string().trim().min(1, 'site.contact.errors.message'),
	// Honeypot: a hidden field that people leave empty and bots fill in.
	website: z.string(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
