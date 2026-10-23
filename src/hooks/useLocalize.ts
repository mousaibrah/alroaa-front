import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { localize, toLang, type Bilingual, type Lang } from '../utils/localized';

// `l(obj, 'title')` returns obj.titleAr or obj.titleEn for the current UI language.
export function useLocalize() {
	const { i18n } = useTranslation();
	const lang: Lang = toLang(i18n.resolvedLanguage);
	const l = useCallback(
		<K extends string>(obj: Bilingual<K>, key: K) => localize(obj, key, lang),
		[lang]
	);
	return { l, lang };
}
