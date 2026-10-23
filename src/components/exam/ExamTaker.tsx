import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ErrorBanner } from '../common/ErrorBanner';
import { submitAttempt } from '../../api/attempts';
import type { AttemptResult, OpenAttempt } from '../../types/attempts';
import { useCountdown } from '../../hooks/useCountdown';
import ProgressBar from '../courses/ProgressBar';
import { Stagger, StaggerItem } from '../motion/motion';
import { formatClock } from '../../utils/clock';
import { useLocalize } from '../../hooks/useLocalize';

interface Props {
	attempt: OpenAttempt;
	onSubmitted: (result: AttemptResult) => void;
}

type Answers = Record<number, number[]>;

// A selectable answer row: the whole row is the click target.
function OptionLabel({
	id,
	checked,
	children,
}: {
	id: string;
	checked: boolean;
	children: React.ReactNode;
}) {
	return (
		<Label
			htmlFor={id}
			className={cn(
				'cursor-pointer gap-3 rounded-lg border px-3 py-2 font-normal transition-colors',
				checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
			)}>
			{children}
		</Label>
	);
}

// Draft answers survive a page refresh (the timer is on the server anyway).
const storageKey = (attemptId: number) => `exam-answers-${attemptId}`;
const loadDraft = (attemptId: number): Answers => {
	try {
		return JSON.parse(sessionStorage.getItem(storageKey(attemptId)) ?? '{}') as Answers;
	} catch {
		return {};
	}
};
const saveDraft = (attemptId: number, answers: Answers) => {
	try {
		sessionStorage.setItem(storageKey(attemptId), JSON.stringify(answers));
	} catch {
		// storage unavailable: the answers just live in memory
	}
};

export default function ExamTaker({ attempt, onSubmitted }: Props) {
	const { t } = useTranslation();
	const { l } = useLocalize();
	const [answers, setAnswers] = useState<Answers>(() => loadDraft(attempt.id));
	const [submitting, setSubmitting] = useState(false);
	const [failed, setFailed] = useState(false);
	const [timeUp, setTimeUp] = useState(false);

	const total = attempt.questions.length;
	const answeredCount = attempt.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;

	const submit = async () => {
		if (submitting) return;
		setSubmitting(true);
		setFailed(false);
		try {
			const result = await submitAttempt(attempt.id, {
				answers: attempt.questions.map((q) => ({
					questionId: q.id,
					optionIds: answers[q.id] ?? [],
				})),
			});
			try {
				sessionStorage.removeItem(storageKey(attempt.id));
			} catch {
				// ignore
			}
			onSubmitted(result);
		} catch {
			setFailed(true);
			setSubmitting(false);
		}
	};

	const remaining = useCountdown(attempt.expiresAt, attempt.serverNow, () => {
		setTimeUp(true);
		void submit();
	});

	const choose = (questionId: number, optionId: number, multiple: boolean, checked: boolean) => {
		setAnswers((prev) => {
			const current = prev[questionId] ?? [];
			const next = multiple
				? checked
					? [...current, optionId]
					: current.filter((id) => id !== optionId)
				: [optionId];
			const updated = { ...prev, [questionId]: next };
			saveDraft(attempt.id, updated);
			return updated;
		});
	};

	const onSubmit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		if (answeredCount < total && !window.confirm(t('exam.confirmUnanswered'))) return;
		void submit();
	};

	return (
		<form onSubmit={onSubmit} className="space-y-6">
			<Card className="sticky top-0 z-10 gap-0 bg-card/95 py-3 backdrop-blur">
				<CardContent className="space-y-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h1 className="text-lg font-bold text-foreground">{l(attempt, 'examTitle')}</h1>
						{remaining !== null && (
							<Badge
								role="timer"
								aria-label={t('exam.timeLeft')}
								variant={remaining <= 60 ? 'destructive' : 'secondary'}
								className="h-7 px-3 text-sm tabular-nums">
								{t('exam.timeLeft')}: {formatClock(remaining)}
							</Badge>
						)}
					</div>
					<ProgressBar
						value={total === 0 ? 0 : answeredCount / total}
						label={t('exam.answered', { done: answeredCount, total })}
					/>
					{timeUp && (
						<p role="status" className="text-sm font-medium text-destructive">
							{t('exam.timeUp')}
						</p>
					)}
				</CardContent>
			</Card>

			<Stagger as="ol" className="space-y-5">
				{attempt.questions.map((q, index) => {
					const multiple = q.questionType === 'multiple_choice';
					const selected = answers[q.id] ?? [];
					return (
						<StaggerItem as="li" key={q.id}>
							<fieldset className="rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10">
								<legend className="sr-only">
									{index + 1}. {l(q, 'text')}
								</legend>
								<div className="mb-3 flex items-start justify-between gap-3">
									<p className="font-medium text-foreground">
										{index + 1}. {l(q, 'text')}
									</p>
									<span className="shrink-0 text-xs text-muted-foreground">
										{t('exam.points', { points: q.points })}
									</span>
								</div>
								<p className="mb-2 text-xs text-muted-foreground">
									{multiple ? t('exam.chooseMany') : t('exam.chooseOne')}
								</p>
								{multiple ? (
									<div className="space-y-2">
										{q.options.map((o) => (
											<OptionLabel key={o.id} id={`o-${o.id}`} checked={selected.includes(o.id)}>
												<Checkbox
													id={`o-${o.id}`}
													checked={selected.includes(o.id)}
													onCheckedChange={(c) => choose(q.id, o.id, true, c === true)}
													disabled={submitting}
												/>
												<span>{l(o, 'text')}</span>
											</OptionLabel>
										))}
									</div>
								) : (
									<RadioGroup
										className="gap-2"
										value={selected.length ? String(selected[0]) : ''}
										onValueChange={(v) => choose(q.id, Number(v), false, true)}
										disabled={submitting}>
										{q.options.map((o) => (
											<OptionLabel key={o.id} id={`o-${o.id}`} checked={selected.includes(o.id)}>
												<RadioGroupItem id={`o-${o.id}`} value={String(o.id)} />
												<span>{l(o, 'text')}</span>
											</OptionLabel>
										))}
									</RadioGroup>
								)}
							</fieldset>
						</StaggerItem>
					);
				})}
			</Stagger>

			{failed && <ErrorBanner message={t('exam.submitError')} />}
			<Button type="submit" disabled={submitting}>
				{submitting ? t('exam.submitting') : t('exam.submit')}
			</Button>
		</form>
	);
}
