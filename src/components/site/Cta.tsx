import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { paths } from '@/routes/paths';

// "Contact us" banner shown at the bottom of the site pages.
export default function Cta() {
	const { t } = useTranslation();
	return (
		<section className="relative overflow-hidden py-24 text-center text-white">
			<img
				src="/assets/img/cta.webp"
				alt=""
				className="absolute inset-0 h-full w-full object-cover"
				loading="lazy"
			/>
			<div className="absolute inset-0 bg-primary/90" />
			<div className="reveal relative mx-auto max-w-3xl px-5">
				<h2 className="mb-4 text-3xl font-extrabold md:text-4xl">{t('site.cta.title')}</h2>
				<p className="mb-8 leading-8 text-white/85">{t('site.cta.text')}</p>
				<Button asChild variant="gold" size="lg">
					<Link to={paths.contact}>{t('site.cta.button')}</Link>
				</Button>
			</div>
		</section>
	);
}
