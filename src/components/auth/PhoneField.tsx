import type { InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COUNTRY_CODES, countryLabel } from '../../utils/phone';
import SimpleSelect from '../common/SimpleSelect';

interface PhoneFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	id: string;
	label: string;
	countryCode: string;
	onCountryCodeChange: (code: string) => void;
	// Translation key coming from the zod schema.
	error?: string;
}

// Dialing code picker plus the number. Always left to right, also in Arabic,
// so the code stays in front of the number.
export default function PhoneField({
	id,
	label,
	countryCode,
	onCountryCodeChange,
	error,
	...inputProps
}: PhoneFieldProps) {
	const { t } = useTranslation();
	// Keep a stored code that is not in the list selectable.
	const codes: string[] = COUNTRY_CODES.map((c) => c.code);
	if (!codes.includes(countryCode)) codes.push(countryCode);

	return (
		<div className="grid gap-1.5">
			<Label htmlFor={id}>{label}</Label>
			<div dir="ltr" className="flex gap-2">
				<SimpleSelect
					aria-label={t('phone.countryCode')}
					value={countryCode}
					onValueChange={onCountryCodeChange}
					options={codes.map((code) => ({ value: code, label: countryLabel(code) }))}
					className="w-32 shrink-0"
				/>
				<Input
					id={id}
					type="tel"
					inputMode="tel"
					autoComplete="tel-national"
					placeholder={countryCode === '+966' ? '05XXXXXXXX' : undefined}
					className="text-start"
					aria-invalid={error ? true : undefined}
					{...inputProps}
				/>
			</div>
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{t(error as never)}
				</p>
			)}
		</div>
	);
}
