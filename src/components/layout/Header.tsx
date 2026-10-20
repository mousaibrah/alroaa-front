import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, matchPath, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { useAuth } from '../../auth/useAuth';
import { languageNames, supportedLanguages, type Language } from '../../i18n';
import { toast } from 'sonner';

// Pages that need an account: after logging out of one of these the user goes
// home. Any other page is public, so they simply stay on it.
const protectedPatterns = [
	paths.profile,
	paths.legacyDashboard,
	'/courses/:id/learn',
	'/attempts/:attemptId',
	'/checkout/:paymentId',
	`${paths.admin}/*`,
];

const links = [
	{ to: paths.courses, label: 'nav.courses', end: false },
	{ to: paths.services, label: 'nav.services', end: false },
	{ to: paths.clients, label: 'nav.clients', end: false },
	{ to: paths.about, label: 'nav.about', end: false },
	{ to: paths.contact, label: 'nav.contact', end: false },
] as const;

const SCROLLED_AFTER_PX = 40;

// Site header: white bar with the logo, the main links, the language switch and
// the account buttons. It gets a soft shadow once the page is scrolled (or on app pages).
export default function Header({ solid }: { solid: boolean }) {
	const { t, i18n } = useTranslation();
	const { isAuthenticated, user, role, logout } = useAuth();
	const location = useLocation();
	const { pathname } = location;
	const navigate = useNavigate();
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const [menuPath, setMenuPath] = useState(pathname);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > SCROLLED_AFTER_PX);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// The mobile menu closes when the page changes.
	if (menuPath !== pathname) {
		setMenuPath(pathname);
		setOpen(false);
	}

	const current = (i18n.resolvedLanguage ?? 'ar') as Language;
	const other = supportedLanguages.find((l) => l !== current) ?? 'en';

	const handleLogout = () => {
		setOpen(false);
		logout();
		toast.success(t('toast.loggedOut'));
		if (protectedPatterns.some((pattern) => matchPath(pattern, pathname))) {
			navigate(paths.home, { replace: true });
		}
	};

	// Come back to this page after signing in; on the auth pages themselves keep
	// the destination they already carry.
	const onAuthPage = pathname === paths.login || pathname === paths.register;
	const authState = onAuthPage ? location.state : { from: location };

	const accountLinks = isAuthenticated ? (
		<>
			{role === 'admin' && (
				<NavLink
					to={paths.admin}
					className={({ isActive }) => cn('site-nav-link', isActive && 'is-active')}>
					{t('nav.admin')}
				</NavLink>
			)}
			<NavLink
				to={paths.profile}
				className={({ isActive }) => cn('site-nav-link', isActive && 'is-active')}>
				{user?.firstName ?? t('nav.profile')}
			</NavLink>
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={handleLogout}
				aria-label={t('nav.logout')}
				title={t('nav.logout')}>
				<LogOut className="size-4" />
			</Button>
		</>
	) : (
		<>
			<Button asChild variant="outline">
				<Link to={paths.login} state={authState}>
					{t('nav.login')}
				</Link>
			</Button>
			<Button asChild>
				<Link to={paths.register} state={authState}>
					{t('nav.register')}
				</Link>
			</Button>
		</>
	);

	return (
		<header
			className={cn(
				'site-header fixed inset-x-0 top-0 z-50 transition-all',
				(solid || scrolled || open) && 'is-solid'
			)}>
			<div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5">
				<Link to={paths.home} className="flex items-center gap-3">
					<img src="/assets/img/logo-mark.png" alt="" className="size-11" />
					<span className="leading-tight">
						<b className="block text-lg font-extrabold text-primary">{t('common.appName')}</b>
						<small className="text-xs text-muted-foreground">{t('common.appTagline')}</small>
					</span>
				</Link>

				<nav className="hidden items-center gap-1 xl:flex" aria-label={t('nav.main')}>
					{links.map((l) => (
						<NavLink
							key={l.to}
							to={l.to}
							end={l.end}
							className={({ isActive }) => cn('site-nav-link', isActive && 'is-active')}>
							{t(l.label)}
						</NavLink>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<div className="hidden items-center gap-2 xl:flex">{accountLinks}</div>
					<button
						type="button"
						onClick={() => void i18n.changeLanguage(other)}
						aria-label={t('common.language')}
						className="rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-sand hover:text-primary">
						{languageNames[other]}
					</button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="xl:hidden"
						aria-label={t('common.toggleMenu')}
						aria-expanded={open}
						aria-controls="mobile-menu"
						onClick={() => setOpen((o) => !o)}>
						{open ? <X className="size-7" /> : <Menu className="size-7" />}
					</Button>
				</div>
			</div>

			{open && (
				<div id="mobile-menu" className="border-t bg-background px-5 pb-5 xl:hidden">
					{links.map((l) => (
						<Link key={l.to} to={l.to} className="block border-b py-3 text-foreground">
							{t(l.label)}
						</Link>
					))}
					<div className="flex flex-wrap items-center gap-3 pt-4">{accountLinks}</div>
				</div>
			)}
		</header>
	);
}
