import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalized } from '../../hooks/useLocalized';
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
import ContentStatusBadge from './ContentStatusBadge';
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
	const loc = useLocalized();
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [openForm, setOpenForm] = useState<OpenForm>(null);
	const [newSection, setNewSection] = useState('');
	const [editingSection, setEditingSection] = useState<{ id: number; title: string } | null>(null);

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
		if (await run(() => createSection(course.id, { title: newSection.trim() }), t('toast.created')))
			setNewSection('');
	};

	const confirmDelete = (message: string, action: () => Promise<unknown>) => {
		if (window.confirm(message)) void run(action, t('toast.deleted'));
	};

	const moveSection = (index: number, delta: -1 | 1) => {
		const ids = moveItem(course.sections, index, delta).map((s) => s.id);
		void run(() => reorderSections(course.id, ids));
	};

	const moveLesson = (section: Section, index: number, delta: -1 | 1) => {
		const ids = moveItem(section.lessons, index, delta).map((l) => l.id);
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
										() => updateSection(section.id, { title: editingSection.title.trim() }),
										t('toast.saved')
									).then((ok) => ok && setEditingSection(null));
								}}>
								<Input
									required
									autoFocus
									value={editingSection.title}
									onChange={(e) => setEditingSection({ id: section.id, title: e.target.value })}
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
									{sIndex + 1}. {section.title}
								</h3>
								<Button
									type="button"
									onClick={() => setEditingSection({ id: section.id, title: section.title })}
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
											{loc(lesson.titleEn, lesson.titleAr)}
											<span className="ms-2 text-xs text-muted-foreground">
												{t(`admin.lesson.${lesson.lessonType}`)}{' '}
												{formatDuration(lesson.durationSec)}
											</span>
											<span className="ms-2">
												<ContentStatusBadge status={lesson.contentStatus} />
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
					maxLength={255}
					placeholder={t('admin.curriculum.sectionTitle')}
					value={newSection}
					onChange={(e) => setNewSection(e.target.value)}
				/>
				<Button type="submit" disabled={busy}>
					+ {t('admin.curriculum.addSection')}
				</Button>
			</form>
		</div>
	);
}
