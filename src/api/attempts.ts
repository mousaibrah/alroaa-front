import { request } from './client';
import { endpoints } from './endpoints';
import type { Attempt, AttemptResult, OpenAttempt, SubmitAttemptRequest } from '../types/attempts';

// Starts the exam, or resumes the unfinished attempt (the timer keeps running).
export const startExam = (examId: number): Promise<OpenAttempt> =>
	request<OpenAttempt>(endpoints.examAttempts(examId), { method: 'POST' });

export const getAttempt = (id: number, signal?: AbortSignal): Promise<Attempt> =>
	request<Attempt>(endpoints.attempt(id), { signal });

export const submitAttempt = (id: number, data: SubmitAttemptRequest): Promise<AttemptResult> =>
	request<AttemptResult>(endpoints.attemptSubmit(id), { method: 'POST', body: data });
