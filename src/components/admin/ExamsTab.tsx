import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createExam, deleteExam, listExams } from '../../api/admin';
import { useApiQuery } from '../../hooks/useApiQuery';
import { ListSkeleton } from '../feedback/skeletons';
import ExamBuilder from './ExamBuilder';
import { ErrorBanner } from '../common/ErrorBanner';
import { errorMessage } from '../../utils/errors';
import { toast } from 'sonner';

export default function ExamsTab({ courseId }: { courseId: number }) {
	const { t } = useTranslation();
	const {
		data: exams,
		error,
		loading,
		reload,
	} = useApiQuery((signal) => listExams(courseId, signal), `exams:${courseId}`);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [title, setTitle] = useState('');
	const [actionError, setActionError] = useState<string | null>(null);

	if (editingId !== null) {
		return (
			<ExamBuilder
				examId={editingId}
				onClose={() => {
					setEditingId(null);
					reload();
				}}
			/>
		);
	}

	const create = async (e: FormEvent) => {
		e.preventDefault();
		setActionError(null);
		try {
			const exam = await createExam(courseId, { title: title.trim() });
			setTitle('');
			setEditingId(exam.id); // go straight into the builder
		} catch (err) {
			setActionError(errorMessage(err));
		}
	};

	const remove = async (id: number) => {
		if (!window.confirm(t('admin.exam.confirmDelete'))) return;
		setActionError(null);
		try {
			await deleteExam(id);
			toast.success(t('toast.deleted'));
			reload();
		} catch (err) {
			setActionError(errorMessage(err));
		}
	};

	return (
		<div className="space-y-4">
			<ErrorBanner message={actionError ?? (error ? errorMessage(error) : null)} />
			{loading && <ListSkeleton rows={2} />}
			{exams && exams.length === 0 && (
				<p className="text-sm text-muted-foreground">{t('admin.exam.empty')}</p>
			)}

			{exams && exams.length > 0 && (
				<Card className="py-0">
					<ul className="divide-y">
						{exams.map((exam) => (
							<li key={exam.id} className="flex items-center gap-3 px-4 py-3 text-sm">
								<div className="flex-1">
									<p className="font-medium text-foreground">{exam.title}</p>
									<p className="text-xs text-muted-foreground">
										{t('admin.exam.summary', {
											count: exam.questionCount,
											passing: exam.passingScore,
										})}
									</p>
								</div>
								<Button
									type="button"
									onClick={() => setEditingId(exam.id)}
									variant="outline"
									size="sm">
									{t('admin.edit')}
								</Button>
								<Button
									type="button"
									onClick={() => void remove(exam.id)}
									variant="destructive"
									size="sm">
									{t('admin.delete')}
								</Button>
							</li>
						))}
					</ul>
				</Card>
			)}

			<form onSubmit={(e) => void create(e)} className="flex gap-2">
				<Input
					required
					maxLength={255}
					placeholder={t('admin.exam.newTitle')}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<Button type="submit">+ {t('admin.exam.create')}</Button>
			</form>
		</div>
	);
}
