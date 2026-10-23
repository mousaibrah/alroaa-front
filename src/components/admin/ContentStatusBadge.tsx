import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { ContentStatus } from '../../types/courses';

// Shown to editors while an uploaded lesson file is processed, or when it failed.
export default function ContentStatusBadge({ status }: { status: ContentStatus | null }) {
	const { t } = useTranslation();
	if (status !== 'processing' && status !== 'failed') return null;
	return (
		<Badge variant={status === 'failed' ? 'destructive' : 'secondary'}>
			{t(`admin.lesson.status.${status}`)}
		</Badge>
	);
}
