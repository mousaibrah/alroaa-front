// Mirrors testback/src/courses/progress.service.ts.
export interface ReportProgressRequest {
	progressSec: number;
	// Only for lessons without a duration (e.g. text); duration lessons complete
	// from progressSec.
	completed?: boolean;
}

export interface ProgressResult {
	lessonId: number;
	progressSec: number;
	completed: boolean;
	newlyCompleted: boolean;
	unlockedLessonId: number | null;
	courseCompleted: boolean;
}
