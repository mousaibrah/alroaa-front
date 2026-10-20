import { request } from './client';
import { endpoints } from './endpoints';
import type {
	AdminCourseList,
	CourseInput,
	Exam,
	ExamSaveInput,
	ExamSummary,
	LessonInput,
	SectionInput,
} from '../types/admin';
import type { Course, Lesson, Section } from '../types/courses';

// Admin-only: every course, drafts and other authors' included.
export const listAllCourses = (
	params: { page?: number; limit?: number },
	signal?: AbortSignal
): Promise<AdminCourseList> =>
	request<AdminCourseList>(endpoints.courses, { params: { ...params, all: true }, signal });

export const createCourse = (data: CourseInput) =>
	request<Course>(endpoints.courses, { method: 'POST', body: data });
export const updateCourse = (id: number, data: CourseInput) =>
	request<Course>(endpoints.course(id), { method: 'PATCH', body: data });
export const deleteCourse = (id: number) =>
	request<void>(endpoints.course(id), { method: 'DELETE' });

export const createSection = (courseId: number, data: SectionInput) =>
	request<Section>(endpoints.courseSections(courseId), { method: 'POST', body: data });
export const updateSection = (id: number, data: SectionInput) =>
	request<Section>(endpoints.section(id), { method: 'PATCH', body: data });
export const deleteSection = (id: number) =>
	request<void>(endpoints.section(id), { method: 'DELETE' });
export const reorderSections = (courseId: number, ids: number[]) =>
	request<{ ids: number[] }>(endpoints.courseSectionsOrder(courseId), {
		method: 'PUT',
		body: { ids },
	});

export const createLesson = (sectionId: number, data: LessonInput) =>
	request<Lesson>(endpoints.sectionLessons(sectionId), { method: 'POST', body: data });
export const updateLesson = (id: number, data: LessonInput) =>
	request<Lesson>(endpoints.lesson(id), { method: 'PATCH', body: data });
export const deleteLesson = (id: number) =>
	request<void>(endpoints.lesson(id), { method: 'DELETE' });
export const reorderLessons = (sectionId: number, ids: number[]) =>
	request<{ ids: number[] }>(endpoints.sectionLessonsOrder(sectionId), {
		method: 'PUT',
		body: { ids },
	});

export const listExams = (courseId: number, signal?: AbortSignal) =>
	request<ExamSummary[]>(endpoints.courseExams(courseId), { signal });
export const createExam = (courseId: number, data: { titleEn: string; titleAr: string }) =>
	request<Exam>(endpoints.courseExams(courseId), { method: 'POST', body: data });
export const getExam = (id: number, signal?: AbortSignal) =>
	request<Exam>(endpoints.exam(id), { signal });
export const saveExam = (id: number, data: ExamSaveInput) =>
	request<Exam>(endpoints.exam(id), { method: 'PUT', body: data });
export const deleteExam = (id: number) => request<void>(endpoints.exam(id), { method: 'DELETE' });
