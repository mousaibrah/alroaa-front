import { request } from './client';
import { endpoints } from './endpoints';

// Matches the backend ContactDto.
export interface ContactMessage {
	fullName: string;
	phoneNumber: string;
	email: string;
	message: string;
}

// Public: emails the message to the site inbox.
export const sendContactMessage = (body: ContactMessage): Promise<void> =>
	request<void>(endpoints.contact, { method: 'POST', body, keepCache: true });
