import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

// Panel shown in the player area when the selected lesson can't be opened yet:
// either the visitor isn't enrolled, or the lesson is paid content.
export default function LessonGate({
	title,
	body,
	lessonTitle,
	children,
}: {
	title: string;
	body: string;
	lessonTitle: string;
	children?: ReactNode;
}) {
	const { t } = useTranslation();
	return (
		<Card className="motion-safe:animate-fade-in">
			<CardContent className="flex flex-col items-center gap-3 py-4 text-center">
				<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<Lock aria-hidden className="size-5" />
				</span>
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					<span className="sr-only">{t('courses.locked')}: </span>
					{lessonTitle}
				</p>
				<h2 className="text-lg font-semibold text-foreground">{title}</h2>
				<p className="max-w-md text-sm text-muted-foreground">{body}</p>
				{children}
			</CardContent>
		</Card>
	);
}
