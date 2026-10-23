import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import type { CourseInput } from '../../types/admin';
import type { Course } from '../../types/courses';
import { ErrorBanner } from '../common/ErrorBanner';
import { BilingualField } from '../common/BilingualField';
import { Field } from '../common/Field';
import MediaUploadField from './MediaUploadField';
import { errorMessage } from '../../utils/errors';
import { toast } from 'sonner';

interface Props {
	// Present when editing an existing course.
	course?: Course;
	submitLabel: string;
	onSubmit: (data: CourseInput) => Promise<void>;
}

// File types the backend accepts for the cover and the intro video.
const IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
const VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime';

export default function CourseForm({ course, submitLabel, onSubmit }: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState({ en: course?.titleEn ?? '', ar: course?.titleAr ?? '' });
	const [description, setDescription] = useState({
		en: course?.descriptionEn ?? '',
		ar: course?.descriptionAr ?? '',
	});
	const [price, setPrice] = useState(String(course?.price ?? 0));
	const [currency, setCurrency] = useState(course?.currency ?? 'SAR');
	// Both upload straight to storage as soon as they are picked.
	const thumbnail = useMediaUpload();
	const introVideo = useMediaUpload();
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	// Local preview of the picked image (released when it changes).
	const picked = thumbnail.file;
	const preview = useMemo(() => (picked ? URL.createObjectURL(picked) : null), [picked]);
	useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

	const shown = preview ?? course?.thumbnailUrl ?? null;

	// Progress of whatever is still uploading, for the save button.
	const uploading = [thumbnail, introVideo].filter((u) => u.status === 'uploading');
	const uploadTotal = uploading.reduce((sum, u) => sum + (u.file?.size ?? 0), 0);
	const uploadPercent = uploadTotal
		? Math.round((uploading.reduce((sum, u) => sum + u.loaded, 0) / uploadTotal) * 100)
		: 0;

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setSaving(true);
		try {
			// Saving early is fine: this waits for the uploads to finish.
			const [thumbnailMediaId, introVideoMediaId] = await Promise.all([
				thumbnail.result(),
				introVideo.result(),
			]);
			await onSubmit({
				titleEn: title.en.trim(),
				titleAr: title.ar.trim(),
				descriptionEn: description.en,
				descriptionAr: description.ar,
				price: Number(price),
				currency: currency.toUpperCase(),
				thumbnailMediaId: thumbnailMediaId ?? undefined,
				introVideoMediaId: introVideoMediaId ?? undefined,
			});
			toast.success(t(course ? 'toast.saved' : 'toast.created'));
			// Saved: the course now shows these files as its current ones.
			thumbnail.reset();
			introVideo.reset();
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
			<MediaUploadField
				label={t(course?.thumbnailUrl ? 'admin.course.replaceThumbnail' : 'admin.course.thumbnail')}
				kind="image"
				accept={IMAGE_TYPES}
				upload={thumbnail}
			/>
			{shown && (
				<img
					src={shown}
					alt={t('admin.course.thumbnail')}
					className="aspect-video w-full max-w-xs rounded-md border object-cover"
				/>
			)}
			<p className="text-xs text-muted-foreground">{t('admin.course.thumbnailHint')}</p>
			<MediaUploadField
				label={t(
					course?.introVideoUrl ? 'admin.course.replaceIntroVideo' : 'admin.course.introVideo'
				)}
				kind="video"
				accept={VIDEO_TYPES}
				upload={introVideo}
			/>
			{course?.introVideoUrl && introVideo.status === 'idle' && (
				<video
					src={course.introVideoUrl}
					controls
					preload="metadata"
					className="aspect-video w-full max-w-xs rounded-md border bg-black"
				/>
			)}
			<p className="text-xs text-muted-foreground">{t('admin.course.introVideoHint')}</p>
			<div className="flex items-center gap-3">
				<Button
					type="submit"
					disabled={saving || thumbnail.status === 'error' || introVideo.status === 'error'}>
					{!saving
						? submitLabel
						: uploading.length
							? t('admin.upload.savingAfter', { percent: uploadPercent })
							: t('admin.saving')}
				</Button>
			</div>
		</form>
	);
}
