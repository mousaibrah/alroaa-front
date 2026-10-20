// Mirrors testback/src/exams/attempts.service.ts.
import type { QuestionType } from './admin';

export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';

// An open attempt. The questions carry no correct answers: grading happens on
// the server.
export interface OpenAttempt {
	id: number;
	status: 'in_progress';
	examId: number;
	courseId: number;
	examTitleEn: string;
	examTitleAr: string;
	passingScore: number;
	startedAt: string;
	// null when the exam has no time limit.
	expiresAt: string | null;
	// Server clock at reply time, to correct a wrong local clock for the timer.
	serverNow: string;
	questions: {
		id: number;
		textEn: string;
		textAr: string;
		questionType: QuestionType;
		points: number;
		options: { id: number; textEn: string; textAr: string }[];
	}[];
}

export interface ReviewQuestion {
	id: number;
	textEn: string;
	textAr: string;
	questionType: QuestionType;
	points: number;
	earned: number;
	answered: boolean;
	correct: boolean;
	options: {
		id: number;
		textEn: string;
		textAr: string;
		isCorrect: boolean;
		selected: boolean;
	}[];
}

// A finished attempt: graded by the server, with the correct answers.
export interface AttemptResult {
	id: number;
	status: 'submitted' | 'expired';
	examId: number;
	courseId: number;
	examTitleEn: string;
	examTitleAr: string;
	passingScore: number;
	startedAt: string;
	submittedAt: string;
	score: number;
	maxScore: number;
	passed: boolean;
	// Set once the whole program is finished (every exam passed), else null.
	certificateCode: string | null;
	questions: ReviewQuestion[];
}

export type Attempt = OpenAttempt | AttemptResult;

export interface SubmitAttemptRequest {
	answers: { questionId: number; optionIds: number[] }[];
}
