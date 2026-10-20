import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Sets the browser tab title ("Page | Company") and the meta description, in
// the current language.
export function usePageTitle(title: string): void {
	const { t } = useTranslation();
	const company = t('site.company');
	const description = t('site.description');
	useEffect(() => {
		document.title = `${title} | ${company}`;
		document.querySelector('meta[name="description"]')?.setAttribute('content', description);
	}, [title, company, description]);
}
