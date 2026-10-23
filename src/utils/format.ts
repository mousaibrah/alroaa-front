export const formatDuration = (seconds: number | null): string => {
	if (!seconds) return '';
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatPrice = (price: number, currency: string, locale: string): string =>
	new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

// "486 MB", "4.2 MB/s" in the reader's language and digits.
export const formatBytes = (bytes: number, locale: string, perSecond = false): string => {
	let value = bytes;
	let unit = 0;
	while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
		value /= 1024;
		unit++;
	}
	return new Intl.NumberFormat(locale, {
		style: 'unit',
		unit: perSecond ? `${BYTE_UNITS[unit]}-per-second` : BYTE_UNITS[unit],
		unitDisplay: 'short',
		maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0,
	}).format(value);
};
