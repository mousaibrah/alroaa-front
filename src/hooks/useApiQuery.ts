import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { ensure, getSnapshot, refetch, subscribe } from '@/lib/queryCache';

interface Options {
	// A cached copy younger than this is used without asking the server again.
	// With 0 (default) the cached copy is shown at once and refreshed in the
	// background.
	staleMs?: number;
	// false: don't fetch (yet), e.g. data for a tab that hasn't been opened.
	enabled?: boolean;
}

// Data fetching with a shared cache (see lib/queryCache.ts).
//
// `key` identifies the request and must be unique across the app, e.g.
// `course:12`. Changing it loads the new request (instantly if cached).
// `reload()` refetches now but keeps the current data on screen.
export function useApiQuery<T>(
	fetcher: (signal: AbortSignal) => Promise<T>,
	key: string,
	{ staleMs = 0, enabled = true }: Options = {}
) {
	const fetcherRef = useRef(fetcher);
	useEffect(() => {
		fetcherRef.current = fetcher;
	});

	const run = useCallback(() => fetcherRef.current(new AbortController().signal), []);

	const snapshot = useSyncExternalStore(
		(listener) => subscribe(key, listener),
		() => getSnapshot(key)
	);

	useEffect(() => {
		if (enabled) ensure(key, run, staleMs);
	}, [key, staleMs, run, enabled]);

	return {
		data: snapshot.data as T | undefined,
		error: snapshot.error,
		loading: snapshot.loading,
		reload: () => refetch(key, run),
	};
}
