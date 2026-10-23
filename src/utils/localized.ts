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
}

// Names are stored once, as entered at sign-up (any language).
export const firstName = (user: Named): string => user.firstName;

export const fullName = (user: Named): string =>
	[user.firstName, user.lastName].filter(Boolean).join(' ');
