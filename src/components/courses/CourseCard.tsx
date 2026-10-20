import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Course } from '../../types/courses';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '../../utils/format';
import StatusBadge from './StatusBadge';
import { paths } from '@/routes/paths';
import { useLocalize } from '../../hooks/useLocalize';

// Photos (public/assets/img/<name>.webp) used until a program has its own thumbnail.
const FALLBACK_PHOTOS = ['records', 'audit', 'mgmt', 'park', 'tests', 'rehab'] as const;

export default function CourseCard({
	course,
	enrolled = false,
}: {
	course: Course;
	enrolled?: boolean;
}) {
	const { t, i18n } = useTranslation();
	const { l } = useLocalize();
	const Arrow = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight;
	const photo = FALLBACK_PHOTOS[course.id % FALLBACK_PHOTOS.length];

	return (
		<Link to={paths.course(course.id)} className="group flex w-full">
			<Card className="h-full w-full gap-0 py-0 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg motion-reduce:transform-none">
				<img
					src={course.thumbnailUrl ?? `/assets/img/${photo}.webp`}
					alt=""
					className="aspect-video w-full border-b-4 border-brand-secondary bg-muted object-cover"
					loading="lazy"
				/>
				<CardContent className="flex flex-1 flex-col gap-3 py-5">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="bg-sand text-primary">
							{course.price === 0 ? t('courses.free') : t('courses.paidTag')}
						</Badge>
						{enrolled && (
							<Badge variant="secondary" className="bg-success-soft text-success-ink">
								{t('courses.enrolledBadge')}
							</Badge>
						)}
						{course.status !== 'published' && <StatusBadge status={course.status} />}
					</div>
					<h2 className="line-clamp-2 text-lg font-bold text-primary-dark">{l(course, 'title')}</h2>
					{l(course, 'description') && (
						<p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
							{l(course, 'description')}
						</p>
					)}
					<div className="mt-auto flex items-center justify-between gap-2 pt-3">
						<span className="flex items-center gap-1.5 font-bold text-primary-dark">
							{t('courses.viewProgram')}
							<Arrow
								className="size-4 transition rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1"
								aria-hidden
							/>
						</span>
						{course.price > 0 && (
							<span className="text-sm font-semibold text-muted-foreground">
								{formatPrice(course.price, course.currency, i18n.language)}
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
