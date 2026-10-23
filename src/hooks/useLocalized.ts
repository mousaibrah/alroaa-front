import { useTranslation } from 'react-i18next';

// Picks the text for the current language, or the other one when it is empty.
export const useLocalized = () => {
	const { i18n } = useTranslation();
	const isAr = i18n.language.startsWith('ar');
	return (en: string | null, ar: string | null): string => (isAr ? ar || en : en || ar) ?? '';
};
