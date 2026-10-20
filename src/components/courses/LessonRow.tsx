import { useTranslation } from 'react-i18next';
import type { Lesson } from '../../types/courses';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDuration } from '../../utils/format';
import { CheckIcon, LockIcon, PlayIcon, TextIcon } from './Icons';

interface Props {
	lesson: Lesson;
	// locked: previous lesson not done (can't be selected). enroll/payment: can
	// be selected, but the player area asks to enroll or pay first.
	state: 'open' | 'locked' | 'enroll' | 'payment';
	// Marks free lessons and paid content in a course that charges.
	tag: 'free' | 'paid' | null;
	active: boolean;
	onSelect: () => void;
}

export default function LessonRow({ lesson, state, tag, active, onSelect }: Props) {
	const { t } = useTranslation();

	const gated = state !== 'open';
	const icon = gated ? (
		<span className="text-muted-foreground">
			<LockIcon />
		</span>
	) : lesson.completed ? (
		<span className="text-success">
			<CheckIcon />
		</span>
	) : (
		<span className="text-primary">
			{lesson.lessonType === 'video' ? <PlayIcon /> : <TextIcon />}
		</span>
	);

	return (
		<li>
			<Button
				type="button"
				variant="ghost"
				disabled={state === 'locked'}
				onClick={onSelect}
				aria-current={active ? 'true' : undefined}
				className={cn(
					'h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-start font-normal whitespace-normal',
					active && 'bg-primary/10 hover:bg-primary/10',
					state === 'locked'
						? 'text-muted-foreground'
						: gated
							? 'text-muted-foreground'
							: 'text-foreground'
				)}>
				{icon}
				<span className="flex-1">
					{lesson.title}
					{gated && <span className="sr-only"> ({t('courses.locked')})</span>}
				</span>
				{tag === 'free' && (
					<Badge variant="secondary" className="bg-info-soft text-info-ink">
						{t('courses.preview')}
					</Badge>
				)}
				{tag === 'paid' && (
					<Badge variant="secondary" className="bg-warning-soft text-warning-ink">
						{t('courses.paidTag')}
					</Badge>
				)}
				<span className="text-xs text-muted-foreground">{formatDuration(lesson.durationSec)}</span>
			</Button>
		</li>
	);
}
