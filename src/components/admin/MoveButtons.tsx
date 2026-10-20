import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Compact ▲/▼ control used to reorder items without drag and drop.
export function MoveButtons({
	label,
	canUp,
	canDown,
	onMove,
	disabled,
}: {
	label: string;
	canUp: boolean;
	canDown: boolean;
	onMove: (delta: -1 | 1) => void;
	disabled?: boolean;
}) {
	return (
		<span className="inline-flex flex-col">
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				className="h-4"
				aria-label={`${label} ▲`}
				disabled={!canUp || disabled}
				onClick={() => onMove(-1)}>
				<ChevronUp />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				className="h-4"
				aria-label={`${label} ▼`}
				disabled={!canDown || disabled}
				onClick={() => onMove(1)}>
				<ChevronDown />
			</Button>
		</span>
	);
}
