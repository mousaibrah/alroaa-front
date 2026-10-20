import type { InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	id: string;
	label: string;
	// Translation key coming from the zod schema.
	error?: string;
}

export default function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
	const { t } = useTranslation();

	return (
		<div className="grid gap-1.5">
			<Label htmlFor={id}>{label}</Label>
			<Input id={id} aria-invalid={error ? true : undefined} {...inputProps} />
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{t(error as never)}
				</p>
			)}
		</div>
	);
}
