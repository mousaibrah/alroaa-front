import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalized } from '../hooks/useLocalized';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { getCourse } from '../api/courses';
import type { Lesson } from '../types/courses';
import { Permission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EnrollButton from '../components/courses/EnrollButton';
import ExamList from '../components/courses/ExamList';
import { formatPrice } from '../utils/format';
import LessonGate from '../components/courses/LessonGate';
import LessonPlayer from '../components/courses/LessonPlayer';
import LessonRow from '../components/courses/LessonRow';
import ProgressBar from '../components/courses/ProgressBar';
import UnlockButton from '../components/courses/UnlockButton';
import { Stagger, StaggerItem } from '../components/motion/motion';
import { CourseDetailSkeleton } from '../components/feedback/skeletons';
import { useApiQuery } from '../hooks/useApiQuery';
import { paths } from '@/routes/paths';

export default function CourseLearnPage() {
	const { t, i18n } = useTranslation();
	const loc = useLocalized();
	const { id } = useParams();
	const courseId = Number(id);
	const { user, role, hasPermission } = useAuth();
	const [selectedId, setSelectedId] = useState<number | null>(null);

	const {
		data: course,
		error,
		loading,
		reload,
	} = useApiQuery((signal) => getCourse(courseId, signal), `course:${courseId}`);

	if (loading) return <CourseDetailSkeleton />;
	if (error != null || !course) {
		const notFound = error instanceof ApiError && error.status === 404;
		return (
			<section className="text-center">
				<p className="mb-4 text-foreground">
					{t(notFound ? 'courses.notFound' : 'courses.loadError')}
				</p>
				<Button asChild variant="link">
					<Link to={paths.courses}>{t('courses.back')}</Link>
				</Button>
			</section>
		);
	}

	const canManage = role === 'admin' || course.authorId === user?.id;
	// Authors/admins and enrolled learners get the content; only enrolled
	// learners are tracked and gated by the lock.
	const isLearner = course.hasAccess && !canManage;
	const canEnroll = hasPermission(Permission.ENROLLMENTS_CREATE);
	const lessons = course.sections.flatMap((s) => s.lessons);
	const isFree = course.price === 0;
	const price = formatPrice(course.price, course.currency, i18n.language);

	// What happens when the learner picks a lesson. Nothing opens without an
	// enrollment (free lessons included); paid content also needs a payment.
	const stateOf = (l: Lesson) =>
		l.locked ? 'locked' : !course.hasAccess ? 'enroll' : l.paymentRequired ? 'payment' : 'open';
	const tagOf = (l: Lesson) => (isFree ? null : l.isPreview ? 'free' : 'paid');

	const completedCount = lessons.filter((l) => l.completed).length;
	const defaultLesson =
		lessons.find((l) => stateOf(l) === 'open' && !l.completed) ??
		lessons.find((l) => stateOf(l) === 'payment') ??
		lessons.find((l) => stateOf(l) === 'open') ??
		lessons.find((l) => stateOf(l) !== 'locked');
	const active =
		lessons.find((l) => l.id === selectedId && stateOf(l) !== 'locked') ?? defaultLesson;
	const activeState = active ? stateOf(active) : null;

	return (
		<div className="w-full max-w-7xl self-start px-1 py-6">
			<nav aria-label={t('courses.breadcrumb')} className="text-sm text-muted-foreground">
				<Link to={paths.home} className="hover:text-primary hover:underline">
					{t('nav.home')}
				</Link>
				<span aria-hidden> / </span>
				<Link to={paths.courses} className="hover:text-primary hover:underline">
					{t('courses.title')}
				</Link>
				<span aria-hidden> / </span>
				<Link to={paths.course(course.id)} className="hover:text-primary hover:underline">
					{loc(course.titleEn, course.titleAr)}
				</Link>
				<span aria-hidden> / </span>
				<span className="text-foreground">{t('courses.lessons')}</span>
			</nav>
			<div className="mt-4 flex flex-wrap items-center gap-2">
				<Badge variant="secondary" className="bg-card text-primary">
					{isFree ? t('courses.free') : t('courses.paidTag')}
				</Badge>
				{lessons.length > 0 && (
					<Badge variant="secondary" className="bg-card text-muted-foreground">
						{t('courses.lessonCount', { count: lessons.length })}
					</Badge>
				)}
			</div>
			<h1 className="mt-3 text-3xl font-extrabold text-primary-dark md:text-4xl">{loc(course.titleEn, course.titleAr)}</h1>
			{loc(course.descriptionEn, course.descriptionAr) && (
				<p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
					{loc(course.descriptionEn, course.descriptionAr)}
				</p>
			)}

			{isLearner && lessons.length > 0 && (
				<div className="mt-4 max-w-md">
					<ProgressBar
						value={completedCount / lessons.length}
						label={t('courses.progress', { done: completedCount, total: lessons.length })}
					/>
				</div>
			)}
			{isLearner && course.paymentRequired && (
				<Card
					role="status"
					className="mt-4 gap-0 bg-brand-secondary/10 py-3 ring-brand-secondary/30 motion-safe:animate-fade-in">
					<CardContent className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-foreground">{t('courses.unlockBanner', { price })}</p>
						<UnlockButton courseId={course.id} price={price} />
					</CardContent>
				</Card>
			)}

			<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
				<div>
					{active && activeState === 'enroll' ? (
						<LessonGate
							lessonTitle={loc(active.titleEn, active.titleAr)}
							title={t('courses.enrollTitle')}
							body={t(isFree ? 'courses.enrollBodyFree' : 'courses.enrollBodyPaid', { price })}>
							{canEnroll ? (
								<EnrollButton courseId={course.id} free={isFree} onEnrolled={reload} />
							) : (
								<p className="text-sm text-muted-foreground">{t('courses.cannotEnroll')}</p>
							)}
						</LessonGate>
					) : active && activeState === 'payment' ? (
						<LessonGate
							lessonTitle={loc(active.titleEn, active.titleAr)}
							title={t('courses.payTitle')}
							body={t('courses.payBody', { price })}>
							<UnlockButton courseId={course.id} price={price} />
						</LessonGate>
					) : active ? (
						<LessonPlayer
							key={active.id}
							lesson={active}
							trackProgress={isLearner}
							onProgress={(result) => {
								// Completing a lesson unlocks the next one: refetch to get its
								// content, then move on to it.
								if (result.newlyCompleted) {
									reload();
									if (result.unlockedLessonId) setSelectedId(result.unlockedLessonId);
								}
							}}
						/>
					) : (
						<Card className="border border-dashed bg-transparent shadow-none ring-0">
							<CardContent className="text-center text-muted-foreground">
								{t('courses.nothingToPlay')}
							</CardContent>
						</Card>
					)}
				</div>

				<aside aria-label={t('courses.curriculum')}>
					<Stagger className="space-y-4">
						{course.sections.length === 0 && (
							<p className="text-sm text-muted-foreground">{t('courses.noSections')}</p>
						)}
						{course.sections.map((section, index) => (
							<StaggerItem key={section.id}>
								<Card className="gap-0 py-0">
									<h2 className="border-b bg-sand px-4 py-3 text-sm font-bold text-primary-dark">
										{index + 1}. {section.title}
									</h2>
									<ul className="divide-y">
										{section.lessons.map((lesson) => (
											<LessonRow
												key={lesson.id}
												lesson={lesson}
												state={stateOf(lesson)}
												tag={tagOf(lesson)}
												active={lesson.id === active?.id}
												onSelect={() => setSelectedId(lesson.id)}
											/>
										))}
									</ul>
								</Card>
							</StaggerItem>
						))}

						{course.exams.length > 0 && (
							<StaggerItem>
								<ExamList exams={course.exams} />
							</StaggerItem>
						)}
					</Stagger>
				</aside>
			</div>
		</div>
	);
}
