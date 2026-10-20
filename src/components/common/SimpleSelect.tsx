import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface Props<T extends string> {
	value: T;
	onValueChange: (value: T) => void;
	options: { value: T; label: string }[];
	id?: string;
	'aria-label'?: string;
	disabled?: boolean;
	className?: string;
}

// shadcn Select with a flat list of options (the common case in this app).
export default function SimpleSelect<T extends string>({
	value,
	onValueChange,
	options,
	id,
	'aria-label': ariaLabel,
	disabled,
	className,
}: Props<T>) {
	return (
		<Select value={value} onValueChange={(v) => onValueChange(v as T)} disabled={disabled}>
			<SelectTrigger id={id} aria-label={ariaLabel} className={className ?? 'w-full'}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options.map((o) => (
					<SelectItem key={o.value} value={o.value}>
						{o.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
