// A small in-memory cache shared by every `useApiQuery`, so the app does not
// ask the server for the same thing twice.
//
// - Identical requests that are already running are shared (this also stops
//   React StrictMode's double effect from firing every request twice in dev).
// - Data stays cached while the user moves between pages. A page shows the
//   cached copy immediately and refreshes it in the background when it is
//   older than the `staleMs` the page asked for.
// - Any change the user makes (POST/PUT/PATCH/DELETE) marks everything stale
//   and refreshes what is on screen; logging in or out empties the cache and
//   reloads what is on screen.

export interface QuerySnapshot<T = unknown> {
	data?: T;
	error?: unknown;
	// True until the first result (data or error) arrives.
	loading: boolean;
}

interface Entry {
	snapshot: QuerySnapshot;
	updatedAt: number;
	inflight?: Promise<void>;
	// How to refetch this entry (the latest fetcher a page registered).
	fetcher?: () => Promise<unknown>;
	listeners: Set<() => void>;
}

const LOADING: QuerySnapshot = { loading: true };
const entries = new Map<string, Entry>();
// Bumped when the cache is emptied, so answers to old requests are dropped.
let epoch = 0;

const entryFor = (key: string): Entry => {
	let entry = entries.get(key);
	if (!entry) {
		entry = { snapshot: LOADING, updatedAt: 0, listeners: new Set() };
		entries.set(key, entry);
	}
	return entry;
};

const notify = (entry: Entry) => entry.listeners.forEach((listener) => listener());

export const subscribe = (key: string, listener: () => void): (() => void) => {
	const entry = entryFor(key);
	entry.listeners.add(listener);
	return () => entry.listeners.delete(listener);
};

export const getSnapshot = (key: string): QuerySnapshot => entries.get(key)?.snapshot ?? LOADING;

const run = (entry: Entry, fetcher: () => Promise<unknown>): Promise<void> => {
	if (entry.inflight) return entry.inflight; // join the request already running
	const startedIn = epoch;
	entry.fetcher = fetcher;
	entry.inflight = fetcher()
		.then((data) => {
			if (startedIn !== epoch) return;
			entry.snapshot = { data, loading: false };
			entry.updatedAt = Date.now();
		})
		.catch((error: unknown) => {
			if (startedIn !== epoch) return;
			// Keep what we already had on screen; just report the failure.
			entry.snapshot = { data: entry.snapshot.data, error, loading: false };
		})
		.finally(() => {
			entry.inflight = undefined;
			if (startedIn === epoch) notify(entry);
		});
	return entry.inflight;
};

// Fetches unless a recent copy is cached (younger than `staleMs`).
export const ensure = (key: string, fetcher: () => Promise<unknown>, staleMs: number): void => {
	const entry = entryFor(key);
	entry.fetcher = fetcher;
	const fresh = entry.snapshot.data !== undefined && Date.now() - entry.updatedAt < staleMs;
	if (!fresh) void run(entry, fetcher);
};

// Same as `ensure`, but returns the data: for fetchers that combine requests.
export const fetchQuery = async <T>(
	key: string,
	fetcher: () => Promise<T>,
	staleMs: number
): Promise<T> => {
	const entry = entryFor(key);
	const fresh = entry.snapshot.data !== undefined && Date.now() - entry.updatedAt < staleMs;
	if (!fresh) await run(entry, fetcher);
	if (entry.snapshot.data === undefined) throw entry.snapshot.error ?? new Error('Request failed');
	return entry.snapshot.data as T;
};

// Forces a refresh now (still showing the old data meanwhile).
export const refetch = (key: string, fetcher: () => Promise<unknown>): void => {
	void run(entryFor(key), fetcher);
};

// Something changed on the server: everything cached is out of date. What is
// on screen is refreshed now; the rest refreshes the next time it is opened.
export const invalidateAll = (): void => {
	for (const entry of entries.values()) {
		entry.updatedAt = 0;
		if (entry.listeners.size > 0 && entry.fetcher) void run(entry, entry.fetcher);
	}
};

// Logging in or out: nothing from the previous user may stay around.
export const clearAll = (): void => {
	epoch += 1;
	for (const entry of entries.values()) {
		entry.snapshot = LOADING;
		entry.updatedAt = 0;
		entry.inflight = undefined;
	}
	entries.forEach(notify);
	for (const [key, entry] of entries) {
		if (entry.listeners.size === 0) entries.delete(key);
		// What is on screen loads again for the new user; otherwise it would
		// wait forever for the answer that was just dropped.
		else if (entry.fetcher) void run(entry, entry.fetcher);
	}
};
