import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CourseStatus } from '../../types/courses';
import StatusBadge from '../courses/StatusBadge';
import SimpleSelect from '../common/SimpleSelect';
import { errorMessage } from '../../utils/errors';
import { toast } from 'sonner';

const STATUSES: CourseStatus[] = ['draft', 'published', 'archived'];

interface Props {
	status: CourseStatus;
	// Called with the new status; throw to reject the change.
	onChange: (status: CourseStatus) => Promise<void>;
}

// Changes the course status right away (no separate save step).
export default function StatusControl({ status, onChange }: Props) {
	const { t } = useTranslation();
	const [saving, setSaving] = useState(false);

	const change = async (next: CourseStatus) => {
		if (next === status) return;
		setSaving(true);
		try {
			await onChange(next);
		} catch (err) {
			toast.error(errorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col items-end gap-1">
			<div className="flex items-center gap-2">
				<StatusBadge status={status} />
				<SimpleSelect
					aria-label={t('admin.course.status')}
					className="w-36"
					value={status}
					disabled={saving}
					onValueChange={(s) => void change(s)}
					options={STATUSES.map((s) => ({ value: s, label: t(`courses.status.${s}`) }))}
				/>
			</div>
		</div>
	);
}
