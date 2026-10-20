import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { getAttempt } from '../api/attempts';
import type { AttemptResult } from '../types/attempts';
import ExamResult from '../components/exam/ExamResult';
import ExamTaker from '../components/exam/ExamTaker';
import { useApiQuery } from '../hooks/useApiQuery';
import { QuestionsSkeleton } from '../components/feedback/skeletons';
import { paths } from '@/routes/paths';

// One page for both phases of an attempt: taking the exam while it is open,
// the graded review once it is finished (also reachable later by its URL).
function Attempt({ id }: { id: number }) {
	const { t } = useTranslation();
	const [submitted, setSubmitted] = useState<AttemptResult | null>(null);
	const { data, error, loading } = useApiQuery((signal) => getAttempt(id, signal), `attempt:${id}`);

	if (submitted) return <ExamResult result={submitted} />;
	if (loading) return <QuestionsSkeleton />;
	if (error != null || !data) {
		return (
			<section className="text-center">
				<p className="mb-4 text-foreground">{t('exam.loadError')}</p>
				<Link to={paths.courses} className="text-sm font-medium text-primary hover:underline">
					{t('courses.back')}
				</Link>
			</section>
		);
	}
	return data.status === 'in_progress' ? (
		<ExamTaker attempt={data} onSubmitted={setSubmitted} />
	) : (
		<ExamResult result={data} />
	);
}

export default function AttemptPage() {
	const { attemptId } = useParams();
	// key: a new attempt (retake) starts from a clean state.
	return (
		<section className="mx-auto w-full max-w-3xl self-start py-4">
			<Attempt key={attemptId} id={Number(attemptId)} />
		</section>
	);
}
