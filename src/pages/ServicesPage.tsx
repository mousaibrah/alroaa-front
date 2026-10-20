import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import Cta from '../components/site/Cta';
import HeroSmall from '../components/site/HeroSmall';
import { SERVICES } from '../data/site';
import { usePageTitle } from '../hooks/usePageTitle';

export default function ServicesPage() {
	const { t, i18n } = useTranslation();
	usePageTitle(t('site.services.title'));
	const arrow = i18n.dir() === 'rtl' ? '←' : '→';

	return (
		<>
			<HeroSmall title={t('site.services.title')} sub={t('site.services.sub')} img="tech" />

			<section className="py-24">
				<div className="mx-auto max-w-7xl space-y-20 px-5">
					{SERVICES.map((s, i) => (
						<article
							key={s.id}
							id={s.id}
							className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2">
							<div className={cn('reveal', i % 2 && 'lg:order-2')}>
								<img
									src={`/assets/img/${s.photo}.webp`}
									alt={t(`site.services.items.${s.id}.title`)}
									className="aspect-video w-full rounded-3xl object-cover shadow-xl"
									loading="lazy"
								/>
							</div>
							<div className="reveal">
								<div className="mb-4 flex items-center gap-4">
									<img src={`/assets/img/svc-${s.id}.svg`} alt="" className="size-16" />
									<span className="text-6xl font-extrabold text-brand-100">
										{String(i + 1).padStart(2, '0')}
									</span>
								</div>
								<h2 className="mb-3 text-2xl font-extrabold text-primary-dark md:text-3xl">
									{t(`site.services.items.${s.id}.title`)}
								</h2>
								<p className="text-lg leading-9 text-muted-foreground">
									{t(`site.services.items.${s.id}.text`)}
								</p>
								<Link
									to={paths.contact}
									className="mt-6 inline-block font-bold text-primary hover:text-brand-secondary">
									{t('site.services.request')} {arrow}
								</Link>
							</div>
						</article>
					))}
				</div>
			</section>

			<Cta />
		</>
	);
}
