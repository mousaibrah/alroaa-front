import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { enrollInCourse } from '../../api/enrollments';

interface Props {
	courseId: number;
	free: boolean;
	onEnrolled: () => void;
	className?: string;
}

export default function EnrollButton({ courseId, free, onEnrolled, className }: Props) {
	const { t } = useTranslation();
	const [busy, setBusy] = useState(false);

	const enroll = async () => {
		setBusy(true);
		try {
			await enrollInCourse(courseId);
			toast.success(t('toast.enrolled'));
			onEnrolled();
		} catch {
			toast.error(t('courses.enrollError'));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Button type="button" onClick={() => void enroll()} disabled={busy} className={className}>
			{busy ? t('courses.enrolling') : free ? t('courses.enrollFree') : t('courses.enroll')}
		</Button>
	);
}
