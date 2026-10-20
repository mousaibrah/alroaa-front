import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { createCourse, deleteCourse, listAllCourses } from '../api/admin';
import StatusBadge from '../components/courses/StatusBadge';
import CourseForm from '../components/admin/CourseForm';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { errorMessage } from '../utils/errors';
import { formatPrice } from '../utils/format';
import { useApiQuery } from '../hooks/useApiQuery';
import { ListSkeleton } from '../components/feedback/skeletons';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function AdminPage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		data,
		error: loadError,
		loading,
		reload,
	} = useApiQuery(
		(signal) => listAllCourses({ page, limit: PAGE_SIZE }, signal),
		`admin-courses:${page}`
	);
	const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

	const remove = async (id: number, title: string) => {
		if (!window.confirm(t('admin.courses.confirmDelete', { title }))) return;
		setError(null);
		try {
			await deleteCourse(id);
			toast.success(t('toast.deleted'));
			reload();
		} catch (err) {
			setError(errorMessage(err));
		}
	};

	return (
		<section className="w-full max-w-5xl self-start py-4">
			<div className="mb-6 flex items-center justify-between gap-3">
				<h1 className="text-2xl font-bold text-foreground">{t('admin.title')}</h1>
				<Button type="button" onClick={() => setCreating((c) => !c)}>
					{creating ? t('admin.cancel') : `+ ${t('admin.courses.new')}`}
				</Button>
			</div>

			{creating && (
				<Card className="mb-6 motion-safe:animate-fade-in">
					<CardHeader>
						<CardTitle className="text-lg">{t('admin.courses.new')}</CardTitle>
					</CardHeader>
					<CardContent>
						<CourseForm
							submitLabel={t('admin.courses.create')}
							onSubmit={async (data) => {
								const course = await createCourse(data);
								void navigate(paths.adminCourse(course.id));
							}}
						/>
					</CardContent>
				</Card>
			)}

			<ErrorBanner message={error ?? (loadError ? errorMessage(loadError) : null)} />
			{loading && <ListSkeleton rows={5} />}
			{data && data.items.length === 0 && (
				<p className="text-muted-foreground">{t('courses.empty')}</p>
			)}

			{data && data.items.length > 0 && (
				<Card className="py-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="px-4">{t('admin.course.title')}</TableHead>
								<TableHead>{t('admin.courses.author')}</TableHead>
								<TableHead>{t('admin.course.status')}</TableHead>
								<TableHead>{t('admin.course.price')}</TableHead>
								<TableHead />
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.items.map((course) => (
								<TableRow key={course.id}>
									<TableCell className="px-4 font-medium">
										<Link
											to={paths.adminCourse(course.id)}
											className="hover:text-primary hover:underline">
											{course.title}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">{course.authorName}</TableCell>
									<TableCell>
										<StatusBadge status={course.status} />
									</TableCell>
									<TableCell className="text-muted-foreground">
										{course.price === 0
											? t('courses.free')
											: formatPrice(course.price, course.currency, i18n.language)}
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-2">
											<Button asChild variant="outline" size="sm">
												<Link to={paths.adminCourse(course.id)}>{t('admin.manage')}</Link>
											</Button>
											<Button
												type="button"
												onClick={() => void remove(course.id, course.title)}
												variant="destructive"
												size="sm">
												{t('admin.delete')}
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}

			{totalPages > 1 && (
				<nav
					className="mt-6 flex items-center justify-center gap-3"
					aria-label={t('courses.pagination')}>
					<Button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						variant="outline"
						size="sm">
						{t('courses.prev')}
					</Button>
					<span className="text-sm text-muted-foreground">
						{page} / {totalPages}
					</span>
					<Button
						type="button"
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						variant="outline"
						size="sm">
						{t('courses.next')}
					</Button>
				</nav>
			)}
		</section>
	);
}
