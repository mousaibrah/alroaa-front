// Phone numbers are stored as a dialing code (+966) and the national number,
// digits only. These rules match the backend (users/utils/phone.util.ts).

export const DEFAULT_COUNTRY_CODE = '+966';

// Saudi Arabia first, then the rest of the region.
export const COUNTRY_CODES = [
	{ code: '+966', region: 'SA' },
	{ code: '+971', region: 'AE' },
	{ code: '+965', region: 'KW' },
	{ code: '+974', region: 'QA' },
	{ code: '+973', region: 'BH' },
	{ code: '+968', region: 'OM' },
	{ code: '+962', region: 'JO' },
	{ code: '+20', region: 'EG' },
	{ code: '+967', region: 'YE' },
	{ code: '+249', region: 'SD' },
	{ code: '+963', region: 'SY' },
	{ code: '+961', region: 'LB' },
	{ code: '+964', region: 'IQ' },
	{ code: '+970', region: 'PS' },
] as const;

// "🇸🇦 +966", built from the region code.
export const countryLabel = (code: string): string => {
	const region = COUNTRY_CODES.find((c) => c.code === code)?.region;
	if (!region) return code;
	const flag = String.fromCodePoint(...[...region].map((ch) => 0x1f1a5 + ch.charCodeAt(0)));
	return `${flag} ${code}`;
};

// Digits only, without the trunk 0: "050 123 4567" -> "501234567".
export const normalizePhoneNumber = (value: string): string =>
	value.replace(/[\s()-]/g, '').replace(/^0/, '');

// Translation key of what is wrong with the number, or null when it is valid.
export const phoneError = (countryCode: string, value: string): string | null => {
	if (!/^[0-9\s()-]*$/.test(value)) return 'validation.phoneDigits';
	const number = normalizePhoneNumber(value);
	if (number === '') return 'validation.phoneRequired';
	if (!/^[0-9]{4,15}$/.test(number)) return 'validation.phoneInvalid';
	if (countryCode === '+966' && !/^5[0-9]{8}$/.test(number)) return 'validation.phoneSaudi';
	return null;
};

// "+966 50 123 4567" for display (Saudi mobiles are grouped 2-3-4).
export const formatPhone = (countryCode: string, phoneNumber: string): string => {
	const grouped =
		countryCode === '+966' && /^5[0-9]{8}$/.test(phoneNumber)
			? `${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5)}`
			: phoneNumber;
	return `${countryCode} ${grouped}`;
};
