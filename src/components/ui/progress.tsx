import * as React from 'react';
import { cn } from 'cn';
import { Progress as ProgressPrimitive } from 'radix-ui';

function Progress({
	className,
	value,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			value={value}
			className={cn(
				'relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted',
				className
			)}
			{...props}>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className="h-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
				style={{ width: `${value || 0}%` }}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
