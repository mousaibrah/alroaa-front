import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { LessonInput } from '../../types/admin';
import type { Lesson, LessonType } from '../../types/courses';
import SimpleSelect from '../common/SimpleSelect';
import { ErrorBanner } from '../common/ErrorBanner';
import { Field } from '../common/Field';
import { errorMessage } from '../../utils/errors';

interface Props {
	lesson?: Lesson;
	onSubmit: (data: LessonInput) => Promise<void>;
	onCancel: () => void;
}

export default function LessonForm({ lesson, onSubmit, onCancel }: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState(lesson?.title ?? '');
	const [description, setDescription] = useState(lesson?.description ?? '');
	const [lessonType, setLessonType] = useState<LessonType>(lesson?.lessonType ?? 'video');
	const [contentUrl, setContentUrl] = useState(lesson?.contentUrl ?? '');
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
				title: title.trim(),
				description,
				lessonType,
				contentUrl: contentUrl.trim() || null,
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
			<Field label={t('admin.lesson.title')}>
				<Input required maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)} />
			</Field>
			<Field label={t('admin.lesson.description')}>
				<Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
			</Field>
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
			<Field label={t('admin.lesson.contentUrl')}>
				<Input
					type="url"
					dir="ltr"
					placeholder="https://"
					value={contentUrl}
					onChange={(e) => setContentUrl(e.target.value)}
				/>
			</Field>
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
