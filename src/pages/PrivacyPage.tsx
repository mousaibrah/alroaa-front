import { Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import HeroSmall from '../components/site/HeroSmall';
import { CONTACT } from '../data/site';
import { usePageTitle } from '../hooks/usePageTitle';
import { paths } from '../routes/paths';

// Change this whenever the policy text changes.
const UPDATED = '2026-10-26';

interface PolicySection {
	id: string;
	title: string;
	intro?: string;
	items?: string[];
	outro?: string;
}

export default function PrivacyPage() {
	const { t, i18n } = useTranslation();
	usePageTitle(t('site.privacy.title'));

	const sections = t('site.privacy.sections', { returnObjects: true }) as PolicySection[];
	const updated = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'long' }).format(
		new Date(`${UPDATED}T00:00:00`)
	);

	return (
		<>
			<HeroSmall title={t('site.privacy.title')} sub={t('site.privacy.sub')} />

			<section className="py-16">
				<div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[16rem_1fr]">
					{/* Table of contents: sticks beside the text on large screens */}
					<nav aria-label={t('site.privacy.toc')} className="hidden lg:block">
						<div className="sticky top-28 rounded-2xl border border-brand-100 bg-card p-5">
							<div className="mb-3 text-sm font-bold text-primary-dark">{t('site.privacy.toc')}</div>
							<ol className="space-y-2 text-sm">
								{sections.map((s) => (
									<li key={s.id}>
										<a
											href={`#${s.id}`}
											className="text-muted-foreground transition hover:text-primary">
											{s.title}
										</a>
									</li>
								))}
							</ol>
						</div>
					</nav>

					<article className="min-w-0 max-w-3xl">
						<p className="mb-4 text-sm font-semibold text-primary-light">
							{t('site.privacy.updated', { date: updated })}
						</p>
						<p className="mb-10 leading-9 text-muted-foreground">{t('site.privacy.intro')}</p>

						<div className="space-y-10">
							{sections.map((s) => (
								<section key={s.id} id={s.id} className="scroll-mt-28">
									<h2 className="mb-4 flex items-center gap-3 text-2xl font-extrabold text-primary-dark">
										<span className="h-6 w-1 shrink-0 rounded-full bg-brand-secondary" />
										{s.title}
									</h2>
									{s.intro && <p className="leading-9 text-muted-foreground">{s.intro}</p>}
									{s.items && (
										<ul className="mt-3 list-disc space-y-2 ps-6 leading-8 text-muted-foreground marker:text-brand-secondary">
											{s.items.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									)}
									{s.outro && <p className="mt-4 leading-9 text-muted-foreground">{s.outro}</p>}
								</section>
							))}
						</div>

						<section
							id="contact"
							className="mt-14 scroll-mt-28 rounded-3xl border border-brand-100 bg-sand p-6 sm:p-8">
							<h2 className="mb-3 text-2xl font-extrabold text-primary-dark">
								{t('site.privacy.contactTitle')}
							</h2>
							<p className="mb-5 leading-8 text-muted-foreground">{t('site.privacy.contactText')}</p>
							<ul className="space-y-2 font-bold text-primary-dark">
								<li className="flex items-center gap-2">
									<Mail className="size-4 text-primary" aria-hidden />
									<a href={`mailto:${CONTACT.email}`} className="hover:text-primary hover:underline">
										{CONTACT.email}
									</a>
								</li>
								{CONTACT.phones.map((phone) => (
									<li key={phone} className="flex items-center gap-2">
										<Phone className="size-4 text-primary" aria-hidden />
										<a dir="ltr" href={`tel:+${phone}`} className="hover:text-primary hover:underline">
											+{phone}
										</a>
									</li>
								))}
							</ul>
							<Link
								to={paths.contact}
								className="mt-5 inline-block font-semibold text-primary hover:underline">
								{t('site.privacy.contactLink')}
							</Link>
						</section>
					</article>
				</div>
			</section>
		</>
	);
}
