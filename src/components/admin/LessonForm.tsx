import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import type { LessonInput } from '../../types/admin';
import type { Lesson, LessonType } from '../../types/courses';
import SimpleSelect from '../common/SimpleSelect';
import { ErrorBanner } from '../common/ErrorBanner';
import { BilingualField } from '../common/BilingualField';
import { Field } from '../common/Field';
import { errorMessage } from '../../utils/errors';
import ContentStatusBadge from './ContentStatusBadge';
import MediaUploadField from './MediaUploadField';

interface Props {
	lesson?: Lesson;
	onSubmit: (data: LessonInput) => Promise<void>;
	onCancel: () => void;
}

// What the file picker accepts per lesson type (matches the backend's list).
const ACCEPT: Record<LessonType, string> = {
	video: 'video/mp4,video/webm,video/quicktime',
	text: 'image/jpeg,image/png,image/webp,image/gif',
};

export default function LessonForm({ lesson, onSubmit, onCancel }: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState({ en: lesson?.titleEn ?? '', ar: lesson?.titleAr ?? '' });
	const [description, setDescription] = useState({
		en: lesson?.descriptionEn ?? '',
		ar: lesson?.descriptionAr ?? '',
	});
	const [lessonType, setLessonType] = useState<LessonType>(lesson?.lessonType ?? 'video');
	// The file uploads straight to storage as soon as it is picked.
	const upload = useMediaUpload();
	const [durationSec, setDurationSec] = useState(
		lesson?.durationSec != null ? String(lesson.durationSec) : ''
	);
	const [isPreview, setIsPreview] = useState(lesson?.isPreview ?? false);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [missingFile, setMissingFile] = useState(false);

	// A new lesson needs a file; so does an existing one whose type changes.
	const fileRequired = !lesson || lesson.lessonType !== lessonType;
	const hasFile = upload.status !== 'idle';

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		if (fileRequired && !hasFile) {
			setMissingFile(true);
			return;
		}
		setSaving(true);
		try {
			// Saving early is fine: this waits for the upload to finish.
			const contentMediaId = (await upload.result()) ?? undefined;
			await onSubmit({
				titleEn: title.en.trim(),
				titleAr: title.ar.trim(),
				descriptionEn: description.en,
				descriptionAr: description.ar,
				lessonType,
				durationSec: durationSec === '' ? null : Number(durationSec),
				isPreview,
				contentMediaId,
			});
		} catch (err) {
			setError(errorMessage(err));
			setSaving(false);
		}
	};

	return (
		<form
			onSubmit={(e) => void submit(e)}
			className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
			<ErrorBanner message={error} />
			<BilingualField
				label={t('admin.lesson.title')}
				required
				maxLength={255}
				valueEn={title.en}
				valueAr={title.ar}
				onChange={setTitle}
			/>
			<BilingualField
				label={t('admin.lesson.description')}
				rows={2}
				valueEn={description.en}
				valueAr={description.ar}
				onChange={setDescription}
			/>
			<div className="grid grid-cols-2 gap-3">
				<Field label={t('admin.lesson.type')}>
					<SimpleSelect
						value={lessonType}
						onValueChange={(v) => {
							setLessonType(v);
							upload.reset();
						}}
						options={[
							{ value: 'video', label: t('admin.lesson.video') },
							{ value: 'text', label: t('admin.lesson.text') },
						]}
					/>
				</Field>
				<Field label={t('admin.lesson.durationSec')}>
					<Input
						type="number"
						min={0}
						value={durationSec}
						onChange={(e) => setDurationSec(e.target.value)}
					/>
				</Field>
			</div>
			<p className="text-xs text-muted-foreground">{t('admin.lesson.durationHint')}</p>
			<MediaUploadField
				label={t(
					lesson && !fileRequired ? 'admin.lesson.replaceFile' : 'admin.lesson.file'
				)}
				kind={lessonType === 'video' ? 'video' : 'image'}
				accept={ACCEPT[lessonType]}
				upload={upload}
				invalid={missingFile && !hasFile}
			/>
			{missingFile && !hasFile && (
				<p className="text-xs text-destructive" role="alert">
					{t('admin.upload.required')}
				</p>
			)}
			{lesson?.contentUrl && !hasFile && (
				<p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					{t('admin.lesson.currentFile')}
					<a
						href={lesson.contentUrl}
						target="_blank"
						rel="noreferrer"
						dir="ltr"
						className="max-w-full truncate text-primary underline">
						{lesson.contentUrl}
					</a>
					<ContentStatusBadge status={lesson.contentStatus} />
				</p>
			)}
			<p className="text-xs text-muted-foreground">{t('admin.lesson.fileHint')}</p>
			<Label className="gap-2">
				<Checkbox checked={isPreview} onCheckedChange={(v) => setIsPreview(v === true)} />
				{t('admin.lesson.isPreview')}
			</Label>
			<div className="flex gap-2">
				<Button type="submit" disabled={saving || upload.status === 'error'}>
					{!saving
						? t('admin.save')
						: upload.status === 'uploading'
							? t('admin.upload.savingAfter', {
									percent: upload.file?.size
										? Math.round((upload.loaded / upload.file.size) * 100)
										: 0,
								})
							: t('admin.saving')}
				</Button>
				<Button type="button" onClick={onCancel} variant="outline" size="sm">
					{t('admin.cancel')}
				</Button>
			</div>
		</form>
	);
}
