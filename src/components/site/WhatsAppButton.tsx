import { useTranslation } from 'react-i18next';
import { CONTACT } from '../../data/site';

// Floating chat button, on the side opposite the reading start.
export default function WhatsAppButton() {
	const { t } = useTranslation();
	return (
		<a
			href={`https://wa.me/${CONTACT.phones[0]}`}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={t('common.whatsapp')}
			className="whatsapp-pulse fixed end-5 bottom-5 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
				<path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
			</svg>
		</a>
	);
}
