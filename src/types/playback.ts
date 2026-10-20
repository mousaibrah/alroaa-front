// Mirrors testback/src/courses/playback-url.service.ts.
export type PlaybackKind = 'hls' | 'file';

export interface PlaybackSource {
	url: string;
	kind: PlaybackKind;
	// ISO date when the URL stops working; null when it is not signed.
	expiresAt: string | null;
}
