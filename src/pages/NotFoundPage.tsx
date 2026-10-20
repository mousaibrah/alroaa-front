import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { paths } from '@/routes/paths';

export default function NotFoundPage() {
	const { t } = useTranslation();
	const { pathname } = useLocation();

	return (
		<section className="text-center">
			<h1 className="mb-2 text-3xl font-bold text-foreground">{t('notFound.title')}</h1>
			<p className="mb-6 text-muted-foreground">
				{t('notFound.message')} <code dir="ltr">{pathname}</code>
			</p>
			<Link to={paths.home} className="text-sm font-medium text-primary hover:underline">
				{t('notFound.back')}
			</Link>
		</section>
	);
}
