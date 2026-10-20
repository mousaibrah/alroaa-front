import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// A label wrapped around its control, so the two are linked without ids.
export function Field({
	label,
	children,
	className,
}: {
	label: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Label className={cn('flex-col items-stretch gap-1.5', className)}>
			<span>{label}</span>
			{children}
		</Label>
	);
}
