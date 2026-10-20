import { request } from './client';
import { endpoints } from './endpoints';
import type { PlaybackSource } from '../types/playback';
import type { Lang } from '../utils/localized';

// A short-lived URL for a lesson video. Never cached: ask again when it expires.
// `lang` picks the recording; the server falls back to the other language when
// the lesson exists in a single one.
export const getPlayback = (
	lessonId: number,
	lang: Lang,
	signal?: AbortSignal
): Promise<PlaybackSource> =>
	request<PlaybackSource>(endpoints.lessonPlayback(lessonId), { params: { lang }, signal });
