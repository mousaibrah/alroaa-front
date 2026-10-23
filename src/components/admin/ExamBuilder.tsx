import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { getExam, saveExam } from '../../api/admin';
import type { QuestionType } from '../../types/admin';
import { useApiQuery } from '../../hooks/useApiQuery';
import { ListSkeleton } from '../feedback/skeletons';
import {
	changeType,
	fromDraft,
	MAX_OPTIONS,
	newOption,
	newQuestion,
	setCorrect,
	toDraft,
	validateDraft,
	type Draft,
	type DraftQuestion,
} from '../../utils/examDraft';
import SimpleSelect from '../common/SimpleSelect';
import { ErrorBanner } from '../common/ErrorBanner';
import { BilingualField } from '../common/BilingualField';
import { Field } from '../common/Field';
import { MoveButtons } from './MoveButtons';
import { errorMessage } from '../../utils/errors';
import { moveItem } from '../../utils/list';
import { toast } from 'sonner';

const TYPES: QuestionType[] = ['single_choice', 'multiple_choice', 'true_false'];

interface Props {
	examId: number;
	onClose: () => void;
}

export default function ExamBuilder({ examId, onClose }: Props) {
	const { t } = useTranslation();
	const {
		data: exam,
		error,
		loading,
	} = useApiQuery((signal) => getExam(examId, signal), `exam:${examId}`);

	if (loading) return <ListSkeleton rows={3} />;
	if (error != null || !exam) {
		return (
			<div className="space-y-3">
				<ErrorBanner message={error ? errorMessage(error) : t('courses.loadError')} />
				<Button type="button" onClick={onClose} variant="outline" size="sm">
					{t('admin.exam.back')}
				</Button>
			</div>
		);
	}
	// key: a different exam gets a fresh editor state.
	return <ExamEditor key={exam.id} initial={toDraft(exam)} examId={exam.id} onClose={onClose} />;
}

type EditQuestion = (key: string, fn: (q: DraftQuestion) => DraftQuestion) => void;

// The answer options of one question. The control that marks the correct
// answer is a radio group (one correct) or checkboxes (several correct).
function QuestionOptions({ q, editQuestion }: { q: DraftQuestion; editQuestion: EditQuestion }) {
	const { t } = useTranslation();
	const multiple = q.questionType === 'multiple_choice';
	const fixed = q.questionType === 'true_false';

	const rows = q.options.map((o, oIndex) => (
		<div key={o.key} className="flex items-center gap-2">
			{multiple ? (
				<Checkbox
					checked={o.isCorrect}
					aria-label={t('admin.exam.markCorrect')}
					onCheckedChange={(checked) =>
						editQuestion(q.key, (x) => setCorrect(x, o.key, checked === true))
					}
				/>
			) : (
				<RadioGroupItem value={o.key} aria-label={t('admin.exam.markCorrect')} />
			)}
			<Input
				dir="ltr"
				value={o.optionTextEn}
				readOnly={fixed}
				placeholder={t('admin.exam.optionPlaceholder', { n: oIndex + 1 })}
				aria-label={`${t('admin.exam.optionText')} (${t('common.english')})`}
				onChange={(e) =>
					editQuestion(q.key, (x) => ({
						...x,
						options: x.options.map((y) =>
							y.key === o.key ? { ...y, optionTextEn: e.target.value } : y
						),
					}))
				}
			/>
			<Input
				dir="rtl"
				value={o.optionTextAr}
				readOnly={fixed}
				placeholder={t('admin.exam.optionPlaceholder', { n: oIndex + 1 })}
				aria-label={`${t('admin.exam.optionText')} (${t('common.arabic')})`}
				onChange={(e) =>
					editQuestion(q.key, (x) => ({
						...x,
						options: x.options.map((y) =>
							y.key === o.key ? { ...y, optionTextAr: e.target.value } : y
						),
					}))
				}
			/>
			{!fixed && (
				<>
					<MoveButtons
						label={t('admin.exam.moveOption')}
						canUp={oIndex > 0}
						canDown={oIndex < q.options.length - 1}
						onMove={(d) =>
							editQuestion(q.key, (x) => ({ ...x, options: moveItem(x.options, oIndex, d) }))
						}
					/>
					<Button
						type="button"
						disabled={q.options.length <= 2}
						aria-label={t('admin.exam.deleteOption')}
						onClick={() =>
							editQuestion(q.key, (x) => ({
								...x,
								options: x.options.filter((y) => y.key !== o.key),
							}))
						}
						variant="destructive"
						size="sm">
						✕
					</Button>
				</>
			)}
		</div>
	));

	return multiple ? (
		<div className="space-y-2 ps-9">{rows}</div>
	) : (
		<RadioGroup
			className="gap-2 ps-9"
			value={q.options.find((o) => o.isCorrect)?.key ?? ''}
			onValueChange={(key) => editQuestion(q.key, (x) => setCorrect(x, key, true))}>
			{rows}
		</RadioGroup>
	);
}

