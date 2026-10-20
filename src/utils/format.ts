export const formatDuration = (seconds: number | null): string => {
	if (!seconds) return '';
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatPrice = (price: number, currency: string, locale: string): string =>
	new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);
