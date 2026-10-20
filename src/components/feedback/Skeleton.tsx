import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export { Skeleton } from '@/components/ui/skeleton';

// Wraps skeletons so screen readers hear one "loading" message instead of
// a page of empty boxes.
export function LoadingRegion({
	children,
	className = '',
}: {
	children: ReactNode;
	className?: string;
}) {
	const { t } = useTranslation();
	return (
		<div role="status" aria-busy="true" className={className}>
			<span className="sr-only">{t('courses.loading')}</span>
			{children}
		</div>
	);
}
