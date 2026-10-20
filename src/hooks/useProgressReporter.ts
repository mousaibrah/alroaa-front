import { useEffect, useRef } from 'react';
import { reportProgress } from '../api/progress';
import type { ProgressResult } from '../types/progress';

interface Options {
	lessonId: number;
	// Current playback position in seconds (read each time a report is sent).
	getPositionSec: () => number;
	// Report only while the learner is actually watching (e.g. video playing).
	active: boolean;
	// Called with every server reply; use it to unlock the next lesson in the UI.
	onResult?: (result: ProgressResult) => void;
	intervalMs?: number;
}

// Heartbeat: while `active`, sends the playback position every `intervalMs`,
// and once more when playback stops or the component unmounts. The server
// decides when the lesson is complete (95%) and which lesson unlocks next.
export function useProgressReporter({
	lessonId,
	getPositionSec,
	active,
	onResult,
	intervalMs = 15_000,
}: Options): void {
	const latest = useRef({ getPositionSec, onResult });
	useEffect(() => {
		latest.current = { getPositionSec, onResult };
	});

	useEffect(() => {
		if (!active) return;

		let lastSent = -1;
		let done = false;
		const controller = new AbortController();

		const send = async (signal?: AbortSignal, keepalive = false) => {
			const position = Math.floor(latest.current.getPositionSec());
			if (done || position === lastSent) return;
			lastSent = position;
			try {
				const result = await reportProgress(lessonId, { progressSec: position }, signal, keepalive);
				if (result.completed) done = true; // nothing more to report
				latest.current.onResult?.(result);
			} catch {
				lastSent = -1; // network/server hiccup: try again on the next tick
			}
		};

		const timer = setInterval(() => void send(controller.signal), intervalMs);
		// Closing the tab or leaving the site: save the position one last time.
		const onPageHide = () => void send(undefined, true);
		window.addEventListener('pagehide', onPageHide);
		return () => {
			window.removeEventListener('pagehide', onPageHide);
			clearInterval(timer);
			controller.abort();
			// Final report on pause/unmount, so the last seconds aren't lost.
			void send();
		};
	}, [active, lessonId, intervalMs]);
}
