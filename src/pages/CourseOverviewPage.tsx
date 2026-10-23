import { BookOpen, ChevronDown, ClipboardCheck, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { paths } from '@/routes/paths';
import { ApiError } from '../api/client';
import { getCourse } from '../api/courses';
import { Permission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import EnrollButton from '../components/courses/EnrollButton';
import ExamList from '../components/courses/ExamList';
import ProgressBar from '../components/courses/ProgressBar';
import UnlockButton from '../components/courses/UnlockButton';
import VideoPlayer from '../components/video/VideoPlayer';
import { CourseDetailSkeleton } from '../components/feedback/skeletons';
import { useApiQuery } from '../hooks/useApiQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatDuration, formatPrice } from '../utils/format';
import { useLocalize } from '../hooks/useLocalize';

// Photos (public/assets/img/<name>.webp) used until a program has its own thumbnail.
const PHOTOS = ['records', 'audit', 'mgmt', 'park', 'tests', 'rehab'] as const;

// The page a learner sees before opening the lessons: what the program is,
// what is inside it, and the one action that fits their situation (enroll,
// pay, or continue). The lessons player lives at paths.learn(id).
export default function CourseOverviewPage() {
	const { t, i18n } = useTranslation();
	const { l } = useLocalize();
	const { id } = useParams();
	const courseId = Number(id);
	const navigate = useNavigate();
	const { user, role, hasPermission, isAuthenticated } = useAuth();
	const [tab, setTab] = useState('overview');

	const {
		data: course,
		error,
		loading,
		reload,
	} = useApiQuery((signal) => getCourse(courseId, signal), `course:${courseId}`);
	usePageTitle(course ? l(course, 'title') : t('courses.title'));

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
	const isLearner = course.hasAccess && !canManage;
	const canEnroll = hasPermission(Permission.ENROLLMENTS_CREATE);
	const isFree = course.price === 0;
	const price = formatPrice(course.price, course.currency, i18n.language);

	const lessons = course.sections.flatMap((s) => s.lessons);
	const completed = lessons.filter((l) => l.completed).length;
	const totalSec = lessons.reduce((sum, l) => sum + (l.durationSec ?? 0), 0);
	const minutes = Math.round(totalSec / 60);
	const duration =
		minutes === 0
			? null
			: minutes < 60
				? t('courses.durationMinutes', { value: minutes })
				: t('courses.durationHours', { value: Math.round(minutes / 6) / 10 });
	const photo = PHOTOS[course.id % PHOTOS.length];

	const learn = paths.learn(course.id);
	const started = completed > 0;

	// The one action of the side card.
	const action = !isAuthenticated ? (
		// Guests can read the programme; opening the lessons needs an account.
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">{t('courses.signInToLearn')}</p>
			<Button asChild size="lg" className="w-full">
				<Link to={paths.login} state={{ from: { pathname: learn } }}>
					{t('nav.login')}
				</Link>
			</Button>
			<Button asChild variant="outline" size="lg" className="w-full">
				<Link to={paths.register} state={{ from: { pathname: learn } }}>{t('nav.register')}</Link>
			</Button>
		</div>
	) : canManage ? (
		<div className="space-y-2">
			<Button asChild size="lg" className="w-full">
				<Link to={learn}>{t('courses.previewLessons')}</Link>
			</Button>
			<Button asChild variant="outline" size="lg" className="w-full">
				<Link to={paths.adminCourse(course.id)}>{t('admin.manage')}</Link>
			</Button>
		</div>
	) : course.hasAccess ? (
		<div className="space-y-2">
			{course.paymentRequired ? (
				<>
					<UnlockButton courseId={course.id} price={price} className="h-12 w-full text-base" />
					<Button asChild variant="outline" size="lg" className="w-full">
						<Link to={learn}>{t('courses.freeLessonsOpen')}</Link>
					</Button>
				</>
			) : (
				<Button asChild size="lg" className="w-full">
					<Link to={learn}>
						{started ? t('courses.continueLearning') : t('courses.startLearning')}
					</Link>
				</Button>
			)}
		</div>
	) : canEnroll ? (
		<EnrollButton
			courseId={course.id}
			free={isFree}
			onEnrolled={() => {
				reload();
				void navigate(learn);
			}}
			className="h-12 w-full text-base"
		/>
	) : (
		<p className="text-sm text-muted-foreground">{t('courses.cannotEnroll')}</p>
	);

	const tabKeys: ('overview' | 'content' | 'exams')[] = [
		'overview',
		'content',
		...(course.exams.length > 0 ? (['exams'] as const) : []),
	];
	const lessonCount = (n: number) => t('courses.lessonCount', { count: n });

	return (
		<div className="w-full max-w-7xl self-start px-1 py-6">
			<nav aria-label={t('courses.breadcrumb')} className="mb-6 text-sm text-muted-foreground">
				<Link to={paths.home} className="hover:text-primary hover:underline">
					{t('nav.home')}
				</Link>
				<span aria-hidden> / </span>
				<Link to={paths.courses} className="hover:text-primary hover:underline">
					{t('courses.title')}
				</Link>
				<span aria-hidden> / </span>
				<span className="text-foreground">{l(course, 'title')}</span>
			</nav>

			<div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
				<div className="min-w-0">
					<Badge variant="secondary" className="bg-card text-primary">
						{isFree ? t('courses.free') : t('courses.paidTag')}
					</Badge>
					<h1 className="mt-4 text-3xl font-extrabold text-primary-dark md:text-4xl">
						{l(course, 'title')}
					</h1>
					{l(course, 'description') && (
						<p className="mt-4 max-w-2xl text-lg leading-8 text-foreground/80">
							{l(course, 'description')}
						</p>
					)}
					{/* Public intro video: plays for everyone, no enrollment needed. */}
					{course.introVideoUrl && (
						<section aria-label={t('courses.introVideo')} className="mt-6 max-w-3xl">
							<VideoPlayer
								source={{ url: course.introVideoUrl, kind: 'file', expiresAt: null }}
								poster={course.thumbnailUrl ?? undefined}
							/>
						</section>
					)}
					<p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-foreground/80">
						{lessons.length > 0 && <span>{lessonCount(lessons.length)}</span>}
						{duration && <span>{duration}</span>}
						{course.exams.length > 0 && (
							<span>{t('courses.examCount', { count: course.exams.length })}</span>
						)}
					</p>

					{isLearner && lessons.length > 0 && (
						<div className="mt-5 max-w-md">
							<ProgressBar
								value={completed / lessons.length}
								label={t('courses.progress', { done: completed, total: lessons.length })}
							/>
						</div>
					)}

					<Tabs value={tab} onValueChange={setTab} className="mt-8 gap-0">
						<TabsList variant="line" className="h-auto w-full justify-start gap-6 border-b p-0">
							{tabKeys.map((key) => (
								<TabsTrigger
									key={key}
									value={key}
									className="h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-1 pb-3 text-base text-muted-foreground data-active:border-brand-secondary data-active:font-bold data-active:text-primary-dark">
									{t(`courses.tabs.${key}`)}
								</TabsTrigger>
							))}
						</TabsList>

						{/* Overview: about + the outline, one row per section */}
						<TabsContent value="overview" className="pt-6">
							<h2 className="mb-4 text-xl font-bold text-primary-dark">
								{t('courses.curriculum')}
							</h2>
							{course.sections.length === 0 ? (
								<p className="text-sm text-muted-foreground">{t('courses.noSections')}</p>
							) : (
								<Card className="gap-0 rounded-2xl py-2">
									<ul className="divide-y px-5">
										{course.sections.map((section, i) => (
											<li key={section.id}>
												<button
													type="button"
													onClick={() => setTab('content')}
													className="flex w-full items-center justify-between gap-4 py-4 text-start transition hover:text-primary">
													<span className="font-medium">
														{String(i + 1).padStart(2, '0')} · {l(section, 'title')}
													</span>
													<span className="flex shrink-0 items-center gap-1 text-sm font-bold">
														{lessonCount(section.lessons.length)}
														<ChevronDown className="size-4" aria-hidden />
													</span>
												</button>
											</li>
										))}
									</ul>
								</Card>
							)}
						</TabsContent>

						{/* Content: every lesson of every section */}
						<TabsContent value="content" className="space-y-4 pt-6">
							{course.sections.length === 0 && (
								<p className="text-sm text-muted-foreground">{t('courses.noSections')}</p>
							)}
							{course.sections.map((section, i) => (
								<Card key={section.id} className="gap-0 rounded-2xl py-0">
									<h2 className="border-b bg-sand px-5 py-3 font-bold text-primary-dark">
										{String(i + 1).padStart(2, '0')} · {l(section, 'title')}
									</h2>
									<ul className="divide-y px-5">
										{section.lessons.map((lesson) => (
											<li
												key={lesson.id}
												className="flex items-center justify-between gap-3 py-3 text-sm">
												<span>{l(lesson, 'title')}</span>
												<span className="flex shrink-0 items-center gap-2 text-muted-foreground">
													{!isFree && lesson.isPreview && (
														<Badge variant="secondary" className="bg-sand text-primary">
															{t('courses.preview')}
														</Badge>
													)}
													{formatDuration(lesson.durationSec)}
												</span>
											</li>
										))}
									</ul>
								</Card>
							))}
						</TabsContent>

						{course.exams.length > 0 && (
							<TabsContent value="exams" className="pt-6">
								<ExamList exams={course.exams} />
							</TabsContent>
						)}
					</Tabs>
				</div>

				{/* Side card */}
				<aside className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
					<h2 className="mb-4 text-xl font-bold text-primary-dark">{t('courses.startJourney')}</h2>
					<img
						src={course.thumbnailUrl ?? `/assets/img/${photo}.webp`}
						alt=""
						className="aspect-video w-full rounded-xl border-b-4 border-brand-secondary object-cover"
					/>
					<p className="mt-5 mb-4 text-3xl font-extrabold text-primary-dark">
						{isFree ? t('courses.free') : price}
					</p>
					{action}
					<dl className="mt-5 space-y-2 border-t-2 border-primary-dark/80 pt-4 text-sm text-foreground/80">
						<div className="flex items-center gap-2">
							<BookOpen className="size-4 text-primary" aria-hidden />
							<dt>{t('courses.facts.lessons')}:</dt>
							<dd>{lessons.length}</dd>
						</div>
						{duration && (
							<div className="flex items-center gap-2">
								<Clock className="size-4 text-primary" aria-hidden />
								<dt>{t('courses.facts.duration')}:</dt>
								<dd>{duration}</dd>
							</div>
						)}
						{course.exams.length > 0 && (
							<div className="flex items-center gap-2">
								<ClipboardCheck className="size-4 text-primary" aria-hidden />
								<dt>{t('courses.facts.exams')}:</dt>
								<dd>{course.exams.length}</dd>
							</div>
						)}
					</dl>
				</aside>
			</div>
		</div>
	);
}
