import { useTranslation } from 'react-i18next';
import ClientLogo from '../components/site/ClientLogo';
import Cta from '../components/site/Cta';
import HeroSmall from '../components/site/HeroSmall';
import { CLIENTS } from '../data/site';
import { usePageTitle } from '../hooks/usePageTitle';

export default function ClientsPage() {
	const { t } = useTranslation();
	usePageTitle(t('site.clients.title'));

	return (
		<>
			<HeroSmall title={t('site.clients.title')} sub={t('site.clients.sub')} img="park" />

			<section className="py-24">
				<div className="mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-3">
					{CLIENTS.map((c) => (
						<div
							key={c.id}
							className="reveal lift rounded-3xl border border-brand-100 bg-card p-8 text-center">
							<div className="grid h-32 place-items-center">
								<ClientLogo id={c.id} logo={c.logo} className="max-h-28 w-auto object-contain" />
							</div>
							<h3 className="mt-5 leading-7 font-bold text-primary-dark">
								{t(`site.clients.items.${c.id}`)}
							</h3>
						</div>
					))}
				</div>
			</section>

			<Cta />
		</>
	);
}
