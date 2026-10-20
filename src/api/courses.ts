import { request } from './client';
import { endpoints } from './endpoints';
import type { Course, CourseDetail, CourseList, ListCoursesParams } from '../types/courses';

export const listCourses = (params: ListCoursesParams, signal?: AbortSignal): Promise<CourseList> =>
	request<CourseList>(endpoints.courses, { params: { ...params }, signal });

export const getCourse = (id: number, signal?: AbortSignal): Promise<CourseDetail> =>
	request<CourseDetail>(endpoints.course(id), { signal });

// Every course of a list in as few calls as possible (the server allows up to
// 100 per page), so the page can filter and paginate on its own.
export const fetchAllCourses = async (
	params: Omit<ListCoursesParams, 'page' | 'limit'>,
	signal?: AbortSignal
): Promise<Course[]> => {
	const limit = 100;
	const first = await listCourses({ ...params, page: 1, limit }, signal);
	const items = [...first.items];
	for (let page = 2; items.length < first.total; page++) {
		const next = await listCourses({ ...params, page, limit }, signal);
		if (next.items.length === 0) break;
		items.push(...next.items);
	}
	return items;
};
