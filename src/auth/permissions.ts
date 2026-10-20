// Mirrors testback/src/auth/permissions.ts. Used to show or hide UI only:
// the backend enforces the same permissions on every request.
export const Permission = {
	USERS_READ: 'users.read',
	USERS_MANAGE: 'users.manage',
	ROLES_MANAGE: 'roles.manage',
	COURSES_READ: 'courses.read',
	COURSES_CREATE: 'courses.create',
	COURSES_UPDATE: 'courses.update',
	COURSES_DELETE: 'courses.delete',
	EXAMS_MANAGE: 'exams.manage',
	EXAMS_TAKE: 'exams.take',
	ENROLLMENTS_CREATE: 'enrollments.create',
	ENROLLMENTS_MANAGE: 'enrollments.manage',
	PAYMENTS_READ: 'payments.read',
	PAYMENTS_MANAGE: 'payments.manage',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
