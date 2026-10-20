import { useTranslation } from 'react-i18next';
import type { CourseStatus } from '../../types/courses';
import { Badge } from '@/components/ui/badge';

const TONE: Record<CourseStatus, string> = {
	draft: 'bg-warning-soft text-warning-ink',
	published: 'bg-success-soft text-success-ink',
	archived: 'bg-muted text-muted-foreground',
};

export default function StatusBadge({ status }: { status: CourseStatus }) {
	const { t } = useTranslation();
	return (
		<Badge variant="secondary" className={TONE[status]}>
			{t(`courses.status.${status}`)}
		</Badge>
	);
}