function ExamEditor({
	initial,
	examId,
	onClose,
}: {
	initial: Draft;
	examId: number;
	onClose: () => void;
}) {
	const { t, i18n } = useTranslation();
	const [draft, setDraft] = useState<Draft>(initial);
	const [snapshot, setSnapshot] = useState(() => JSON.stringify(initial));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const dirty = JSON.stringify(draft) !== snapshot;
	const issues = validateDraft(draft);
	const totalPoints = draft.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

	// Warn before the tab is closed with unsaved changes.
	useEffect(() => {
		if (!dirty) return;
		const handler = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [dirty]);

	const edit = (patch: Partial<Draft>) => {
		setDraft((d) => ({ ...d, ...patch }));
	};
	const editQuestion = (key: string, fn: (q: DraftQuestion) => DraftQuestion) =>
		edit({ questions: draft.questions.map((q) => (q.key === key ? fn(q) : q)) });

	const save = async () => {
		setError(null);
		setSaving(true);
		try {
			const result = await saveExam(examId, fromDraft(draft));
			// Adopt the server copy so new questions/options get their ids.
			const next = toDraft(result);
			setDraft(next);
			setSnapshot(JSON.stringify(next));
			toast.success(t('toast.examSaved'));
		} catch (err) {
			setError(errorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const close = () => {
		if (!dirty || window.confirm(t('admin.exam.discard'))) onClose();
	};

	// True/false answers are stored in both languages whatever the UI language is.
	const en = i18n.getFixedT('en');
	const ar = i18n.getFixedT('ar');
	const typeLabels = {
		trueEn: en('admin.exam.true'),
		trueAr: ar('admin.exam.true'),
		falseEn: en('admin.exam.false'),
		falseAr: ar('admin.exam.false'),
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<Button type="button" onClick={close} variant="outline" size="sm">
					← {t('admin.exam.back')}
				</Button>
				<div className="flex items-center gap-3">
					{dirty && (
						<span className="text-sm text-warning-ink motion-safe:animate-fade-in">
							{t('admin.exam.unsaved')}
						</span>
					)}
					<Button
						type="button"
						disabled={saving || !dirty || issues.length > 0}
						onClick={() => void save()}>
						{saving ? t('admin.saving') : t('admin.exam.save')}
					</Button>
				</div>
			</div>

			<ErrorBanner message={error} />

			<Card>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<BilingualField
						label={t('admin.exam.title')}
						className="sm:col-span-2"
						maxLength={255}
						valueEn={draft.titleEn}
						valueAr={draft.titleAr}
						onChange={({ en, ar }) => edit({ titleEn: en, titleAr: ar })}
					/>
					<BilingualField
						label={t('admin.exam.description')}
						className="sm:col-span-2"
						rows={2}
						valueEn={draft.descriptionEn}
						valueAr={draft.descriptionAr}
						onChange={({ en, ar }) => edit({ descriptionEn: en, descriptionAr: ar })}
					/>
					<Field label={t('admin.exam.passingScore', { total: totalPoints })}>
						<Input
							type="number"
							min={0}
							step="0.01"
							value={draft.passingScore}
							onChange={(e) => edit({ passingScore: e.target.value })}
						/>
					</Field>
					<Field label={t('admin.exam.durationMin')}>
						<Input
							type="number"
							min={0}
							step="1"
							placeholder={t('admin.exam.noLimit')}
							value={draft.durationMin}
							onChange={(e) => edit({ durationMin: e.target.value })}
						/>
					</Field>
				</CardContent>
			</Card>

			{draft.questions.length === 0 && (
				<p className="text-sm text-muted-foreground">{t('admin.exam.noQuestions')}</p>
			)}

			{draft.questions.map((q, index) => (
				<fieldset
					key={q.key}
					className="space-y-3 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10">
					<legend className="px-1 text-sm font-semibold text-foreground">
						{t('admin.exam.question', { n: index + 1 })}
					</legend>

					<div className="flex items-start gap-3">
						<MoveButtons
							label={t('admin.exam.moveQuestion')}
							canUp={index > 0}
							canDown={index < draft.questions.length - 1}
							onMove={(d) => edit({ questions: moveItem(draft.questions, index, d) })}
						/>
						<div className="grid flex-1 gap-3 sm:grid-cols-[1fr_11rem_6rem]">
							<BilingualField
								label={t('admin.exam.questionText')}
								className="sm:col-span-3"
								rows={2}
								valueEn={q.textEn}
								valueAr={q.textAr}
								onChange={({ en, ar }) =>
									editQuestion(q.key, (x) => ({ ...x, textEn: en, textAr: ar }))
								}
							/>
							<Field label={t('admin.exam.type')}>
								<SimpleSelect
									value={q.questionType}
									onValueChange={(type) =>
										editQuestion(q.key, (x) => changeType(x, type, typeLabels))
									}
									options={TYPES.map((type) => ({
										value: type,
										label: t(`admin.exam.types.${type}`),
									}))}
								/>
							</Field>
							<Field label={t('admin.exam.points')}>
								<Input
									type="number"
									min={0}
									step="0.01"
									value={q.points}
									onChange={(e) => editQuestion(q.key, (x) => ({ ...x, points: e.target.value }))}
								/>
							</Field>
						</div>
						<Button
							type="button"
							onClick={() => {
								if (window.confirm(t('admin.exam.confirmDeleteQuestion'))) {
									edit({ questions: draft.questions.filter((x) => x.key !== q.key) });
								}
							}}
							variant="destructive"
							size="sm">
							{t('admin.delete')}
						</Button>
					</div>

					<QuestionOptions q={q} editQuestion={editQuestion} />
					{q.questionType !== 'true_false' && (
						<div className="ps-9">
							<Button
								type="button"
								disabled={q.options.length >= MAX_OPTIONS}
								onClick={() =>
									editQuestion(q.key, (x) => ({ ...x, options: [...x.options, newOption()] }))
								}
								variant="outline"
								size="sm">
								+ {t('admin.exam.addOption')}
							</Button>
						</div>
					)}
				</fieldset>
			))}

			<Button
				type="button"
				onClick={() => edit({ questions: [...draft.questions, newQuestion()] })}
				variant="outline"
				size="sm">
				+ {t('admin.exam.addQuestion')}
			</Button>

			{issues.length > 0 && (
				<ul className="list-disc space-y-1 rounded-lg bg-warning-soft px-6 py-3 text-sm text-warning-ink">
					{issues.map((issue, i) => (
						<li key={i}>
							{t(`admin.exam.issues.${issue.code}`, {
								n: issue.n,
								passing: issue.passing,
								total: issue.total,
							})}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
