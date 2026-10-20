import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { reportProgress } from '../../api/progress';
import type { Lesson } from '../../types/courses';
import type { ProgressResult } from '../../types/progress';
import { usePlaybackSource } from '../../hooks/usePlaybackSource';
import { useProgressReporter } from '../../hooks/useProgressReporter';
import { LoadingRegion, Skeleton } from '../feedback/Skeleton';
import VideoPlayer from '../video/VideoPlayer';
import { useLocalize } from '../../hooks/useLocalize';

interface Props {
	lesson: Lesson;
	// Only enrolled learners have their progress tracked (not authors/admins or
	// visitors watching a preview).
	trackProgress: boolean;
	onProgress: (result: ProgressResult) => void;
}

// How often the position is saved while the learner is watching.
const SAVE_EVERY_MS = 10_000;

// The video of a lesson: asks the server for a short-lived URL, plays it, saves
// the position while watching (and on pause, end and when the page closes) and
// continues from the saved position next time.
function LessonVideo({ lesson, trackProgress, onProgress }: Props) {
	const { t } = useTranslation();
	const playback = usePlaybackSource(lesson.id, lesson.playable);
	const [playing, setPlaying] = useState(false);
	const positionRef = useRef(0);

	useProgressReporter({
		lessonId: lesson.id,
		getPositionSec: () => positionRef.current,
		active: trackProgress && playing && !lesson.completed,
		onResult: onProgress,
		intervalMs: SAVE_EVERY_MS,
	});

	if (!lesson.playable) {
		return <p className="p-6 text-sm text-muted-foreground">{t('courses.noContent')}</p>;
	}
	if (playback.loading) {
		return (
			<LoadingRegion>
				<Skeleton className="aspect-video w-full rounded-none" />
			</LoadingRegion>
		);
	}
	if (!playback.source) {
		return (
			<div className="flex aspect-video flex-col items-center justify-center gap-3 bg-muted p-6 text-center">
				<p role="alert" className="text-sm text-muted-foreground">
					{t('player.unavailable')}
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => void playback.refresh().catch(() => undefined)}>
					{t('player.retry')}
				</Button>
			</div>
		);
	}
	return (
		<VideoPlayer
			source={playback.source}
			// Continue where the learner stopped (a finished lesson starts over).
			startAt={lesson.completed ? 0 : lesson.progressSec}
			onPlayingChange={setPlaying}
			onTimeUpdate={(position) => {
				positionRef.current = position;
			}}
			onSourceExpired={playback.refresh}
		/>
	);
}

export default function LessonPlayer(props: Props) {
	const { lesson, trackProgress, onProgress } = props;
	const { t } = useTranslation();
	const { l } = useLocalize();
	const [saving, setSaving] = useState(false);

	const markComplete = async () => {
		setSaving(true);
		try {
			onProgress(await reportProgress(lesson.id, { progressSec: 0, completed: true }));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card className="gap-0 py-0 motion-safe:animate-fade-in">
			{lesson.lessonType === 'video' && <LessonVideo {...props} />}

			<CardContent className="space-y-3 py-4">
				<div className="flex items-center justify-between gap-2">
					<h2 className="text-lg font-semibold text-foreground">{l(lesson, 'title')}</h2>
					{lesson.completed && (
						<Badge variant="secondary" className="bg-success-soft text-success-ink">
							{t('courses.completed')}
						</Badge>
					)}
				</div>
				{l(lesson, 'description') && (
					<p className="text-sm whitespace-pre-line text-foreground">{l(lesson, 'description')}</p>
				)}
				{lesson.lessonType === 'text' && trackProgress && !lesson.completed && (
					<Button type="button" onClick={() => void markComplete()} disabled={saving}>
						{t('courses.markComplete')}
					</Button>
				)}
				{lesson.lessonType === 'video' && trackProgress && !lesson.completed && (
					<p className="text-xs text-muted-foreground">{t('courses.completeHint')}</p>
				)}
			</CardContent>
		</Card>
	);
}
