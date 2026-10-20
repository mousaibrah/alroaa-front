import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';

export default function ForbiddenPage() {
	const { t } = useTranslation();

	return (
		<section className="text-center">
			<h1 className="mb-2 text-3xl font-bold text-foreground">{t('forbidden.title')}</h1>
			<p className="mb-6 text-muted-foreground">{t('forbidden.message')}</p>
			<Link to={paths.home} className="text-sm font-medium text-primary hover:underline">
				{t('notFound.back')}
			</Link>
		</section>
	);
}
