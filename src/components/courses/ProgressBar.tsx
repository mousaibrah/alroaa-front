import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function ProgressBar({ value, label }: { value: number; label: string }) {
	const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
	// Start empty and fill on the next frame, so the bar grows when it appears.
	const [shown, setShown] = useState(0);
	useEffect(() => {
		const frame = requestAnimationFrame(() => setShown(percent));
		return () => cancelAnimationFrame(frame);
	}, [percent]);

	return (
		<div>
			<div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
				<span>{label}</span>
				<span>{percent}%</span>
			</div>
			<Progress value={shown} aria-label={label} className="h-2" />
		</div>
	);
}
