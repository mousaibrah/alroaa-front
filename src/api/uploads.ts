import { ApiError, request } from './client';
import { endpoints } from './endpoints';

interface MultipartStart {
	mediaId: string;
	uploadId: string;
	partSize: number;
	partCount: number;
}

interface UploadOptions {
	signal: AbortSignal;
	// Bytes sent so far (parts being retried count from zero again).
	onProgress?: (loaded: number) => void;
}

// Parallel PUTs to storage; browsers allow about six connections per host.
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 5;

// Some systems (mostly Windows) give .mov/.webm files no MIME type.
const MIME_BY_EXT: Record<string, string> = {
	mp4: 'video/mp4',
	m4v: 'video/mp4',
	webm: 'video/webm',
	mov: 'video/quicktime',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	gif: 'image/gif',
};

export const mimeTypeOf = (file: File): string =>
	file.type || MIME_BY_EXT[file.name.split('.').pop()?.toLowerCase() ?? ''] || '';

// Storage refused a part or the connection dropped.
export class UploadNetworkError extends Error {
	readonly status: number;

	constructor(status: number) {
		super(`Upload failed (${status || 'network error'})`);
		this.name = 'UploadNetworkError';
		this.status = status;
	}
}

const abortError = () => new DOMException('Upload cancelled', 'AbortError');

const call = <T>(path: string, body: object, signal?: AbortSignal) =>
	request<T>(path, { method: 'POST', body, signal, keepCache: true });

// fetch has no upload progress, XMLHttpRequest does.
const putPart = (url: string, body: Blob, onBytes: (n: number) => void, signal: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		if (signal.aborted) return reject(abortError());
		const xhr = new XMLHttpRequest();
		const abort = () => xhr.abort();
		xhr.open('PUT', url);
		xhr.upload.onprogress = (e) => onBytes(e.loaded);
		xhr.onload = () =>
			xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new UploadNetworkError(xhr.status));
		xhr.onerror = () => reject(new UploadNetworkError(0));
		xhr.onabort = () => reject(abortError());
		xhr.onloadend = () => signal.removeEventListener('abort', abort);
		signal.addEventListener('abort', abort, { once: true });
		xhr.send(body);
	});

const pause = (ms: number, signal: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		const timer = setTimeout(done, ms);
		function done() {
			signal.removeEventListener('abort', stop);
			resolve();
		}
		function stop() {
			clearTimeout(timer);
			reject(abortError());
		}
		signal.addEventListener('abort', stop, { once: true });
	});

// While offline, retries wait for the connection instead of burning attempts.
const whenOnline = (signal: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		if (navigator.onLine) return resolve();
		const online = () => {
			signal.removeEventListener('abort', stop);
			resolve();
		};
		const stop = () => {
			window.removeEventListener('online', online);
			reject(abortError());
		};
		window.addEventListener('online', online, { once: true });
		signal.addEventListener('abort', stop, { once: true });
	});

// API validation errors (bad type, too large, not allowed) will not get better.
const retryable = (error: unknown): boolean =>
	!(error instanceof ApiError) || error.status >= 500 || [408, 429].includes(error.status);

const withRetry = async (task: () => Promise<void>, signal: AbortSignal): Promise<void> => {
	for (let attempt = 1; ; attempt++) {
		try {
			return await task();
		} catch (error) {
			if (signal.aborted || attempt >= MAX_ATTEMPTS || !retryable(error)) throw error;
			const backoff = Math.min(1000 * 2 ** (attempt - 1), 10_000);
			await pause(backoff * (0.75 + Math.random() / 2), signal);
			await whenOnline(signal);
		}
	}
};

// Uploads the file straight to storage in parallel parts (the API only signs
// them) and returns its media id. Each part is retried on its own, so a dropped
// connection costs one part, not the whole file. Cancelling drops the parts.
export async function uploadMedia(file: File, { signal, onProgress }: UploadOptions): Promise<string> {
	const start = await call<MultipartStart>(
		endpoints.mediaMultipart,
		{ filename: file.name, mimeType: mimeTypeOf(file), size: file.size },
		signal
	);
	const { mediaId, uploadId, partSize, partCount } = start;

	// One failed part stops the others.
	const parts = new AbortController();
	const stopParts = () => parts.abort();
	signal.addEventListener('abort', stopParts, { once: true });

	const sent = new Array<number>(partCount).fill(0);
	let total = 0;
	const setSent = (index: number, bytes: number) => {
		total += bytes - sent[index];
		sent[index] = bytes;
		onProgress?.(total);
	};

	const sendPart = async (n: number) => {
		const { url } = await call<{ url: string }>(
			endpoints.mediaMultipartPart(mediaId),
			{ uploadId, partNumber: n },
			parts.signal
		);
		const blob = file.slice((n - 1) * partSize, Math.min(n * partSize, file.size));
		setSent(n - 1, 0);
		await putPart(url, blob, (bytes) => setSent(n - 1, bytes), parts.signal);
		setSent(n - 1, blob.size);
	};

	let next = 1;
	const worker = async () => {
		while (next <= partCount) {
			const n = next++;
			await withRetry(() => sendPart(n), parts.signal);
		}
	};

	try {
		await Promise.all(Array.from({ length: Math.min(CONCURRENCY, partCount) }, worker));
		await withRetry(async () => {
			await call(endpoints.mediaMultipartComplete(mediaId), { uploadId }, signal);
		}, signal);
		return mediaId;
	} catch (error) {
		parts.abort();
		void call(endpoints.mediaMultipartAbort(mediaId), { uploadId }).catch(() => undefined);
		throw signal.aborted ? abortError() : error;
	} finally {
		signal.removeEventListener('abort', stopParts);
	}
}
