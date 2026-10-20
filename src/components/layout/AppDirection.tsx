import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Tells the Radix-based shadcn components (select, tabs, radio group...) which
// way the page reads, so menus open and arrow keys move the right way in Arabic.
export default function AppDirection({ children }: { children: ReactNode }) {
	const { i18n } = useTranslation();
	return <Direction.DirectionProvider dir={i18n.dir()}>{children}</Direction.DirectionProvider>;
}
