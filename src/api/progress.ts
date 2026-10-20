import { request } from './client';
import { endpoints } from './endpoints';
import type { ProgressResult, ReportProgressRequest } from '../types/progress';

export const reportProgress = (
	lessonId: number,
	data: ReportProgressRequest,
	signal?: AbortSignal,
	keepalive = false
): Promise<ProgressResult> =>
	request<ProgressResult>(endpoints.lessonProgress(lessonId), {
		method: 'PUT',
		body: data,
		signal,
		// Sent every few seconds while watching; the page refreshes itself when a
		// lesson completes.
		keepCache: true,
		keepalive,
	});
