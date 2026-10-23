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

// Sent as multipart/form-data. `thumbnail` is the cover image and `introVideo`
// the introduction video; on update each replaces the current one.
export interface CourseInput {
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
	price?: number;
	currency?: string;
	status?: CourseStatus;
	thumbnail?: File | null;
	introVideo?: File | null;
}

export interface SectionInput {
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
}

// Sent as JSON. `contentMediaId` is a file uploaded beforehand (see
// api/uploads); required when creating, on update it replaces the content. An
// empty durationSec is read from the video.
export interface LessonInput {
	titleEn?: string;
	titleAr?: string;
	descriptionEn?: string;
	descriptionAr?: string;
	lessonType?: LessonType;
	durationSec?: number | null;
	isPreview?: boolean;
	contentMediaId?: string;
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
