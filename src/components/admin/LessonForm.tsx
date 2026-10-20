import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { LessonInput } from '../../types/admin';
import type { Lesson, LessonType } from '../../types/courses';
import SimpleSelect from '../common/SimpleSelect';
import { ErrorBanner } from '../common/ErrorBanner';
import { BilingualField } from '../common/BilingualField';
import { Field } from '../common/Field';
import { errorMessage } from '../../utils/errors';

interface Props {
	lesson?: Lesson;
	onSubmit: (data: LessonInput) => Promise<void>;
	onCancel: () => void;
}

export default function LessonForm({ lesson, onSubmit, onCancel }: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState({ en: lesson?.titleEn ?? '', ar: lesson?.titleAr ?? '' });
	const [description, setDescription] = useState({
		en: lesson?.descriptionEn ?? '',
		ar: lesson?.descriptionAr ?? '',
	});
	const [lessonType, setLessonType] = useState<LessonType>(lesson?.lessonType ?? 'video');
	// The recording can differ per language; fill only one if there is a single one.
	const [contentUrl, setContentUrl] = useState({
		en: lesson?.contentUrlEn ?? '',
		ar: lesson?.contentUrlAr ?? '',
	});
	const [durationSec, setDurationSec] = useState(
		lesson?.durationSec != null ? String(lesson.durationSec) : ''
	);
	const [isPreview, setIsPreview] = useState(lesson?.isPreview ?? false);
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
				lessonType,
				contentUrlEn: contentUrl.en.trim() || null,
				contentUrlAr: contentUrl.ar.trim() || null,
				durationSec: durationSec === '' ? null : Number(durationSec),
				isPreview,
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
						onValueChange={setLessonType}
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
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label={`${t('admin.lesson.contentUrl')} (${t('common.english')})`}>
					<Input
						type="url"
						dir="ltr"
						placeholder="https://"
						value={contentUrl.en}
						onChange={(e) => setContentUrl({ ...contentUrl, en: e.target.value })}
					/>
				</Field>
				<Field label={`${t('admin.lesson.contentUrl')} (${t('common.arabic')})`}>
					<Input
						type="url"
						dir="ltr"
						placeholder="https://"
						value={contentUrl.ar}
						onChange={(e) => setContentUrl({ ...contentUrl, ar: e.target.value })}
					/>
				</Field>
			</div>
			<Label className="gap-2">
				<Checkbox checked={isPreview} onCheckedChange={(v) => setIsPreview(v === true)} />
				{t('admin.lesson.isPreview')}
			</Label>
			<div className="flex gap-2">
				<Button type="submit" disabled={saving}>
					{saving ? t('admin.saving') : t('admin.save')}
				</Button>
				<Button type="button" onClick={onCancel} variant="outline" size="sm">
					{t('admin.cancel')}
				</Button>
			</div>
		</form>
	);
}
