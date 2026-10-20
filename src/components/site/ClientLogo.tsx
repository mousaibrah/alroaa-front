import { useTranslation } from 'react-i18next';
import type { ClientId } from '../../data/site';

export default function ClientLogo({
	id,
	logo,
	className,
}: {
	id: ClientId;
	logo: string;
	className?: string;
}) {
	const { t } = useTranslation();
	return (
		<img
			src={`/assets/img/${logo}`}
			alt={t(`site.clients.items.${id}`)}
			className={className}
			loading="lazy"
		/>
	);
}
