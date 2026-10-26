import { ArrowLeft, ArrowRight, Award, LayoutDashboard, LibraryBig, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { listMyCertificates } from '../api/certificates';
import { listMyEnrollments } from '../api/enrollments';
import { Permission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { ErrorBanner } from '../components/common/ErrorBanner';
import EmailForm from '../components/profile/EmailForm';
import PasswordForm from '../components/profile/PasswordForm';
import ProfileDetailsForm from '../components/profile/ProfileDetailsForm';
import { Skeleton } from '../components/feedback/Skeleton';
import { useApiQuery } from '../hooks/useApiQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLocalize } from '../hooks/useLocalize';
import { firstName, fullName } from '../utils/localized';
import { formatPhone } from '../utils/phone';

const PHOTOS = ['records', 'audit', 'mgmt', 'park', 'tests', 'rehab'] as const;

// Learner dashboard: who you are, how many programs are running or done,
// where to continue, and the list of your programs.
export default function ProfilePage() {
	const { t, i18n } = useTranslation();
	const { l } = useLocalize();
	usePageTitle(t('profile.title'));
	const { user, role, permissions, hasPermission } = useAuth();
	const canEnroll = hasPermission(Permission.ENROLLMENTS_CREATE);
	const Arrow = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight;

	// Shared with the programs page, so opening the dashboard costs no extra request.
	const enrollments = useApiQuery((signal) => listMyEnrollments(signal), 'enrollments:me', {
		staleMs: 60_000,
		enabled: canEnroll,
	});

	const certificates = useApiQuery((signal) => listMyCertificates(signal), 'certificates:me', {
		staleMs: 60_000,
		enabled: canEnroll,
	});

	const name = user ? fullName(user) : '';
	const initial = (name || '?').charAt(0).toUpperCase();
	const list = enrollments.data ?? [];
	const active = list.filter((e) => e.status === 'active');
	const completed = list.filter((e) => e.status === 'completed');
	const next = active[0];

	// dob is a plain YYYY-MM-DD date: format it at UTC so it never shifts a day.
	const formatDate = (value: string, utc = false) =>
		new Intl.DateTimeFormat(i18n.language, {
			dateStyle: 'long',
			timeZone: utc ? 'UTC' : undefined,
		}).format(new Date(value));
	const notSet = <span className="text-muted-foreground">{t('profile.notSet')}</span>;

	const formatPermission = (str: string) =>
		str
			.split('.')
			.reverse()
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

	const sideLink = (to: string, label: string, icon: React.ReactNode, current = false) => (
		<Link
			to={to}
			aria-current={current ? 'page' : undefined}
			className={cn(
				'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
				current
					? 'border-s-4 border-brand-secondary bg-sand font-bold text-primary-dark'
					: 'text-muted-foreground hover:bg-sand hover:text-primary'
			)}>
			{icon}
			{label}
		</Link>
	);

	return (
		<div className="grid w-full max-w-7xl gap-6 self-start px-1 py-6 lg:grid-cols-[16rem_1fr]">
			{/* Side panel */}
			<aside className="h-fit rounded-2xl border bg-card p-5">
				<div className="flex flex-col items-center gap-2 border-b pb-5 text-center">
					{user?.image ? (
						<img
							src={user.image}
							alt={t('profile.image')}
							className="size-20 rounded-full border-2 border-sand object-cover"
						/>
					) : (
						<span
							aria-hidden
							className="grid size-20 place-items-center rounded-full bg-sand text-2xl font-bold text-primary">
							{initial}
						</span>
					)}
					<p className="text-lg font-bold text-primary-dark">{name}</p>
					<p dir="ltr" className="max-w-full truncate text-sm text-muted-foreground">
						{user?.email}
					</p>
					<Badge variant="secondary" className="bg-sand text-primary">
						{role && t(`roles.${role}` as never, { defaultValue: role })}
					</Badge>
				</div>
				<nav className="mt-4 space-y-1" aria-label={t('profile.menu')}>
					{sideLink(
						paths.profile,
						t('profile.dashboard'),
						<LayoutDashboard className="size-4" />,
						true
					)}
					{sideLink(paths.courses, t('profile.myCourses'), <LibraryBig className="size-4" />)}
					{role === 'admin' &&
						sideLink(paths.admin, t('nav.admin'), <Settings2 className="size-4" />)}
				</nav>
			</aside>

			<div className="min-w-0 space-y-6">
				<header>
					<p className="mb-2 text-sm font-medium text-gold-ink">{t('profile.eyebrow')}</p>
					<h1 className="text-3xl font-extrabold text-primary-dark md:text-4xl">
						{t('profile.welcome', { name: user ? firstName(user) : undefined })}
					</h1>
				</header>

				{canEnroll && (
					<>
						<div className="grid gap-4 sm:grid-cols-2">
							<Card className="gap-1">
								<CardContent>
									<p className="text-sm text-muted-foreground">{t('profile.stats.active')}</p>
									<p className="my-1 text-4xl font-extrabold text-primary-dark">{active.length}</p>
									<p className="text-xs text-muted-foreground">{t('profile.stats.activeHint')}</p>
								</CardContent>
							</Card>
							<Card className="gap-1">
								<CardContent>
									<p className="text-sm text-muted-foreground">{t('profile.stats.completed')}</p>
									<p className="my-1 text-4xl font-extrabold text-primary-dark">
										{completed.length}
									</p>
									<p className="text-xs text-muted-foreground">
										{t('profile.stats.completedHint')}
									</p>
								</CardContent>
							</Card>
						</div>

						<div className="grid gap-6 xl:grid-cols-2">
							{/* Continue */}
							<Card>
								<CardContent className="space-y-4">
									<h2 className="text-xl font-bold text-primary-dark">
										{t('profile.continueTitle')}
									</h2>
									{next ? (
										<>
											<img
												src={`/assets/img/${PHOTOS[next.courseId % PHOTOS.length]}.webp`}
												alt=""
												className="aspect-video w-full rounded-xl border-b-4 border-brand-secondary object-cover"
											/>
											<p className="text-lg font-bold text-primary-dark">{l(next, 'courseTitle')}</p>
											<Button asChild>
												<Link to={paths.learn(next.courseId)}>{t('profile.continue')}</Link>
											</Button>
										</>
									) : (
										<div className="space-y-3">
											<p className="text-sm text-muted-foreground">{t('profile.noCourses')}</p>
											<Button asChild>
												<Link to={paths.courses}>{t('profile.browse')}</Link>
											</Button>
										</div>
									)}
								</CardContent>
							</Card>

							{/* My programs */}
							<Card>
								<CardContent className="space-y-4">
									<h2 className="text-xl font-bold text-primary-dark">{t('profile.myCourses')}</h2>
									{enrollments.data && list.length === 0 && (
										<p className="text-sm text-muted-foreground">{t('profile.noCourses')}</p>
									)}
									{list.length > 0 && (
										<ul className="divide-y">
											{list.map((e) => (
												<li
													key={e.id}
													className="flex flex-wrap items-center justify-between gap-3 py-3">
													<Link
														to={paths.course(e.courseId)}
														className="flex items-center gap-1 font-medium text-foreground hover:text-primary hover:underline">
														{l(e, 'courseTitle')}
														<Arrow className="size-3.5 text-muted-foreground" aria-hidden />
													</Link>
													<span className="flex items-center gap-2">
														{e.paymentRequired && (
															<Badge
																variant="secondary"
																className="bg-warning-soft text-warning-ink">
																{t('profile.paymentRequired')}
															</Badge>
														)}
														<Badge
															variant="secondary"
															className={
																e.status === 'completed'
																	? 'bg-success-soft text-success-ink'
																	: 'bg-info-soft text-info-ink'
															}>
															{e.status === 'completed'
																? t('profile.completed')
																: t('profile.active')}
														</Badge>
													</span>
												</li>
											))}
										</ul>
									)}
								</CardContent>
							</Card>
						</div>

						<Card>
							<CardContent className="space-y-4">
								<h2 className="text-xl font-bold text-primary-dark">{t('certificate.mine')}</h2>
								{certificates.loading && !certificates.data && (
									<div role="status" aria-label={t('certificate.checking')} className="space-y-3">
										<Skeleton className="h-12 w-full" />
										<Skeleton className="h-12 w-full" />
									</div>
								)}
								{certificates.error != null && !certificates.data && (
									<ErrorBanner message={t('certificate.listError')} />
								)}
								{certificates.data && certificates.data.length === 0 && (
									<p className="text-sm text-muted-foreground">{t('certificate.none')}</p>
								)}
								{certificates.data && certificates.data.length > 0 && (
									<ul className="divide-y">
										{certificates.data.map((c) => (
											<li
												key={c.code}
												className="flex flex-wrap items-center justify-between gap-3 py-3">
												<div className="flex min-w-0 items-start gap-3">
													<Award className="mt-0.5 size-5 shrink-0 text-gold-ink" aria-hidden />
													<div className="min-w-0">
														<p className="font-medium text-foreground">{l(c, 'courseTitle')}</p>
														<p className="text-xs text-muted-foreground">
															{new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
																new Date(c.issuedAt)
															)}
															{' · '}
															<bdi dir="ltr">{c.code}</bdi>
														</p>
													</div>
												</div>
												<Button asChild variant="outline" size="sm">
													<Link to={paths.verifyCode(c.code)}>{t('certificate.view')}</Link>
												</Button>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</Card>
					</>
				)}

				{/* Account */}
				<Card>
					<CardContent className="space-y-4">
						<h2 className="text-xl font-bold text-primary-dark">{t('profile.account')}</h2>
						<dl className="grid gap-4 text-sm sm:grid-cols-2">
							<div>
								<dt className="font-medium text-muted-foreground">{t('profile.name')}</dt>
								<dd className="text-foreground">{name}</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">{t('auth.email')}</dt>
								<dd dir="ltr" className="text-start text-foreground">
									{user?.email}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">{t('profile.phone')}</dt>
								<dd className="text-foreground">
									{user?.phoneNumber ? (
										<bdi dir="ltr">{formatPhone(user.countryCode, user.phoneNumber)}</bdi>
									) : (
										notSet
									)}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">{t('profile.gender')}</dt>
								<dd className="text-foreground">
									{user?.gender === 0
										? t('gender.male')
										: user?.gender === 1
											? t('gender.female')
											: notSet}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">{t('profile.dob')}</dt>
								<dd className="text-foreground">{user?.dob ? formatDate(user.dob, true) : notSet}</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">{t('profile.role')}</dt>
								<dd className="text-foreground">
									{role ? t(`roles.${role}` as never, { defaultValue: role }) : notSet}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">{t('profile.memberSince')}</dt>
								<dd className="text-foreground">
									{user?.createdAt ? formatDate(user.createdAt) : notSet}
								</dd>
							</div>
							<div className="sm:col-span-2">
								<dt className="font-medium text-muted-foreground">{t('profile.permissions')}</dt>
								<dd className="mt-1 flex flex-wrap gap-2">
									{permissions.map((p) => (
										<Badge key={p} variant="outline" dir="ltr" className="font-mono">
											{formatPermission(p)}
										</Badge>
									))}
								</dd>
							</div>
						</dl>
					</CardContent>
				</Card>

				{/* Settings: details and picture, then email and password (these two ask
				    for the current password) */}
				{user && (
					<section aria-labelledby="account-settings" className="space-y-6">
						<h2 id="account-settings" className="text-2xl font-extrabold text-primary-dark">
							{t('account.settingsTitle')}
						</h2>
						<ProfileDetailsForm user={user} />
						<div className="grid gap-6 xl:grid-cols-2">
							<EmailForm currentEmail={user.email} />
							<PasswordForm />
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
