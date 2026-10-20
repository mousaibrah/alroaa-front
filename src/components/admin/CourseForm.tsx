import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CourseInput } from '../../types/admin';
import type { Course } from '../../types/courses';
import { ErrorBanner } from '../common/ErrorBanner';
import { BilingualField } from '../common/BilingualField';
import { Field } from '../common/Field';
import { errorMessage } from '../../utils/errors';
import { toast } from 'sonner';

interface Props {
	// Present when editing an existing course.
	course?: Course;
	submitLabel: string;
	onSubmit: (data: CourseInput) => Promise<void>;
}

export default function CourseForm({ course, submitLabel, onSubmit }: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState({ en: course?.titleEn ?? '', ar: course?.titleAr ?? '' });
	const [description, setDescription] = useState({
		en: course?.descriptionEn ?? '',
		ar: course?.descriptionAr ?? '',
	});
	const [price, setPrice] = useState(String(course?.price ?? 0));
	const [currency, setCurrency] = useState(course?.currency ?? 'SAR');
	const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl ?? '');
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onSubmit({
				titleEn: title.en.trim(),
				titleAr: title.ar.trim(),
				descriptionEn: description.en,
				descriptionAr: description.ar,
				price: Number(price),
				currency: currency.toUpperCase(),
				thumbnailUrl: thumbnailUrl.trim() || null,
			});
			toast.success(t(course ? 'toast.saved' : 'toast.created'));
		} catch (err) {
			setError(errorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	return (
		<form onSubmit={(e) => void submit(e)} className="space-y-4">
			<ErrorBanner message={error} />
			<BilingualField
				label={t('admin.course.title')}
				required
				maxLength={255}
				valueEn={title.en}
				valueAr={title.ar}
				onChange={setTitle}
			/>
			<BilingualField
				label={t('admin.course.description')}
				rows={4}
				valueEn={description.en}
				valueAr={description.ar}
				onChange={setDescription}
			/>
			<div className="grid grid-cols-2 gap-4">
				<Field label={t('admin.course.price')}>
					<Input
						type="number"
						min={0}
						max={99999999.99}
						step="0.01"
						required
						value={price}
						onChange={(e) => setPrice(e.target.value)}
					/>
				</Field>
				<Field label={t('admin.course.currency')}>
					<Input
						required
						pattern="[A-Za-z]{3}"
						maxLength={3}
						title={t('admin.course.currencyHint')}
						value={currency}
						onChange={(e) => setCurrency(e.target.value)}
					/>
				</Field>
			</div>
			<Field label={t('admin.course.thumbnailUrl')}>
				<Input
					type="url"
					dir="ltr"
					placeholder="https://"
					value={thumbnailUrl}
					onChange={(e) => setThumbnailUrl(e.target.value)}
				/>
			</Field>
			<div className="flex items-center gap-3">
				<Button type="submit" disabled={saving}>
					{saving ? t('admin.saving') : submitLabel}
				</Button>
			</div>
		</form>
	);
}
