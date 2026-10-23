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

// Sent as multipart/form-data. `thumbnail` is the cover image; on update it
// replaces the current one.
export interface CourseInput {
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
	price?: number;
	currency?: string;
	status?: CourseStatus;
	thumbnail?: File | null;
}

export interface SectionInput {
	title?: string;
	description?: string;
}

// Sent as multipart/form-data. `file` is required when creating; on update it
// replaces the content. An empty durationSec is read from the video.
export interface LessonInput {
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
	lessonType?: LessonType;
	durationSec?: number | null;
	isPreview?: boolean;
	file?: File | null;
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
