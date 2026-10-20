import type { Course, CourseStatus, LessonType } from './courses';

export interface AdminCourse extends Course {
	authorName: string;
}

export interface AdminCourseList {
	items: AdminCourse[];
	total: number;
	page: number;
	limit: number;
}

// `null` clears an optional field on update.
export interface CourseInput {
	title?: string;
	description?: string;
	price?: number;
	currency?: string;
	thumbnailUrl?: string | null;
	status?: CourseStatus;
}

export interface SectionInput {
	title?: string;
	description?: string;
}

export interface LessonInput {
	title?: string;
	description?: string;
	lessonType?: LessonType;
	contentUrl?: string | null;
	durationSec?: number | null;
	isPreview?: boolean;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface ExamOption {
	id?: number;
	optionText: string;
	isCorrect: boolean;
}

export interface ExamQuestion {
	id?: number;
	text: string;
	questionType: QuestionType;
	points: number;
	options: ExamOption[];
}

export interface ExamSummary {
	id: number;
	title: string;
	description: string | null;
	passingScore: number;
	durationSec: number | null;
	questionCount: number;
}

export interface Exam {
	id: number;
	courseId: number;
	title: string;
	description: string | null;
	passingScore: number;
	durationSec: number | null;
	questions: ExamQuestion[];
}

export interface ExamSaveInput {
	title: string;
	description?: string | null;
	passingScore: number;
	durationSec?: number | null;
	questions: ExamQuestion[];
}
