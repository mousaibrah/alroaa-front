import type { Exam, ExamSaveInput, QuestionType } from '../types/admin';

// Editable copy of an exam. Numbers are strings while typing, and every row has
// a client-only `key` so React keeps focus when rows are reordered or removed.
export interface DraftOption {
	key: string;
	id?: number;
	optionTextEn: string;
	optionTextAr: string;
	isCorrect: boolean;
}

export interface DraftQuestion {
	key: string;
	id?: number;
	textEn: string;
	textAr: string;
	questionType: QuestionType;
	points: string;
	options: DraftOption[];
}

export interface Draft {
	titleEn: string;
	titleAr: string;
	descriptionEn: string;
	descriptionAr: string;
	passingScore: string;
	durationMin: string;
	questions: DraftQuestion[];
}

let counter = 0;
const uid = () => `k${++counter}`;

export const MAX_OPTIONS = 20;

export const newOption = (optionTextEn = '', optionTextAr = '', isCorrect = false): DraftOption => ({
	key: uid(),
	optionTextEn,
	optionTextAr,
	isCorrect,
});

export const newQuestion = (): DraftQuestion => ({
	key: uid(),
	textEn: '',
	textAr: '',
	questionType: 'single_choice',
	points: '1',
	options: [newOption('', '', true), newOption()],
});

export function toDraft(exam: Exam): Draft {
	return {
		titleEn: exam.titleEn,
		titleAr: exam.titleAr,
		descriptionEn: exam.descriptionEn ?? '',
		descriptionAr: exam.descriptionAr ?? '',
		passingScore: String(exam.passingScore),
		durationMin: exam.durationSec ? String(exam.durationSec / 60) : '',
		questions: exam.questions.map((q) => ({
			key: uid(),
			id: q.id,
			textEn: q.textEn,
			textAr: q.textAr,
			questionType: q.questionType,
			points: String(q.points),
			options: q.options.map((o) => ({
				key: uid(),
				id: o.id,
				optionTextEn: o.optionTextEn,
				optionTextAr: o.optionTextAr,
				isCorrect: o.isCorrect,
			})),
		})),
	};
}

export function fromDraft(d: Draft): ExamSaveInput {
	return {
		titleEn: d.titleEn.trim(),
		titleAr: d.titleAr.trim(),
		descriptionEn: d.descriptionEn.trim() || null,
		descriptionAr: d.descriptionAr.trim() || null,
		passingScore: Number(d.passingScore),
		durationSec: d.durationMin.trim() === '' ? null : Math.round(Number(d.durationMin) * 60),
		questions: d.questions.map((q) => ({
			id: q.id,
			textEn: q.textEn.trim(),
			textAr: q.textAr.trim(),
			questionType: q.questionType,
			points: Number(q.points),
			options: q.options.map((o) => ({
				id: o.id,
				optionTextEn: o.optionTextEn.trim(),
				optionTextAr: o.optionTextAr.trim(),
				isCorrect: o.isCorrect,
			})),
		})),
	};
}

// Single-answer types behave like radio buttons; multiple choice like checkboxes.
export function setCorrect(q: DraftQuestion, optionKey: string, checked: boolean): DraftQuestion {
	const options =
		q.questionType === 'multiple_choice'
			? q.options.map((o) => (o.key === optionKey ? { ...o, isCorrect: checked } : o))
			: q.options.map((o) => ({ ...o, isCorrect: o.key === optionKey }));
	return { ...q, options };
}

export function changeType(
	q: DraftQuestion,
	questionType: QuestionType,
	labels: { trueEn: string; trueAr: string; falseEn: string; falseAr: string }
): DraftQuestion {
	if (questionType === q.questionType) return q;
	if (questionType === 'true_false') {
		// Fixed two options; keep the existing rows where possible so ids survive.
		const [a, b] = q.options;
		return {
			...q,
			questionType,
			options: [
				{
					...(a ?? newOption()),
					optionTextEn: labels.trueEn,
					optionTextAr: labels.trueAr,
					isCorrect: true,
				},
				{
					...(b ?? newOption()),
					optionTextEn: labels.falseEn,
					optionTextAr: labels.falseAr,
					isCorrect: false,
				},
			],
		};
	}
	if (questionType === 'single_choice') {
		// Only one answer may stay correct.
		const firstCorrect = q.options.find((o) => o.isCorrect) ?? q.options[0];
		return {
			...q,
			questionType,
			options: q.options.map((o) => ({ ...o, isCorrect: o === firstCorrect })),
		};
	}
	return { ...q, questionType };
}

export interface DraftIssue {
	code:
		| 'title'
		| 'questionText'
		| 'points'
		| 'optionText'
		| 'optionsMin'
		| 'trueFalseOptions'
		| 'oneCorrect'
		| 'someCorrect'
		| 'passingScore'
		| 'duration'
		| 'passingTooHigh';
	n?: number; // 1-based question number
	passing?: number;
	total?: number;
}

// Mirrors the backend rules (testback/src/exams/exam-validation.ts) so problems
// are caught before saving; the server still enforces them.
export function validateDraft(d: Draft): DraftIssue[] {
	const issues: DraftIssue[] = [];
	if (!d.titleEn.trim() || !d.titleAr.trim()) issues.push({ code: 'title' });

	const passing = Number(d.passingScore);
	if (
		d.passingScore.trim() === '' ||
		!Number.isFinite(passing) ||
		passing < 0 ||
		passing > 999.99
	) {
		issues.push({ code: 'passingScore' });
	}
	if (d.durationMin.trim() !== '' && !(Number(d.durationMin) >= 0))
		issues.push({ code: 'duration' });

	let total = 0;
	d.questions.forEach((q, i) => {
		const n = i + 1;
		const points = Number(q.points);
		if (q.points.trim() === '' || !Number.isFinite(points) || points < 0 || points > 999.99) {
			issues.push({ code: 'points', n });
		} else {
			total += points;
		}
		if (!q.textEn.trim() || !q.textAr.trim()) issues.push({ code: 'questionText', n });
		if (q.options.length < 2) issues.push({ code: 'optionsMin', n });
		if (q.options.some((o) => !o.optionTextEn.trim() || !o.optionTextAr.trim()))
			issues.push({ code: 'optionText', n });
		if (q.questionType === 'true_false' && q.options.length !== 2)
			issues.push({ code: 'trueFalseOptions', n });
		const correct = q.options.filter((o) => o.isCorrect).length;
		if (q.questionType !== 'multiple_choice' && correct !== 1)
			issues.push({ code: 'oneCorrect', n });
		if (q.questionType === 'multiple_choice' && correct < 1)
			issues.push({ code: 'someCorrect', n });
	});

	if (!issues.some((i) => i.code === 'passingScore') && passing > total) {
		issues.push({ code: 'passingTooHigh', passing, total });
	}
	return issues;
}
