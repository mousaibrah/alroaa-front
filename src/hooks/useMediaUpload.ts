import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { uploadMedia } from '../api/uploads';

export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export interface UploadState {
	status: UploadStatus;
	file: File | null;
	loaded: number;
	// Bytes per second over the last few seconds; null until it is known.
	speed: number | null;
	mediaId: string | null;
	error: string | null;
}

const IDLE: UploadState = {
	status: 'idle',
	file: null,
	loaded: 0,
	speed: null,
	mediaId: null,
	error: null,
};

// Speed is measured over this window, so it is steady but still follows changes.
const SPEED_WINDOW_MS = 5000;

// Uploads a file in the background as soon as it is picked, so the form can be
// filled in meanwhile. `result()` waits for the upload (for submitting early).
// Leaving the page warns, and unmounting cancels.
export function useMediaUpload() {
	const { t } = useTranslation();
	const [state, setState] = useState<UploadState>(IDLE);
	const controller = useRef<AbortController | null>(null);
	const pending = useRef<Promise<string> | null>(null);
	const frame = useRef(0);

	// The API explains its refusals; storage and network failures get one message.
	const describe = useCallback(
		(error: unknown) => (error instanceof ApiError ? error.message : t('admin.upload.failed')),
		[t]
	);

	const stop = useCallback(() => {
		controller.current?.abort();
		controller.current = null;
		pending.current = null;
		cancelAnimationFrame(frame.current);
	}, []);

	const start = useCallback(
		(file: File) => {
			stop();
			const abort = new AbortController();
			controller.current = abort;
			setState({ ...IDLE, status: 'uploading', file });

			// Progress events come in fast; render at most once per frame.
			const samples: { at: number; loaded: number }[] = [];
			let latest = 0;
			const flush = () => {
				frame.current = 0;
				const now = performance.now();
				samples.push({ at: now, loaded: latest });
				while (samples.length > 2 && now - samples[0].at > SPEED_WINDOW_MS) samples.shift();
				const first = samples[0];
				const elapsed = (now - first.at) / 1000;
				const speed = elapsed >= 1 ? Math.max(0, (latest - first.loaded) / elapsed) : null;
				setState((s) =>
					s.status === 'uploading' && s.file === file
						? { ...s, loaded: latest, speed: speed ?? s.speed }
						: s
				);
			};

			const promise = uploadMedia(file, {
				signal: abort.signal,
				onProgress: (loaded) => {
					latest = loaded;
					if (!frame.current) frame.current = requestAnimationFrame(flush);
				},
			});
			pending.current = promise;
			promise.then(
				(mediaId) => {
					if (abort.signal.aborted) return;
					cancelAnimationFrame(frame.current);
					controller.current = null;
					setState({ ...IDLE, status: 'done', file, loaded: file.size, mediaId });
				},
				(error: unknown) => {
					if (abort.signal.aborted) return;
					cancelAnimationFrame(frame.current);
					controller.current = null;
					setState({
						...IDLE,
						status: 'error',
						file,
						error: describe(error),
					});
				}
			);
			// Handled above; `result()` callers get their own rejection.
			promise.catch(() => undefined);
		},
		[stop, describe]
	);

	const reset = useCallback(() => {
		stop();
		setState(IDLE);
	}, [stop]);

	const retry = useCallback(() => {
		if (state.file) start(state.file);
	}, [start, state.file]);

	// The media id once uploaded, null without a file.
	const result = useCallback(async (): Promise<string | null> => {
		if (state.status === 'done') return state.mediaId;
		if (state.status === 'error') throw new Error(state.error ?? t('admin.upload.failed'));
		if (!pending.current) return null;
		try {
			return await pending.current;
		} catch (error) {
			throw new Error(describe(error), { cause: error });
		}
	}, [state, t, describe]);

	useEffect(() => stop, [stop]);

	useEffect(() => {
		if (state.status !== 'uploading') return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [state.status]);

	return { ...state, start, reset, retry, result };
}

export type MediaUpload = ReturnType<typeof useMediaUpload>;
