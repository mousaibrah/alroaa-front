import { useEffect, useRef, useState } from 'react';

// Seconds left until `expiresAt` (null = no time limit). Uses the server's
// clock (`serverNow`) so a wrong local clock can't extend or cut the exam.
// `onExpire` runs once when the time reaches zero.
export function useCountdown(
	expiresAt: string | null,
	serverNow: string,
	onExpire: () => void
): number | null {
	const [offset] = useState(() => new Date(serverNow).getTime() - Date.now());
	const deadline = expiresAt === null ? null : new Date(expiresAt).getTime();
	const secondsLeft = (): number =>
		deadline === null ? 0 : Math.max(0, Math.ceil((deadline - (Date.now() + offset)) / 1000));

	const [remaining, setRemaining] = useState<number | null>(() =>
		deadline === null ? null : secondsLeft()
	);
	const onExpireRef = useRef(onExpire);
	useEffect(() => {
		onExpireRef.current = onExpire;
	});

	useEffect(() => {
		if (deadline === null) return;
		const tick = () => {
			const left = Math.max(0, Math.ceil((deadline - (Date.now() + offset)) / 1000));
			setRemaining(left);
			if (left === 0) {
				clearInterval(timer);
				onExpireRef.current();
			}
		};
		const timer = setInterval(tick, 1000);
		return () => clearInterval(timer);
	}, [deadline, offset]);

	return remaining;
}
