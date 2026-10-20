import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { paths } from '@/routes/paths';
import ClientLogo from '../components/site/ClientLogo';
import Cta from '../components/site/Cta';
import CourseCard from '../components/courses/CourseCard';
import { CourseGridSkeleton } from '../components/feedback/skeletons';
import { listCourses } from '../api/courses';
import { CLIENTS, SERVICES, VALUES } from '../data/site';
import { useApiQuery } from '../hooks/useApiQuery';
import { usePageTitle } from '../hooks/usePageTitle';

// How many of the newest published programs the home page shows.
const HOME_COURSES = 6;

export default function HomePage() {
	const { t, i18n } = useTranslation();
	usePageTitle(t('site.home.title'));
	const navigate = useNavigate();
	// Newest published programs; guests can read them too.
	const courses = useApiQuery(
		(signal) => listCourses({ page: 1, limit: HOME_COURSES }, signal),
		`courses:home:${HOME_COURSES}`,
		{ staleMs: 60_000 }
	);
	const [query, setQuery] = useState('');
	const Arrow = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight;

	const search = (e: FormEvent) => {
		e.preventDefault();
		const q = query.trim();
		navigate(q ? `${paths.courses}?q=${encodeURIComponent(q)}` : paths.courses);
	};

	return (
		<>
			{/* Hero + search + fields */}
			<section className="bg-sand pt-28 pb-16">
				<div className="mx-auto max-w-7xl space-y-8 px-5">
					<div className="reveal grid overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-2">
						<div className="flex flex-col justify-center bg-brand-50 p-8 md:p-12">
							<p className="mb-3 text-sm font-medium text-gold-ink">{t('site.home.hero.eyebrow')}</p>
							<h1 className="text-4xl leading-tight font-extrabold text-primary-dark md:text-5xl">
								{t('site.home.hero.title')}
							</h1>
							<p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
								{t('site.home.hero.text')}
							</p>
							<div className="mt-8 flex flex-wrap gap-3">
								<Button asChild size="lg">
									<Link to={paths.courses}>{t('site.home.hero.programs')}</Link>
								</Button>
								<Button asChild variant="outline" size="lg">
									<Link to={paths.contact}>{t('site.home.hero.companies')}</Link>
								</Button>
							</div>
						</div>
						<img
							src="/assets/img/hero.webp"
							alt=""
							className="h-64 w-full object-cover lg:h-full lg:min-h-96"
						/>
					</div>

					<form
						onSubmit={search}
						role="search"
						className="reveal flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-xs">
						<Search className="ms-3 size-5 shrink-0 text-muted-foreground" aria-hidden />
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={t('site.home.search.placeholder')}
							aria-label={t('site.home.search.placeholder')}
							className="h-11 min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground"
						/>
						<Button type="submit" size="lg">
							{t('site.home.search.button')}
						</Button>
					</form>

					{/* Latest programs: real courses from the API; the section stays hidden
					    when there are none (or the server is unreachable) */}
					{(courses.loading || (courses.data?.items.length ?? 0) > 0) && (
						<>
							<div className="reveal flex items-end justify-between gap-4 pt-4">
								<h2 className="text-2xl font-extrabold text-primary-dark md:text-3xl">
									{t('site.home.programs.title')}
								</h2>
								<Link
									to={paths.courses}
									className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
									{t('site.home.fields.all')}
									<Arrow className="size-4" aria-hidden />
								</Link>
							</div>
							{courses.data ? (
								<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
									{courses.data.items.map((course) => (
										<li key={course.id} className="flex">
											<CourseCard course={course} />
										</li>
									))}
								</ul>
							) : (
								<CourseGridSkeleton count={HOME_COURSES} />
							)}
						</>
					)}
				</div>
			</section>

			{/* For companies (the services) */}
			<section className="py-24">
				<div className="mx-auto max-w-7xl px-5">
					<div className="reveal mx-auto mb-14 max-w-2xl text-center">
						<p className="text-sm font-medium text-gold-ink">{t('site.home.services.eyebrow')}</p>
						<h2 className="mt-2 text-3xl font-extrabold text-primary-dark md:text-4xl">
							{t('site.home.services.title')}
						</h2>
					</div>
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{SERVICES.map((s) => (
							<Link
								key={s.id}
								to={paths.service(s.id)}
								className="reveal lift block rounded-2xl border bg-card p-6">
								<img
									src={`/assets/img/svc-${s.id}.svg`}
									alt=""
									className="mb-4 size-14"
									loading="lazy"
								/>
								<h3 className="mb-2 font-bold text-primary-dark">
									{t(`site.services.items.${s.id}.title`)}
								</h3>
								<p className="text-sm leading-7 text-muted-foreground">
									{t(`site.services.items.${s.id}.text`)}
								</p>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Why us */}
			<section className="bg-ivory py-24">
				<div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2">
					<img
						src="/assets/img/about.webp"
						alt=""
						className="reveal w-full rounded-3xl shadow-xl"
						loading="lazy"
					/>
					<div className="reveal">
						<p className="text-sm font-medium text-gold-ink">{t('site.home.why.eyebrow')}</p>
						<h2 className="mt-2 mb-6 text-3xl font-extrabold text-primary-dark md:text-4xl">
							{t('site.home.why.title')}
						</h2>
						<p className="mb-8 leading-8 text-muted-foreground">{t('site.home.why.text')}</p>
						<div className="grid gap-4 sm:grid-cols-2">
							{VALUES.map((v) => (
								<div
									key={v}
									className="rounded-e-xl border-s-4 border-brand-secondary bg-card p-4">
									<h4 className="font-bold text-primary-dark">{t(`site.values.${v}.title`)}</h4>
									<p className="mt-1 text-sm leading-7 text-muted-foreground">
										{t(`site.values.${v}.text`)}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Partners */}
			<section className="bg-sand py-20">
				<div className="mx-auto max-w-7xl px-5">
					<h2 className="reveal mb-12 text-center text-3xl font-extrabold text-primary-dark">
						{t('site.home.partners.title')}
					</h2>
					<div className="grid grid-cols-2 items-center gap-5 md:grid-cols-4">
						{CLIENTS.map((c) => (
							<div
								key={c.id}
								className="reveal grid h-32 place-items-center rounded-2xl border bg-card p-5">
								<ClientLogo
									id={c.id}
									logo={c.logo}
									className="logo-grey max-h-20 w-auto object-contain"
								/>
							</div>
						))}
					</div>
				</div>
			</section>

			<Cta />
		</>
	);
}
