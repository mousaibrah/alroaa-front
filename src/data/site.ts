// Non-text content of the public site. The texts (titles, descriptions, names)
// are in the i18n files under `site.*`, keyed by the ids below.

export const CONTACT = {
	phones: ['966595727858', '966595612754'],
	email: 'info@rnec.sa',
	social: {
		X: 'https://x.com/rnec2024',
		Instagram: 'https://instagram.com/rnec.2024',
		TikTok: 'https://tiktok.com/@rnec.2024',
	},
} as const;

// id = anchor on /services and the icon file (svc-<id>.svg); photo = img/<photo>.webp
export const SERVICES = [
	{ id: 'records', photo: 'records' },
	{ id: 'audit', photo: 'audit' },
	{ id: 'mgmt', photo: 'mgmt' },
	{ id: 'permits', photo: 'permits' },
	{ id: 'rehab', photo: 'rehab' },
	{ id: 'plans', photo: 'plans' },
	{ id: 'social', photo: 'scale' },
	{ id: 'tests', photo: 'tests' },
] as const;

export const CLIENTS = [
	{ id: 'env', logo: 'cl-env.svg' },
	{ id: 'industry', logo: 'cl-industry.svg' },
	{ id: 'commerce', logo: 'cl-commerce.svg' },
	{ id: 'veg', logo: 'cl-veg.svg' },
	{ id: 'waste', logo: 'cl-waste.png' },
	{ id: 'ncec', logo: 'cl-ncec.png' },
	{ id: 'rakana', logo: 'cl-rakana.webp' },
	{ id: 'momah', logo: 'cl-momah.png' },
] as const;

export const VALUES = ['quality', 'innovation', 'dedication', 'commitment'] as const;
export const GOALS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const;

export type ServiceId = (typeof SERVICES)[number]['id'];
export type ClientId = (typeof CLIENTS)[number]['id'];
