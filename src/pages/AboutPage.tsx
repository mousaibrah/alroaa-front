import { useTranslation } from 'react-i18next';
import Cta from '../components/site/Cta';
import HeroSmall from '../components/site/HeroSmall';
import { GOALS } from '../data/site';
import { usePageTitle } from '../hooks/usePageTitle';

// Photo and key of the mission and vision cards.
const CARDS = [
	{ key: 'mission', img: 'tech' },
	{ key: 'vision', img: 'vision' },
] as const;

export default function AboutPage() {
	const { t } = useTranslation();
	usePageTitle(t('site.about.title'));

	return (
		<>
			<HeroSmall title={t('site.about.title')} sub={t('site.about.sub')} />

			<section className="py-24">
				<div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2">
					<div className="reveal">
						<h2 className="mb-6 text-3xl font-extrabold text-primary-dark">
							{t('site.about.whoTitle')}
						</h2>
						<p className="mb-4 leading-9 text-muted-foreground">{t('site.about.p1')}</p>
						<p className="mb-4 leading-9 text-muted-foreground">{t('site.about.p2')}</p>
						<p className="leading-9 text-muted-foreground">{t('site.about.p3')}</p>
					</div>
					<img
						src="/assets/img/park.webp"
						alt=""
						className="reveal w-full rounded-3xl shadow-2xl"
						loading="lazy"
					/>
				</div>
			</section>

			<section className="bg-sand py-20">
				<div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-2">
					{CARDS.map((c) => (
						<div key={c.key} className="reveal lift overflow-hidden rounded-3xl bg-card">
							<img
								src={`/assets/img/${c.img}.webp`}
								alt=""
								className="h-56 w-full object-cover"
								loading="lazy"
							/>
							<div className="p-8">
								<h3 className="mb-3 text-2xl font-extrabold text-primary-dark">
									{t(`site.about.${c.key}.title`)}
								</h3>
								<p className="leading-8 text-muted-foreground">{t(`site.about.${c.key}.text`)}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="py-24">
				<div className="mx-auto max-w-7xl px-5">
					<h2 className="reveal mb-12 text-center text-3xl font-extrabold text-primary-dark">
						{t('site.about.goalsTitle')}
					</h2>
					<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
						{GOALS.map((g, i) => (
							<div key={g} className="reveal flex gap-4 rounded-2xl bg-brand-50 p-6">
								<span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
									{i + 1}
								</span>
								<p className="leading-8 text-foreground">{t(`site.goals.${g}`)}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<Cta />
		</>
	);
}
