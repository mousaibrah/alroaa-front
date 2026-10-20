import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPlayback } from '../api/playback';
import type { PlaybackSource } from '../types/playback';
import { toLang } from '../utils/localized';

interface State {
	lessonId: number;
	source?: PlaybackSource;
	error?: unknown;
}

// Asks the server for the (short-lived, signed) URL of a lesson video. The URL
// is deliberately not cached: `refresh()` gets a new one, e.g. after it expired
// while the learner was away from the screen.
export function usePlaybackSource(lessonId: number, enabled: boolean) {
	const { i18n } = useTranslation();
	const lang = toLang(i18n.resolvedLanguage);
	const [state, setState] = useState<State>({ lessonId });

	useEffect(() => {
		if (!enabled) return;
		const controller = new AbortController();
		getPlayback(lessonId, lang, controller.signal)
			.then((source) => setState({ lessonId, source }))
			.catch((error: unknown) => {
				if (!controller.signal.aborted) setState({ lessonId, error });
			});
		return () => controller.abort();
	}, [lessonId, lang, enabled]);

	const refresh = useCallback(async (): Promise<PlaybackSource> => {
		const source = await getPlayback(lessonId, lang);
		setState({ lessonId, source });
		return source;
	}, [lessonId, lang]);

	const current = state.lessonId === lessonId ? state : { lessonId };
	return {
		source: current.source,
		error: current.error,
		loading: enabled && !current.source && !current.error,
		refresh,
	};
}
