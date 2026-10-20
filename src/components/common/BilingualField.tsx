import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Field } from './Field';

interface Props {
	label: string;
	valueEn: string;
	valueAr: string;
	onChange: (value: { en: string; ar: string }) => void;
	// A textarea of this many rows instead of a single-line input.
	rows?: number;
	required?: boolean;
	maxLength?: number;
	className?: string;
}

// The same text in English and Arabic, side by side. The Arabic box is
// right-to-left and the English one left-to-right whatever the page direction.
export function BilingualField({
	label,
	valueEn,
	valueAr,
	onChange,
	rows,
	required,
	maxLength,
	className,
}: Props) {
	const { t } = useTranslation();
	const props = { required, maxLength };
	return (
		<div className={cn('grid gap-3 sm:grid-cols-2', className)}>
			<Field label={`${label} (${t('common.english')})`}>
				{rows ? (
					<Textarea
						dir="ltr"
						rows={rows}
						value={valueEn}
						onChange={(e) => onChange({ en: e.target.value, ar: valueAr })}
					/>
				) : (
					<Input
						dir="ltr"
						{...props}
						value={valueEn}
						onChange={(e) => onChange({ en: e.target.value, ar: valueAr })}
					/>
				)}
			</Field>
			<Field label={`${label} (${t('common.arabic')})`}>
				{rows ? (
					<Textarea
						dir="rtl"
						rows={rows}
						value={valueAr}
						onChange={(e) => onChange({ en: valueEn, ar: e.target.value })}
					/>
				) : (
					<Input
						dir="rtl"
						{...props}
						value={valueAr}
						onChange={(e) => onChange({ en: valueEn, ar: e.target.value })}
					/>
				)}
			</Field>
		</div>
	);
}
