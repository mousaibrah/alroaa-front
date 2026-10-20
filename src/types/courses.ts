// Mirrors testback/src/courses (courses.service.ts, lesson/course DTOs).
export type CourseStatus = 'draft' | 'published' | 'archived';
export type LessonType = 'video' | 'text';

export interface Course {
	id: number;
	title: string;
	slug: string;
	description: string | null;
	price: number;
	currency: string;
	status: CourseStatus;
	authorId: number;
	thumbnailUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CourseList {
	items: Course[];
	total: number;
	page: number;
	limit: number;
}

export interface Lesson {
	id: number;
	title: string;
	description: string | null;
	lessonType: LessonType;
	durationSec: number | null;
	sortOrder: number;
	isPreview: boolean;
	progressSec: number;
	completed: boolean;
	// True for enrolled learners until the previous lesson is completed.
	locked: boolean;
	// Enrolled, but this lesson is paid content and the course isn't paid yet.
	paymentRequired: boolean;
	// The learner may watch it now: ask GET /lessons/:id/playback for the URL.
	playable: boolean;
	// The stored video address; only sent to the people who edit the course.
	contentUrl: string | null;
}

export interface Section {
	id: number;
	title: string;
	description: string | null;
	sortOrder: number;
	lessons: Lesson[];
}

// Exam summary on the course page (no questions or answers).
export interface CourseExam {
	id: number;
	title: string;
	description: string | null;
	passingScore: number;
	durationSec: number | null;
	questionCount: number;
	// True until the learner is enrolled and has completed every lesson.
	locked: boolean;
	// The learner's own results (zero/false for authors and admins).
	attempts: number;
	lastAttemptId: number | null;
	inProgress: boolean;
	passed: boolean;
	bestScore: number | null;
	maxScore: number | null;
}

export interface CourseDetail extends Course {
	// Enrolled (or the author/admin). Without it no lesson opens, free ones included.
	hasAccess: boolean;
	// Enrolled, but the paid lessons still need a payment.
	paymentRequired: boolean;
	enrollment: { id: number; status: string } | null;
	exams: CourseExam[];
	sections: Section[];
}

export interface ListCoursesParams {
	mine?: boolean;
	page?: number;
	limit?: number;
}
