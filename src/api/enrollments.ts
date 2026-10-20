import { request } from './client';
import { endpoints } from './endpoints';
import type { Enrollment, MyEnrollment } from '../types/enrollment';

export const enrollInCourse = (courseId: number): Promise<Enrollment> =>
	request<Enrollment>(endpoints.courseEnroll(courseId), { method: 'POST' });

export const listMyEnrollments = (signal?: AbortSignal): Promise<MyEnrollment[]> =>
	request<MyEnrollment[]>(endpoints.myEnrollments, { signal });
