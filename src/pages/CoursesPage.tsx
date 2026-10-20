import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAllCourses } from '../api/courses';
import { listMyEnrollments } from '../api/enrollments';
import { Permission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { ErrorBanner } from '../components/common/ErrorBanner';
import CourseCard from '../components/courses/CourseCard';
import { CourseGridSkeleton } from '../components/feedback/skeletons';
import { Stagger, StaggerItem } from '../components/motion/motion';
import { useApiQuery } from '../hooks/useApiQuery';

const PAGE_SIZE = 12;
// The catalogue is loaded once and reused for a minute; switching tabs and
// pages below never calls the server.
const FRESH_MS = 60_000;

type Scope = 'all' | 'enrolled' | 'authored';

export default function CoursesPage() {
	const { t } = useTranslation();
	const { hasPermission } = useAuth();
	const canEnroll = hasPermission(Permission.ENROLLMENTS_CREATE);
	const canCreate = hasPermission(Permission.COURSES_CREATE);

	const [scope, setScope] = useState<Scope>('all');
	const [page, setPage] = useState(1);
	// The search text lives in the URL (?q=) so a result list can be shared.
	const [params, setParams] = useSearchParams();
	const q = params.get('q') ?? '';
	const setQuery = (value: string) => {
		setPage(1);
		setParams(value ? { q: value } : {}, { replace: true });
	};

	// One call for the whole published catalogue; "All" and "Enrolled" are
	// filters over it.
	const published = useApiQuery((signal) => fetchAllCourses({}, signal), 'courses:published', {
		staleMs: FRESH_MS,
	});
	// The learner's enrollments (marks cards, powers the "Enrolled" filter).
	const enrollments = useApiQuery((signal) => listMyEnrollments(signal), 'enrollments:me', {
		staleMs: FRESH_MS,
		enabled: canEnroll,
	});
	// Courses the user wrote (drafts included): only fetched when that tab opens.
	const authored = useApiQuery(
		(signal) => fetchAllCourses({ mine: true }, signal),
		'courses:authored',
		{ staleMs: FRESH_MS, enabled: canCreate && scope === 'authored' }
	);

	const enrolledIds = new Set(enrollments.data?.map((e) => e.courseId));
	const source = scope === 'authored' ? authored : published;
	const waitingForEnrollments = scope === 'enrolled' && canEnroll && enrollments.loading;
	const loading = source.loading || waitingForEnrollments;

	const needle = q.trim().toLowerCase();
	const inScope =
		scope === 'enrolled'
			? (published.data ?? []).filter((c) => enrolledIds.has(c.id))
			: (source.data ?? []);
	const items = needle
		? inScope.filter((c) => `${c.title} ${c.description ?? ''}`.toLowerCase().includes(needle))
		: inScope;
	const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
	const current = Math.min(page, totalPages);
	const visible = items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

	const scopes: Scope[] = [
		'all',
		...(canEnroll ? (['enrolled'] as const) : []),
		...(canCreate ? (['authored'] as const) : []),
	];
	const label: Record<Scope, string> = {
		all: t('courses.all'),
		enrolled: t('courses.enrolled'),
		authored: t('courses.mine'),
	};
	const emptyText = needle
		? t('courses.noResults')
		: scope === 'enrolled'
			? t('courses.emptyEnrolled')
			: scope === 'authored'
				? t('courses.emptyAuthored')
				: t('courses.empty');

	return (
		<section className="w-full max-w-7xl self-start px-1 py-6">
			<header className="mb-8">
				<p className="mb-2 text-sm font-medium text-gold-ink">{t('courses.eyebrow')}</p>
				<h1 className="text-3xl font-extrabold text-primary-dark md:text-4xl">
					{t('courses.title')}
				</h1>
				<p className="mt-3 text-muted-foreground">{t('courses.subtitle')}</p>
			</header>

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<div className="flex min-w-64 flex-1 items-center gap-2 rounded-xl border bg-card px-3 shadow-xs">
					<Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
					<input
						type="search"
						value={q}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={t('courses.searchPlaceholder')}
						aria-label={t('courses.searchPlaceholder')}
						className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
					/>
				</div>
				{scopes.length > 1 && (
					<Tabs
						value={scope}
						onValueChange={(v) => {
							setScope(v as Scope);
							setPage(1);
						}}>
						<TabsList>
							{scopes.map((s) => (
								<TabsTrigger key={s} value={s}>
									{label[s]}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				)}
			</div>
			{!loading && source.data !== undefined && (
				<p className="mb-5 flex items-center gap-3 text-sm text-muted-foreground" aria-live="polite">
					{t('courses.resultCount', { count: items.length })}
					{needle && (
						<Button type="button" variant="outline" size="xs" onClick={() => setQuery('')}>
							{t('courses.clearSearch')}
						</Button>
					)}
				</p>
			)}

			{loading && <CourseGridSkeleton />}
			{source.error != null && source.data === undefined && (
				<ErrorBanner message={t('courses.loadError')} />
			)}
			{!loading && source.data !== undefined && items.length === 0 && (
				<p className="rounded-xl border border-dashed bg-card p-8 text-center text-muted-foreground">{emptyText}</p>
			)}

			{!loading && visible.length > 0 && (
				<>
					<Stagger
						as="ul"
						key={`${scope}:${current}`}
						className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{visible.map((course) => (
							<StaggerItem as="li" key={course.id} className="flex">
								<CourseCard course={course} enrolled={enrolledIds.has(course.id)} />
							</StaggerItem>
						))}
					</Stagger>

					{totalPages > 1 && (
						<nav
							className="mt-6 flex items-center justify-center gap-3"
							aria-label={t('courses.pagination')}>
							<Button
								type="button"
								disabled={current <= 1}
								onClick={() => setPage(current - 1)}
								variant="outline"
								size="sm">
								{t('courses.prev')}
							</Button>
							<span className="text-sm text-muted-foreground">
								{current} / {totalPages}
							</span>
							<Button
								type="button"
								disabled={current >= totalPages}
								onClick={() => setPage(current + 1)}
								variant="outline"
								size="sm">
								{t('courses.next')}
							</Button>
						</nav>
					)}
				</>
			)}
		</section>
	);
}
