import { and, desc, eq } from 'drizzle-orm';

import { db } from './client';
import { courses, officeHours, professors, semesters } from './schema';

// The most recently added semester is treated as the current one.
export const currentSemesterQuery = () =>
	db.query.semesters.findFirst({ orderBy: desc(semesters.id) });

// useLiveQuery only watches the root table, so each table a screen shows gets its own query.
export const semesterCoursesQuery = (semesterId: number) =>
	db.query.courses.findMany({
		where: eq(courses.semesterId, semesterId),
		with: { reviewFields: true },
	});

export const courseQuery = (id: string) =>
	db.query.courses.findFirst({
		where: eq(courses.id, id),
		with: { semester: true, reviewFields: true },
	});

export const professorQuery = (id: number) =>
	db.select().from(professors).where(eq(professors.id, id));

export const officeHoursQuery = (professorId: number, courseId: string) =>
	db
		.select()
		.from(officeHours)
		.where(and(eq(officeHours.professorId, professorId), eq(officeHours.courseId, courseId)));

export type Course = Awaited<ReturnType<typeof semesterCoursesQuery>>[number];
export type CourseDetail = NonNullable<Awaited<ReturnType<typeof courseQuery>>>;
export type Professor = Awaited<ReturnType<typeof professorQuery>>[number];
export type OfficeHours = Awaited<ReturnType<typeof officeHoursQuery>>[number];

export function filterCourses(courseList: Course[], query: string, reviewOnly: boolean) {
	const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
	return courseList.filter(
		(course) =>
			(!reviewOnly || course.reviewFields.length > 0) &&
			`${course.code} ${course.title}`.toLowerCase().includes(normalized),
	);
}
