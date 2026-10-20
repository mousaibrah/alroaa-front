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
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
	price?: number;
	currency?: string;
	thumbnailUrl?: string | null;
	status?: CourseStatus;
}

export interface SectionInput {
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
}

export interface LessonInput {
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
	lessonType?: LessonType;
	contentUrlEn?: string | null;
	contentUrlAr?: string | null;
	durationSec?: number | null;
	isPreview?: boolean;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface ExamOption {
	id?: number;
	optionTextEn: string;
	optionTextAr: string;
	isCorrect: boolean;
}

export interface ExamQuestion {
	id?: number;
	textEn: string;
	textAr: string;
	questionType: QuestionType;
	points: number;
	options: ExamOption[];
}

export interface ExamSummary {
	id: number;
	titleEn: string;
	titleAr: string;
	descriptionEn: string | null;
	descriptionAr: string | null;
	passingScore: number;
	durationSec: number | null;
	questionCount: number;
}

export interface Exam {
	id: number;
	courseId: number;
	titleEn: string;
	titleAr: string;
	descriptionEn: string | null;
	descriptionAr: string | null;
	passingScore: number;
	durationSec: number | null;
	questions: ExamQuestion[];
}

export interface ExamSaveInput {
	titleEn: string;
	titleAr: string;
	descriptionEn?: string | null;
	descriptionAr?: string | null;
	passingScore: number;
	durationSec?: number | null;
	questions: ExamQuestion[];
}
