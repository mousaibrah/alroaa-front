export type Lang = 'en' | 'ar';

// An object carrying `<key>En` / `<key>Ar` fields, as the API returns them.
export type Bilingual<K extends string> = {
	[P in `${K}En` | `${K}Ar`]?: string | null;
};

export const toLang = (language: string | undefined): Lang => (language === 'en' ? 'en' : 'ar');

// The text in the wanted language, falling back to the other one when it is
// empty (a lesson or description may only exist in one language).
export function localize<K extends string>(obj: Bilingual<K>, key: K, lang: Lang): string {
	const en = obj[`${key}En` as `${K}En`];
	const ar = obj[`${key}Ar` as `${K}Ar`];
	return (lang === 'ar' ? ar || en : en || ar) || '';
}

interface Named {
	firstName: string;
	lastName: string;
	firstNameAr?: string | null;
	lastNameAr?: string | null;
}

// The Arabic spelling is optional, so fall back to the name as entered at
// sign-up (any language) whenever a part is missing.
export const firstName = (user: Named, lang: Lang): string =>
	(lang === 'ar' && user.firstNameAr) || user.firstName;

export const lastName = (user: Named, lang: Lang): string =>
	(lang === 'ar' && user.lastNameAr) || user.lastName;

export const fullName = (user: Named, lang: Lang): string =>
	[firstName(user, lang), lastName(user, lang)].filter(Boolean).join(' ');
