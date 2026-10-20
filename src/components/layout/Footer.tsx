import { paths } from '@/routes/paths';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CONTACT, SERVICES } from '../../data/site';

export default function Footer() {
	const { t } = useTranslation();
	return (
		<footer className="bg-primary-dark text-white/80">
			<div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
				<div>
					<div className="mb-4 flex items-center gap-3">
						<img src="/assets/img/logo-mark-white.png" alt="" className="size-12" />
						<span className="leading-tight">
							<b className="block text-lg text-white">{t('common.appName')}</b>
							<small className="text-xs text-white/70">{t('common.appTagline')}</small>
						</span>
					</div>
					<p className="text-sm leading-7">{t('site.footer.about')}</p>
				</div>

				<div>
					<h4 className="mb-4 font-bold text-white">{t('site.footer.services')}</h4>
					<ul className="space-y-2 text-sm">
						{SERVICES.map((s) => (
							<li key={s.id}>
								<Link className="hover:text-brand-secondary" to={paths.service(s.id)}>
									{t(`site.services.items.${s.id}.title`)}
								</Link>
							</li>
						))}
						<li>
							<Link className="hover:text-brand-secondary" to={paths.verify}>
								{t('certificate.verifyLink')}
							</Link>
						</li>
					</ul>
				</div>

				<div>
					<h4 className="mb-4 font-bold text-white">{t('site.footer.contact')}</h4>
					<ul className="space-y-2 text-sm">
						<li>{t('site.footer.address')}</li>
						<li>
							<a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
						</li>
						{CONTACT.phones.map((phone) => (
							<li key={phone}>
								<a dir="ltr" className="inline-block" href={`tel:+${phone}`}>
									+{phone}
								</a>
							</li>
						))}
					</ul>
					<div className="mt-5 flex gap-3 text-sm">
						{Object.entries(CONTACT.social).map(([name, url]) => (
							<a
								key={name}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center rounded-md border border-white/30 px-3 py-1 text-sm leading-3.5 transition hover:bg-brand-secondary hover:text-brand-secondary-foreground">
								{name}
							</a>
						))}
					</div>
				</div>
			</div>
			<div className="border-t border-white/10 py-5 text-center text-xs">
				© {new Date().getFullYear()} {t('site.footer.rights')}
			</div>
		</footer>
	);
}
