import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';

import { db } from './client';
import {
	courses,
	events,
	files,
	officeHours,
	professors,
	semesters,
	settings,
	SETTINGS_ID,
} from './schema';

// The one row of settings, which the migration that adds the table creates.
export const settingsQuery = () =>
	db.query.settings.findFirst({ where: eq(settings.id, SETTINGS_ID) });

// The most recently added semester is treated as the current one.
export const currentSemesterQuery = () =>
	db.query.semesters.findFirst({ orderBy: desc(semesters.id) });

// Every semester, newest first, which is also the order currentSemesterQuery picks from.
export const semestersQuery = () => db.query.semesters.findMany({ orderBy: desc(semesters.id) });

// Just what a semester's course count and credit total need.
export const courseCreditsQuery = () =>
	db.query.courses.findMany({ columns: { semesterId: true, credits: true } });

// useLiveQuery only watches the root table, so each table a screen shows gets its own query.
export const semesterCoursesQuery = (semesterId: number) =>
	db.query.courses.findMany({
		where: eq(courses.semesterId, semesterId),
		with: { reviewFields: true },
	});

export const courseQuery = (id: number) =>
	db.query.courses.findFirst({
		where: eq(courses.id, id),
		with: { semester: true, reviewFields: true },
	});

export const professorQuery = (id: number) =>
	db.select().from(professors).where(eq(professors.id, id));

export const officeHoursQuery = (professorId: number, courseId: number) =>
	db
		.select()
		.from(officeHours)
		.where(and(eq(officeHours.professorId, professorId), eq(officeHours.courseId, courseId)));

// Events dated from `from` to `to`, both 'YYYY-MM-DD' and inclusive. Untimed events sort last within a day.
export const eventsBetweenQuery = (from: string, to: string) =>
	db.query.events.findMany({
		where: and(gte(events.date, from), lte(events.date, to)),
		orderBy: [asc(events.date), asc(sql`${events.startTime} is null`), asc(events.startTime)],
	});

// The first exam on or after `from`, optionally within one course.
export const nextExamQuery = (from: string, courseId: number | null) =>
	db.query.events.findFirst({
		where: and(
			eq(events.type, 'exam'),
			gte(events.date, from),
			courseId ? eq(events.courseId, courseId) : undefined,
		),
		orderBy: [asc(events.date), asc(events.startTime)],
	});

// Every set of office hours, with its professor. The calendar repeats each one weekly.
export const allOfficeHoursQuery = () =>
	db.query.officeHours.findMany({ with: { professor: true } });

// Every uploaded file with the course it belongs to, newest semester first (files without one come last).
export const filesQuery = () =>
	db.query.files.findMany({
		with: { semester: true, course: true },
		orderBy: [desc(files.semesterId), asc(files.id)],
	});

export type Settings = NonNullable<Awaited<ReturnType<typeof settingsQuery>>>;
export type Semester = Awaited<ReturnType<typeof semestersQuery>>[number];
export type CourseCredits = Awaited<ReturnType<typeof courseCreditsQuery>>[number];
export type Course = Awaited<ReturnType<typeof semesterCoursesQuery>>[number];
export type CourseDetail = NonNullable<Awaited<ReturnType<typeof courseQuery>>>;
export type UploadedFile = Awaited<ReturnType<typeof filesQuery>>[number];
export type CalendarEvent = Awaited<ReturnType<typeof eventsBetweenQuery>>[number];
export type Professor = Awaited<ReturnType<typeof professorQuery>>[number];
export type OfficeHours = Awaited<ReturnType<typeof officeHoursQuery>>[number];
export type OfficeHoursWithProfessor = Awaited<ReturnType<typeof allOfficeHoursQuery>>[number];

export function filterCourses(courseList: Course[], query: string, reviewOnly: boolean) {
	const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
	return courseList.filter(
		(course) =>
			(!reviewOnly || course.reviewFields.length > 0) &&
			`${course.code} ${course.title}`.toLowerCase().includes(normalized),
	);
}
