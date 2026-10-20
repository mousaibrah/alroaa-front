import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalize } from '../../hooks/useLocalize';
import {
	createLesson,
	createSection,
	deleteLesson,
	deleteSection,
	reorderLessons,
	reorderSections,
	updateLesson,
	updateSection,
} from '../../api/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { CourseDetail, Section } from '../../types/courses';
import { formatDuration } from '../../utils/format';
import LessonForm from './LessonForm';
import { ErrorBanner } from '../common/ErrorBanner';
import { MoveButtons } from './MoveButtons';
import { errorMessage } from '../../utils/errors';
import { moveItem } from '../../utils/list';
import { toast } from 'sonner';

interface Props {
	course: CourseDetail;
	reload: () => void;
}

// Which lesson form is open: a new lesson in a section, or an existing lesson.
type OpenForm = { kind: 'new'; sectionId: number } | { kind: 'edit'; lessonId: number } | null;

export default function CurriculumTab({ course, reload }: Props) {
	const { t } = useTranslation();
	const { l } = useLocalize();
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [openForm, setOpenForm] = useState<OpenForm>(null);
	const [newSection, setNewSection] = useState({ en: '', ar: '' });
	const [editingSection, setEditingSection] = useState<{
		id: number;
		en: string;
		ar: string;
	} | null>(null);

	// Runs an API call, then refetches the course so the list shows server truth.
	const run = async (action: () => Promise<unknown>, success?: string): Promise<boolean> => {
		setError(null);
		setBusy(true);
		try {
			await action();
			if (success) toast.success(success);
			reload();
			return true;
		} catch (err) {
			setError(errorMessage(err));
			return false;
		} finally {
			setBusy(false);
		}
	};

	const addSection = async (e: FormEvent) => {
		e.preventDefault();
		const data = { titleEn: newSection.en.trim(), titleAr: newSection.ar.trim() };
		if (await run(() => createSection(course.id, data), t('toast.created')))
			setNewSection({ en: '', ar: '' });
	};

	const confirmDelete = (message: string, action: () => Promise<unknown>) => {
		if (window.confirm(message)) void run(action, t('toast.deleted'));
	};

	const moveSection = (index: number, delta: -1 | 1) => {
		const ids = moveItem(course.sections, index, delta).map((s) => s.id);
		void run(() => reorderSections(course.id, ids));
	};

	const moveLesson = (section: Section, index: number, delta: -1 | 1) => {
		const ids = moveItem(section.lessons, index, delta).map((x) => x.id);
		void run(() => reorderLessons(section.id, ids));
	};

	return (
		<div className="space-y-4">
			<ErrorBanner message={error} />
			{course.sections.length === 0 && (
				<p className="text-sm text-muted-foreground">{t('admin.curriculum.empty')}</p>
			)}

			{course.sections.map((section, sIndex) => (
				<Card key={section.id} className="gap-0 py-0">
					<header className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
						<MoveButtons
							label={t('admin.curriculum.moveSection')}
							canUp={sIndex > 0}
							canDown={sIndex < course.sections.length - 1}
							onMove={(d) => moveSection(sIndex, d)}
							disabled={busy}
						/>
						{editingSection?.id === section.id ? (
							<form
								className="flex flex-1 gap-2"
								onSubmit={(e) => {
									e.preventDefault();
									void run(
										() =>
											updateSection(section.id, {
												titleEn: editingSection.en.trim(),
												titleAr: editingSection.ar.trim(),
											}),
										t('toast.saved')
									).then((ok) => ok && setEditingSection(null));
								}}>
								<Input
									required
									autoFocus
									dir="ltr"
									maxLength={255}
									placeholder={t('common.english')}
									value={editingSection.en}
									onChange={(e) => setEditingSection({ ...editingSection, en: e.target.value })}
								/>
								<Input
									required
									dir="rtl"
									maxLength={255}
									placeholder={t('common.arabic')}
									value={editingSection.ar}
									onChange={(e) => setEditingSection({ ...editingSection, ar: e.target.value })}
								/>
								<Button type="submit" disabled={busy}>
									{t('admin.save')}
								</Button>
								<Button
									type="button"
									onClick={() => setEditingSection(null)}
									variant="outline"
									size="sm">
									{t('admin.cancel')}
								</Button>
							</form>
						) : (
							<>
								<h3 className="flex-1 text-sm font-semibold text-foreground">
									{sIndex + 1}. {l(section, 'title')}
								</h3>
								<Button
									type="button"
									onClick={() => setEditingSection({ id: section.id, en: section.titleEn, ar: section.titleAr })}
									variant="outline"
									size="sm">
									{t('admin.rename')}
								</Button>
								<Button
									type="button"
									disabled={busy}
									onClick={() =>
										confirmDelete(t('admin.curriculum.confirmDeleteSection'), () =>
											deleteSection(section.id)
										)
									}
									variant="destructive"
									size="sm">
									{t('admin.delete')}
								</Button>
							</>
						)}
					</header>

					<ul className="divide-y">
						{section.lessons.map((lesson, lIndex) => (
							<li key={lesson.id} className="px-4 py-2">
								{openForm?.kind === 'edit' && openForm.lessonId === lesson.id ? (
									<LessonForm
										lesson={lesson}
										onCancel={() => setOpenForm(null)}
										onSubmit={async (data) => {
											if (await run(() => updateLesson(lesson.id, data), t('toast.saved')))
												setOpenForm(null);
										}}
									/>
								) : (
									<div className="flex items-center gap-3 text-sm">
										<MoveButtons
											label={t('admin.curriculum.moveLesson')}
											canUp={lIndex > 0}
											canDown={lIndex < section.lessons.length - 1}
											onMove={(d) => moveLesson(section, lIndex, d)}
											disabled={busy}
										/>
										<span className="flex-1">
											{l(lesson, 'title')}
											<span className="ms-2 text-xs text-muted-foreground">
												{t(`admin.lesson.${lesson.lessonType}`)}{' '}
												{formatDuration(lesson.durationSec)}
											</span>
											{lesson.isPreview && (
												<Badge variant="secondary" className="ms-2 bg-info-soft text-info-ink">
													{t('courses.preview')}
												</Badge>
											)}
										</span>
										<Button
											type="button"
											onClick={() => setOpenForm({ kind: 'edit', lessonId: lesson.id })}
											variant="outline"
											size="sm">
											{t('admin.edit')}
										</Button>
										<Button
											type="button"
											disabled={busy}
											onClick={() =>
												confirmDelete(t('admin.curriculum.confirmDeleteLesson'), () =>
													deleteLesson(lesson.id)
												)
											}
											variant="destructive"
											size="sm">
											{t('admin.delete')}
										</Button>
									</div>
								)}
							</li>
						))}
					</ul>

					<div className="border-t p-3">
						{openForm?.kind === 'new' && openForm.sectionId === section.id ? (
							<LessonForm
								onCancel={() => setOpenForm(null)}
								onSubmit={async (data) => {
									if (await run(() => createLesson(section.id, data), t('toast.created')))
										setOpenForm(null);
								}}
							/>
						) : (
							<Button
								type="button"
								onClick={() => setOpenForm({ kind: 'new', sectionId: section.id })}
								variant="outline"
								size="sm">
								+ {t('admin.curriculum.addLesson')}
							</Button>
						)}
					</div>
				</Card>
			))}

			<form onSubmit={(e) => void addSection(e)} className="flex gap-2">
				<Input
					required
					dir="ltr"
					maxLength={255}
					placeholder={`${t('admin.curriculum.sectionTitle')} (${t('common.english')})`}
					value={newSection.en}
					onChange={(e) => setNewSection({ ...newSection, en: e.target.value })}
				/>
				<Input
					required
					dir="rtl"
					maxLength={255}
					placeholder={`${t('admin.curriculum.sectionTitle')} (${t('common.arabic')})`}
					value={newSection.ar}
					onChange={(e) => setNewSection({ ...newSection, ar: e.target.value })}
				/>
				<Button type="submit" disabled={busy}>
					+ {t('admin.curriculum.addSection')}
				</Button>
			</form>
		</div>
	);
}
