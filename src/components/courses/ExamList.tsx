import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { startExam } from '../../api/attempts';
import type { CourseExam } from '../../types/courses';
import { Permission } from '../../auth/permissions';
import { useAuth } from '../../auth/useAuth';
import { CheckIcon, LockIcon } from './Icons';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';

function ExamRow({ exam, canTake }: { exam: CourseExam; canTake: boolean }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [busy, setBusy] = useState(false);

	const start = async () => {
		setBusy(true);
		try {
			const attempt = await startExam(exam.id);
			void navigate(paths.attempt(attempt.id));
		} catch {
			toast.error(t('exam.startError'));
			setBusy(false);
		}
	};

	const label = exam.inProgress
		? t('exam.resumeExam')
		: exam.attempts > 0
			? t('exam.retakeExam')
			: t('exam.startExam');

	return (
		<li className="flex items-start gap-3 px-4 py-3 text-sm">
			<span className={exam.locked ? 'text-muted-foreground' : 'text-success'}>
				{exam.locked ? <LockIcon /> : <CheckIcon />}
			</span>
			<div className="flex-1 space-y-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className={exam.locked ? 'text-muted-foreground' : 'font-medium text-foreground'}>
						{exam.title}
					</p>
					{exam.passed ? (
						<Badge variant="secondary" className="bg-success-soft text-success-ink">
							{t('exam.passedBadge')}
						</Badge>
					) : (
						exam.attempts > 0 && (
							<Badge variant="secondary" className="bg-warning-soft text-warning-ink">
								{t('exam.notPassedBadge')}
							</Badge>
						)
					)}
				</div>
				{exam.description && <p className="text-xs text-muted-foreground">{exam.description}</p>}
				<p className="text-xs text-muted-foreground">
					{t('courses.examMeta', { count: exam.questionCount, passing: exam.passingScore })}
					{exam.durationSec
						? ` · ${t('courses.examMinutes', { minutes: Math.round(exam.durationSec / 60) })}`
						: ''}
				</p>
				{exam.bestScore !== null && exam.maxScore !== null && (
					<p className="text-xs font-medium text-foreground">
						{t('exam.bestScore', { score: exam.bestScore, max: exam.maxScore })}
					</p>
				)}
				{exam.locked && (
					<p className="text-xs font-medium text-muted-foreground">{t('courses.examLocked')}</p>
				)}
				{!exam.locked && canTake && (
					<div className="flex flex-wrap items-center gap-3 pt-1">
						<Button
							type="button"
							onClick={() => void start()}
							disabled={busy || exam.questionCount === 0}
							size="sm">
							{busy ? t('exam.starting') : label}
						</Button>
						{exam.lastAttemptId !== null && (
							<Button asChild variant="link" size="sm" className="h-auto px-0 text-xs">
								<Link to={paths.attempt(exam.lastAttemptId)}>{t('exam.reviewResult')}</Link>
							</Button>
						)}
					</div>
				)}
				{!exam.locked && canTake && exam.durationSec ? (
					<p className="text-xs text-muted-foreground">{t('exam.timeNotice')}</p>
				) : null}
			</div>
		</li>
	);
}

export default function ExamList({ exams }: { exams: CourseExam[] }) {
	const { t } = useTranslation();
	const { hasPermission } = useAuth();
	const canTake = hasPermission(Permission.EXAMS_TAKE);

	return (
		<Card className="gap-0 py-0">
			<h2 className="border-b bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground">
				{t('courses.exams')}
			</h2>
			<ul className="divide-y">
				{exams.map((exam) => (
					<ExamRow key={exam.id} exam={exam} canTake={canTake} />
				))}
			</ul>
		</Card>
	);
}
