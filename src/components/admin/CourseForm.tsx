import { useEffect, useMemo, useState, type FormEvent } from 'react';
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

// Image types the backend accepts for the cover.
const IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

export default function CourseForm({ course, submitLabel, onSubmit }: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState({ en: course?.titleEn ?? '', ar: course?.titleAr ?? '' });
	const [description, setDescription] = useState({
		en: course?.descriptionEn ?? '',
		ar: course?.descriptionAr ?? '',
	});
	const [price, setPrice] = useState(String(course?.price ?? 0));
	const [currency, setCurrency] = useState(course?.currency ?? 'SAR');
	const [thumbnail, setThumbnail] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	// Local preview of the picked image (released when it changes).
	const preview = useMemo(() => (thumbnail ? URL.createObjectURL(thumbnail) : null), [thumbnail]);
	useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

	const shown = preview ?? course?.thumbnailUrl ?? null;

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
				thumbnail,
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
			<Field
				label={t(course?.thumbnailUrl ? 'admin.course.replaceThumbnail' : 'admin.course.thumbnail')}>
				<Input
					type="file"
					accept={IMAGE_TYPES}
					onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
				/>
			</Field>
			{shown && (
				<img
					src={shown}
					alt={t('admin.course.thumbnail')}
					className="aspect-video w-full max-w-xs rounded-md border object-cover"
				/>
			)}
			<p className="text-xs text-muted-foreground">{t('admin.course.thumbnailHint')}</p>
			<div className="flex items-center gap-3">
				<Button type="submit" disabled={saving}>
					{saving ? t('admin.saving') : submitLabel}
				</Button>
			</div>
		</form>
	);
}
