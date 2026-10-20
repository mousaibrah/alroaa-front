import { request } from './client';
import { endpoints } from './endpoints';
import type { Payment } from '../types/enrollment';

// Starts (or resumes) the payment that unlocks a course's paid lessons.
export const startPayment = (courseId: number): Promise<Payment> =>
	request<Payment>(endpoints.coursePayments(courseId), { method: 'POST' });

export const getPayment = (id: number, signal?: AbortSignal): Promise<Payment> =>
	request<Payment>(endpoints.payment(id), { signal });

// Development only: completes a payment of the mock gateway.
export const confirmMockPayment = (id: number): Promise<Payment> =>
	request<Payment>(endpoints.paymentMockConfirm(id), { method: 'POST' });
