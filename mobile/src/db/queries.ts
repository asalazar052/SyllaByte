import { and, asc, desc, eq, gte, inArray, isNotNull, lte, sql } from 'drizzle-orm';

import { importantEventTypes } from '@/domain/event-types';
import { normalizeSearch } from '@/lib/input';

import { db } from './client';
import {
	courseMaterials,
	courses,
	events,
	files,
	notifications,
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

// The syllabus the user uploaded for a course (the newest, if there is more than one). Sample files that
// ship with the app have no upload time, so they don't count.
export const courseSyllabusQuery = (courseId: number) =>
	db.query.files.findFirst({
		where: and(
			eq(files.courseId, courseId),
			eq(files.type, 'syllabus'),
			isNotNull(files.uploadedAt),
		),
		orderBy: [desc(files.version), desc(files.id)],
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

// Items dated `from` ('YYYY-MM-DD') or later, with their course: the ones that can still have a reminder to come.
export const remindableEventsQuery = (from: string) =>
	db.query.events.findMany({ where: gte(events.date, from), with: { course: true } });

// One dated item with the course it belongs to, if any.
export const eventQuery = (id: number) =>
	db.query.events.findFirst({ where: eq(events.id, id), with: { course: true } });

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
export type CourseSyllabus = NonNullable<Awaited<ReturnType<typeof courseSyllabusQuery>>>;
export type UploadedFile = Awaited<ReturnType<typeof filesQuery>>[number];
export type CalendarEventDetail = NonNullable<Awaited<ReturnType<typeof eventQuery>>>;
export type CalendarEvent = Awaited<ReturnType<typeof eventsBetweenQuery>>[number];
export type Professor = Awaited<ReturnType<typeof professorQuery>>[number];
export type OfficeHours = Awaited<ReturnType<typeof officeHoursQuery>>[number];
export type OfficeHoursWithProfessor = Awaited<ReturnType<typeof allOfficeHoursQuery>>[number];

export function filterCourses(courseList: Course[], query: string, reviewOnly: boolean) {
	const normalized = normalizeSearch(query);
	return courseList.filter(
		(course) =>
			(!reviewOnly || course.reviewFields.length > 0) &&
			`${course.code} ${course.title}`.toLowerCase().includes(normalized),
	);
}

// A course's important dates: its exams and quizzes.
export const savedDatesQuery = (courseId?: number) =>
	db
		.select({
			item: {
				id: events.id,
				courseId: events.courseId,
				type: events.type,
				title: events.title,
				date: events.date,
				startTime: events.startTime,
				endTime: events.endTime,
			},
			course: courses,
		})
		.from(events)
		.innerJoin(courses, eq(events.courseId, courses.id))
		.where(
			and(
				inArray(events.type, importantEventTypes),
				courseId !== undefined ? eq(events.courseId, courseId) : undefined,
			),
		)
		.orderBy(events.date, events.startTime);
export type SavedDate = Awaited<ReturnType<typeof savedDatesQuery>>[number];
// Dated items from `from` to `to`, both 'YYYY-MM-DD' and inclusive, soonest first, each with its course (null
// for a reminder that belongs to none). Shaped like a SavedDate so the same card shows it.
export const upcomingDatesQuery = (from: string, to: string) =>
	db
		.select({
			item: {
				id: events.id,
				courseId: events.courseId,
				type: events.type,
				title: events.title,
				date: events.date,
				startTime: events.startTime,
				endTime: events.endTime,
			},
			course: courses,
		})
		.from(events)
		.leftJoin(courses, eq(events.courseId, courses.id))
		.where(and(gte(events.date, from), lte(events.date, to)))
		.orderBy(events.date, sql`${events.startTime} is null`, events.startTime);
export type UpcomingDate = Awaited<ReturnType<typeof upcomingDatesQuery>>[number];
// A course's materials, or those of every course in a semester, or all of them.
export const savedMaterialsQuery = (courseId?: number, semesterId?: number) =>
	db
		.select({ item: courseMaterials, course: courses })
		.from(courseMaterials)
		.innerJoin(courses, eq(courseMaterials.courseId, courses.id))
		.where(
			and(
				courseId !== undefined ? eq(courseMaterials.courseId, courseId) : undefined,
				semesterId !== undefined ? eq(courses.semesterId, semesterId) : undefined,
			),
		)
		.orderBy(courses.code, courseMaterials.title);
export type SavedMaterial = Awaited<ReturnType<typeof savedMaterialsQuery>>[number];

// What the Notifications screen lists, newest first, each with the item it opens if that still exists.
const NOTIFICATIONS_SHOWN = 100;
export const notificationsQuery = () =>
	db.query.notifications.findMany({
		with: { event: true },
		orderBy: [desc(notifications.createdAt), desc(notifications.id)],
		limit: NOTIFICATIONS_SHOWN,
	});
export type NotificationRow = Awaited<ReturnType<typeof notificationsQuery>>[number];
