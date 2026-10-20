import 'i18next';
import type { resources } from './index';

// Makes t('...') keys type-checked against the English file.
declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation';
		resources: (typeof resources)['en'];
	}
}
