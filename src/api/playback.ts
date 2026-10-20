import { request } from './client';
import { endpoints } from './endpoints';
import type { PlaybackSource } from '../types/playback';

// A short-lived URL for a lesson video. Never cached: ask again when it expires.
export const getPlayback = (lessonId: number, signal?: AbortSignal): Promise<PlaybackSource> =>
	request<PlaybackSource>(endpoints.lessonPlayback(lessonId), { signal });
