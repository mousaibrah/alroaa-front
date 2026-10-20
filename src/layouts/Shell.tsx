import { m } from 'motion/react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { EASE } from '../components/motion/ease';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import WhatsAppButton from '../components/site/WhatsAppButton';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Header + page + footer, shared by every page.
// - site: the public pages. Full-width sections under the fixed white header.
// - app: platform pages (programs, admin, login...). Light green background,
//   content centred with a short fade on every page change.
export default function Shell({ variant }: { variant: 'site' | 'app' }) {
	const { pathname, hash } = useLocation();

	// Back to the top on a new page, or to the #anchor (e.g. /services#audit).
	useEffect(() => {
		if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
		else window.scrollTo({ top: 0, behavior: 'instant' });
	}, [pathname, hash]);

	useScrollReveal(pathname);

	return (
		<div className="flex min-h-screen flex-col">
			<Header solid={variant === 'app'} />
			<main className={cn('flex-1', variant === 'app' && 'flex bg-sand pt-20')}>
				{variant === 'app' ? (
					<m.div
						key={pathname}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.28, ease: EASE }}
						className="flex w-full items-center justify-center p-4">
						<Outlet />
					</m.div>
				) : (
					<div className="w-full">
						<Outlet />
					</div>
				)}
			</main>
			<Footer />
			<WhatsAppButton />
		</div>
	);
}
