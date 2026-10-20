import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const resources = {
	ar: { translation: ar },
	en: { translation: en },
} as const;

export const supportedLanguages = ['ar', 'en'] as const;
export type Language = (typeof supportedLanguages)[number];

// Native names, shown in the language switcher.
export const languageNames: Record<Language, string> = {
	ar: 'العربية',
	en: 'English',
};

const rtlLanguages: readonly string[] = ['ar'];

// Keep <html lang> and <html dir> in sync so the layout flips for Arabic.
const applyDocumentLanguage = (lng: string): void => {
	const base = lng.split('-')[0];
	document.documentElement.lang = base;
	document.documentElement.dir = rtlLanguages.includes(base) ? 'rtl' : 'ltr';
};

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		// Arabic is the default language of the site; a visitor who switches to
		// English keeps it (saved in localStorage). Everyone starts in Arabic.
		fallbackLng: 'ar',
		supportedLngs: supportedLanguages,
		// Treat "ar-EG" as "ar".
		nonExplicitSupportedLngs: true,
		interpolation: { escapeValue: false }, // React already escapes
		detection: {
			order: ['localStorage'],
			caches: ['localStorage'],
			// A new key: choices saved under the old 'language' key are ignored, so
			// browsers that tried English earlier start in Arabic again.
			lookupLocalStorage: 'site-language',
		},
	});

applyDocumentLanguage(i18n.resolvedLanguage ?? 'ar');
i18n.on('languageChanged', applyDocumentLanguage);

export default i18n;
