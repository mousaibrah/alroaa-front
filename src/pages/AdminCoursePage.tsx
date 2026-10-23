import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalized } from '../hooks/useLocalized';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteCourse, updateCourse } from '../api/admin';
import { ApiError } from '../api/client';
import CourseForm from '../components/admin/CourseForm';
import StatusControl from '../components/admin/StatusControl';
import CurriculumTab from '../components/admin/CurriculumTab';
import ExamsTab from '../components/admin/ExamsTab';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { errorMessage } from '../utils/errors';
import { getCourse } from '../api/courses';
import { useApiQuery } from '../hooks/useApiQuery';
import { AdminCourseSkeleton } from '../components/feedback/skeletons';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';

type Tab = 'details' | 'curriculum' | 'exams';
const TABS: Tab[] = ['details', 'curriculum', 'exams'];

export default function AdminCoursePage() {
	const { t } = useTranslation();
	const loc = useLocalized();
	const navigate = useNavigate();
	const courseId = Number(useParams().id);
	const [tab, setTab] = useState<Tab>('curriculum');
	const [error, setError] = useState<string | null>(null);

	const {
		data: course,
		error: loadError,
		loading,
		reload,
	} = useApiQuery((signal) => getCourse(courseId, signal), `course:${courseId}`);

	if (loading) return <AdminCourseSkeleton />;
	if (loadError != null || !course) {
		const notFound = loadError instanceof ApiError && loadError.status === 404;
		return (
			<section className="text-center">
				<p className="mb-4 text-foreground">
					{t(notFound ? 'courses.notFound' : 'courses.loadError')}
				</p>
				<Link to={paths.admin} className="text-sm font-medium text-primary hover:underline">
					{t('admin.back')}
				</Link>
			</section>
		);
	}

	const remove = async () => {
		if (!window.confirm(t('admin.courses.confirmDelete', { title: loc(course.titleEn, course.titleAr) }))) return;
		try {
			await deleteCourse(course.id);
			toast.success(t('toast.deleted'));
			void navigate(paths.admin);
		} catch (err) {
			setError(errorMessage(err));
		}
	};

	return (
		<div className="w-full max-w-4xl self-start py-4">
			<Link to={paths.admin} className="text-sm font-medium text-primary hover:underline">
				← {t('admin.back')}
			</Link>
			<div className="mt-2 mb-4 flex items-center justify-between gap-3">
				<h1 className="text-2xl font-bold text-foreground">{loc(course.titleEn, course.titleAr)}</h1>
				<StatusControl
					status={course.status}
					onChange={async (status) => {
						const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);
						if (
							status === 'published' &&
							lessonCount === 0 &&
							!window.confirm(t('admin.courses.confirmPublishEmpty'))
						) {
							return;
						}
						await updateCourse(course.id, { status });
						toast.success(t('toast.statusChanged'));
						reload();
					}}
				/>
			</div>

			<ErrorBanner message={error} />

			<Tabs value={tab} onValueChange={(v) => setTab(v as (typeof TABS)[number])}>
				<TabsList variant="line" className="mb-3 w-full justify-start border-b">
					{TABS.map((id) => (
						<TabsTrigger key={id} value={id} className="flex-none px-4">
							{t(`admin.tabs.${id}`)}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="details" className="space-y-8">
					<Card>
						<CardContent>
							<CourseForm
								course={course}
								submitLabel={t('admin.save')}
								onSubmit={async (data) => {
									await updateCourse(course.id, data);
									reload();
								}}
							/>
						</CardContent>
					</Card>
					<Card className="border-destructive/30">
						<CardHeader>
							<CardTitle className="text-destructive">{t('admin.courses.dangerZone')}</CardTitle>
							<CardDescription>{t('admin.courses.deleteHint')}</CardDescription>
						</CardHeader>
						<CardContent>
							<Button type="button" onClick={() => void remove()} variant="destructive" size="sm">
								{t('admin.courses.delete')}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="curriculum">
					<CurriculumTab course={course} reload={reload} />
				</TabsContent>
				<TabsContent value="exams">
					<ExamsTab courseId={course.id} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
