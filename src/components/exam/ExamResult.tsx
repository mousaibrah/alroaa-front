import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { startExam } from '../../api/attempts';
import type { AttemptResult } from '../../types/attempts';
import { CountUp, Reveal, Stagger, StaggerItem } from '../motion/motion';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';
import { useLocalize } from '../../hooks/useLocalize';

export default function ExamResult({ result }: { result: AttemptResult }) {
	const { t } = useTranslation();
	const { l } = useLocalize();
	const navigate = useNavigate();
	const [busy, setBusy] = useState(false);

	const percent = result.maxScore === 0 ? 0 : Math.round((result.score / result.maxScore) * 100);
	const expired = result.status === 'expired';

	const retake = async () => {
		setBusy(true);
		try {
			const next = await startExam(result.examId);
			void navigate(paths.attempt(next.id));
		} catch {
			toast.error(t('exam.startError'));
			setBusy(false);
		}
	};

	return (
		<div className="space-y-6">
			<Reveal>
				<Card
					role="status"
					className={cn(
						'gap-2 py-6 text-center',
						result.passed ? 'bg-success-soft ring-success/30' : 'bg-danger-soft ring-danger/30'
					)}>
					<p className="text-sm font-medium text-muted-foreground">{l(result, 'examTitle')}</p>
					<h1
						className={`text-2xl font-bold ${result.passed ? 'text-success-ink' : 'text-danger-ink'}`}>
						{result.passed ? t('exam.passedTitle') : t('exam.failedTitle')}
					</h1>
					<p className="text-4xl font-bold text-foreground tabular-nums">
						<CountUp to={percent} />%
					</p>
					<p className="text-sm text-foreground">
						{t('exam.scoreOf', { score: result.score, max: result.maxScore })}
					</p>
					<p className="text-xs text-muted-foreground">
						{t('exam.passingNote', { passing: result.passingScore })}
					</p>
					{expired && (
						<p className="text-sm font-medium text-destructive">{t('exam.expiredBanner')}</p>
					)}
				</Card>
			</Reveal>

			{result.certificateCode && (
				<Reveal>
					<Card className="flex-row flex-wrap items-center justify-between gap-4 bg-sand px-6 py-5">
						<div className="flex items-center gap-3">
							<Award className="size-8 text-gold-ink" aria-hidden />
							<p className="font-bold text-primary-dark">{t('certificate.earned')}</p>
						</div>
						<Button asChild>
							<Link to={paths.verifyCode(result.certificateCode)}>{t('certificate.view')}</Link>
						</Button>
					</Card>
				</Reveal>
			)}

			<div className="flex flex-wrap items-center gap-3">
				<Button asChild variant="outline">
					<Link to={paths.course(result.courseId)}>{t('exam.backToCourse')}</Link>
				</Button>
				{!result.passed && (
					<Button type="button" onClick={() => void retake()} disabled={busy}>
						{busy ? t('exam.starting') : t('exam.retake')}
					</Button>
				)}
			</div>

			<section aria-label={t('exam.review')} className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">{t('exam.review')}</h2>
				<Stagger as="ol" className="space-y-4">
					{result.questions.map((q, index) => (
						<StaggerItem as="li" key={q.id}>
							<Card>
								<CardContent className="space-y-3">
									<div className="flex items-start justify-between gap-3">
										<p className="font-medium text-foreground">
											{index + 1}. {l(q, 'text')}
										</p>
										<div className="flex shrink-0 flex-col items-end gap-1">
											<Badge
												variant="secondary"
												className={cn(
													q.correct && 'bg-success-soft text-success-ink',
													!q.correct && q.answered && 'bg-danger-soft text-danger-ink'
												)}>
												{q.correct
													? t('exam.correct')
													: q.answered
														? t('exam.incorrect')
														: t('exam.unanswered')}
											</Badge>
											<span className="text-xs text-muted-foreground">
												{t('exam.earned', { earned: q.earned, points: q.points })}
											</span>
										</div>
									</div>
									<ul className="space-y-2">
										{q.options.map((o) => {
											const tone = o.isCorrect
												? 'border-success/50 bg-success-soft'
												: o.selected
													? 'border-danger/50 bg-danger-soft'
													: 'border-border';
											return (
												<li
													key={o.id}
													className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${tone}`}>
													<span>{l(o, 'text')}</span>
													<span className="flex shrink-0 gap-2 text-xs font-medium">
														{o.selected && (
															<span
																className={o.isCorrect ? 'text-success-ink' : 'text-destructive'}>
																{o.isCorrect ? '✓' : '✗'} {t('exam.selected')}
															</span>
														)}
														{o.isCorrect && !o.selected && (
															<span className="text-success-ink">✓ {t('exam.isCorrect')}</span>
														)}
													</span>
												</li>
											);
										})}
									</ul>
								</CardContent>
							</Card>
						</StaggerItem>
					))}
				</Stagger>
			</section>
		</div>
	);
}
