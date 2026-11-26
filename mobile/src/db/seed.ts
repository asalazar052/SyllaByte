import { asc, gte } from 'drizzle-orm';

import { SyllaColors } from '@/constants/theme';
import { recordNotification } from '@/domain/notifications/record';
import { reminderText, syllabusText } from '@/domain/notifications/text';
import { daysUntil, toIsoDate } from '@/lib/dates';

import { db } from './client';
import {
	APP_STATE_ID,
	appState,
	courseReviewFields,
	courses,
	events,
	files,
	officeHours,
	professors,
	semesters,
} from './schema';

// Minutes after midnight.
const at = (hour: number, minute = 0) => hour * 60 + minute;

const seedSemester = {
	name: 'Fall 2026',
	startDate: '2026-08-31',
	endDate: '2026-12-18',
	courses: [
		{
			code: 'MATH 201',
			title: 'Calculus II',
			days: 'MWF',
			startTime: at(9),
			endTime: at(9, 50),
			location: 'Science Hall 204',
			credits: 4,
			icon: 'sigma',
			iconBackground: SyllaColors.paleBlue,
			accentColor: SyllaColors.blue,
			professor: {
				name: 'Dr. Maya Chen',
				email: 'mchen@northfield.edu',
				officeHours: {
					days: 'TTh',
					startTime: at(14),
					endTime: at(15),
					location: 'Science Hall 218',
				},
			},
			syllabus: {
				filename: 'MATH201_Syllabus.pdf',
				pageCount: 8,
				bytes: 1243518,
				checksum: 'f269613b58bfe28f6e7b9887a2a12c67',
			},
			reviewFields: [
				{ label: 'Midterm 1', value: 'Sep 28, 2026' },
				{ label: 'Final exam', value: 'Dec 14, 2026' },
			],
		},
		{
			code: 'BIO 110',
			title: 'Intro to Biology',
			days: 'TTh',
			startTime: at(13),
			endTime: at(14, 15),
			location: 'Life Sciences 112',
			credits: 4,
			icon: 'sprout',
			iconBackground: SyllaColors.green,
			accentColor: SyllaColors.forest,
			professor: {
				name: 'Dr. Samuel Okafor',
				email: 'sokafor@northfield.edu',
				officeHours: {
					days: 'MW',
					startTime: at(11),
					endTime: at(12),
					location: 'Life Sciences 230',
				},
			},
			syllabus: {
				filename: 'BIO110_Syllabus.pdf',
				pageCount: 6,
				bytes: 861204,
				checksum: 'ff1560ec4fbb0ec93ece991f4f887ca9',
			},
			reviewFields: [],
		},
		{
			code: 'ENG 210',
			title: 'Literature & Society',
			days: 'MW',
			startTime: at(14),
			endTime: at(15, 15),
			location: 'Humanities 305',
			credits: 3,
			icon: 'feather',
			iconBackground: SyllaColors.purple,
			accentColor: SyllaColors.violet,
			professor: {
				name: 'Dr. Elena Moretti',
				email: 'emoretti@northfield.edu',
				officeHours: {
					days: 'TTh',
					startTime: at(15, 30),
					endTime: at(16, 30),
					location: 'Humanities 340',
				},
			},
			syllabus: {
				filename: 'ENG210_Syllabus.pdf',
				pageCount: 5,
				bytes: 738911,
				checksum: '0316067873507fad9d3ec49c3cb99583',
			},
			reviewFields: [
				{ label: 'Required textbook edition', value: '4th edition — check scan' },
			],
		},
		{
			code: 'PSY 101',
			title: 'Intro to Psychology',
			days: 'TTh',
			startTime: at(10),
			endTime: at(11, 15),
			location: 'Social Sciences 120',
			credits: 3,
			icon: 'brain',
			iconBackground: SyllaColors.peach,
			accentColor: SyllaColors.terracotta,
			professor: {
				name: 'Dr. Priya Raman',
				email: 'praman@northfield.edu',
				officeHours: {
					days: 'MF',
					startTime: at(13),
					endTime: at(14),
					location: 'Social Sciences 214',
				},
			},
			syllabus: {
				filename: 'PSY101_Syllabus.pdf',
				pageCount: 7,
				bytes: 982340,
				checksum: '3e49f0997f9a49b400ea37abaa11036e',
			},
			reviewFields: [],
		},
	],
} as const;

// Dated items for the courses above, which each event names by its code. September matches the
// Calendar design: due dates on the 23rd, 25th and 30th, and exams or quizzes on the 24th and 28th.
const seedEvents: (Omit<typeof events.$inferInsert, 'courseId'> & { course: string | null })[] = [
	{
		course: 'MATH 201',
		type: 'assignment',
		title: 'Problem set 3',
		date: '2026-09-23',
		startTime: at(23, 59),
	},
	{
		course: 'BIO 110',
		type: 'lab_report',
		title: 'Cell structure lab report',
		date: '2026-09-23',
		startTime: at(14),
	},
	{
		course: 'BIO 110',
		type: 'quiz',
		title: 'Quiz 2',
		date: '2026-09-24',
		startTime: at(13),
		endTime: at(13, 20),
		location: 'Life Sciences 112',
	},
	{
		course: 'ENG 210',
		type: 'assignment',
		title: 'Essay draft 1',
		date: '2026-09-25',
		startTime: at(23, 59),
	},
	{
		course: 'MATH 201',
		type: 'exam',
		title: 'Midterm 1',
		date: '2026-09-28',
		startTime: at(9),
		endTime: at(9, 50),
		location: 'Science Hall 204',
		notes: 'Chapters 1–5.',
	},
	{
		course: 'PSY 101',
		type: 'assignment',
		title: 'Participation log',
		date: '2026-09-30',
		startTime: at(17),
	},
	{
		course: 'PSY 101',
		type: 'quiz',
		title: 'Quiz 1',
		date: '2026-10-08',
		startTime: at(10),
		endTime: at(10, 20),
		location: 'Social Sciences 120',
	},
	{
		course: 'MATH 201',
		type: 'assignment',
		title: 'Problem set 4',
		date: '2026-10-09',
		startTime: at(23, 59),
	},
	{
		course: null,
		type: 'other',
		title: 'Last day to withdraw from a course',
		date: '2026-10-16',
		startTime: at(17),
	},
	{
		course: 'PSY 101',
		type: 'quiz',
		title: 'Quiz 2',
		date: '2026-10-22',
		startTime: at(10),
		endTime: at(10, 20),
		location: 'Social Sciences 120',
	},
	{
		course: 'MATH 201',
		type: 'assignment',
		title: 'Problem set 5',
		date: '2026-10-26',
		startTime: at(23, 59),
	},
	{
		course: 'BIO 110',
		type: 'lab_report',
		title: 'Ecosystems lab report',
		date: '2026-10-27',
		startTime: at(14),
	},
	{
		course: null,
		type: 'other',
		title: 'Register for spring classes',
		date: '2026-10-27',
		startTime: at(17),
	},
	{
		course: 'BIO 110',
		type: 'exam',
		title: 'Midterm',
		date: '2026-10-29',
		startTime: at(13),
		endTime: at(14, 15),
		location: 'Life Sciences 112',
	},
	{
		course: 'MATH 201',
		type: 'quiz',
		title: 'Quiz 3',
		date: '2026-10-30',
		startTime: at(9),
		endTime: at(9, 20),
		location: 'Science Hall 204',
	},
	{
		course: 'MATH 201',
		type: 'assignment',
		title: 'Problem set 6',
		date: '2026-11-04',
		startTime: at(23, 59),
	},
	{
		course: 'ENG 210',
		type: 'assignment',
		title: 'Essay draft 2',
		date: '2026-11-09',
		startTime: at(23, 59),
	},
	{
		course: 'PSY 101',
		type: 'exam',
		title: 'Midterm',
		date: '2026-11-12',
		startTime: at(10),
		endTime: at(11, 15),
		location: 'Social Sciences 120',
	},
	{
		course: 'MATH 201',
		type: 'exam',
		title: 'Midterm 2',
		date: '2026-11-16',
		startTime: at(9),
		endTime: at(9, 50),
		location: 'Science Hall 204',
	},
	{
		course: 'BIO 110',
		type: 'lab_report',
		title: 'Photosynthesis lab report',
		date: '2026-11-19',
		startTime: at(14),
	},
	{
		course: 'ENG 210',
		type: 'assignment',
		title: 'Final paper proposal',
		date: '2026-11-30',
		startTime: at(23, 59),
	},
	{
		course: 'PSY 101',
		type: 'assignment',
		title: 'Case study analysis',
		date: '2026-12-03',
		startTime: at(23, 59),
	},
	{
		course: 'ENG 210',
		type: 'assignment',
		title: 'Final paper',
		date: '2026-12-07',
		startTime: at(23, 59),
	},
	{
		course: 'BIO 110',
		type: 'exam',
		title: 'Final exam',
		date: '2026-12-10',
		startTime: at(13),
		endTime: at(15),
		location: 'Life Sciences 112',
	},
	{
		course: 'MATH 201',
		type: 'exam',
		title: 'Final exam',
		date: '2026-12-14',
		startTime: at(8),
		endTime: at(10),
		location: 'Science Hall 204',
	},
	{
		course: 'PSY 101',
		type: 'exam',
		title: 'Final exam',
		date: '2026-12-15',
		startTime: at(10),
		endTime: at(12),
		location: 'Social Sciences 120',
	},
];

// Inserts the mock semester, its syllabi and its events on first launch; does nothing once any semester exists.
export async function seedIfEmpty() {
	db.transaction((tx) => {
		if (tx.select({ id: semesters.id }).from(semesters).limit(1).get()) return;
		const { id: semesterId } = tx
			.insert(semesters)
			.values({
				name: seedSemester.name,
				startDate: seedSemester.startDate,
				endDate: seedSemester.endDate,
			})
			.returning({ id: semesters.id })
			.get();
		const courseIds = new Map<string, number>();
		for (const { reviewFields, professor, syllabus, ...course } of seedSemester.courses) {
			const { officeHours: hours, ...professorValues } = professor;
			const { id: professorId } = tx
				.insert(professors)
				.values(professorValues)
				.returning({ id: professors.id })
				.get();
			const { id: courseId } = tx
				.insert(courses)
				.values({ ...course, semesterId, professorId })
				.returning({ id: courses.id })
				.get();
			courseIds.set(course.code, courseId);
			tx.insert(files)
				.values({ ...syllabus, semesterId, courseId, type: 'syllabus' })
				.run();
			tx.insert(officeHours)
				.values({ ...hours, professorId, courseId })
				.run();
			if (reviewFields.length > 0) {
				tx.insert(courseReviewFields)
					.values(reviewFields.map((field) => ({ ...field, courseId })))
					.run();
			}
		}
		tx.insert(events)
			.values(
				seedEvents.map(({ course, ...event }) => {
					if (course === null) return { ...event, courseId: null };
					const courseId = courseIds.get(course);
					if (courseId === undefined)
						throw new Error(`Seed event for unknown course ${course}`);
					return { ...event, courseId };
				}),
			)
			.run();
		seedNotifications(tx, courseIds);
	});
}

// A few notifications so the Notifications screen has something to show before anything has happened: the two
// soonest items' reminders, as if they had gone off a little while ago, and the first course's syllabus. They
// are written the same way real ones are. The app also notes that it has checked for reminders up to now, so
// reminders from before the first launch aren't recorded afterward.
function seedNotifications(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	courseIds: Map<string, number>,
) {
	const now = Date.now();
	const soonest = tx.query.events
		.findMany({
			where: gte(events.date, toIsoDate(new Date(now))),
			orderBy: [asc(events.date), asc(events.startTime)],
			limit: 2,
			with: { course: true },
		})
		.sync();
	soonest.forEach((event, index) => {
		const createdAt = now - [2, 26][index] * 60 * 60 * 1000;
		const daysAhead = Math.max(0, daysUntil(event.date, toIsoDate(new Date(createdAt))));
		recordNotification(tx, {
			kind: 'reminder',
			dedupeKey: `reminder:${event.id}:seed`,
			...reminderText(event, daysAhead),
			eventType: event.type,
			eventId: event.id,
			courseId: event.courseId,
			createdAt,
		});
	});
	const first = seedSemester.courses[0];
	const courseId = courseIds.get(first.code);
	if (courseId !== undefined) {
		const dateCount = seedEvents.filter((event) => event.course === first.code).length;
		recordNotification(tx, {
			kind: 'syllabus',
			dedupeKey: `syllabus:seed:${courseId}`,
			...syllabusText(first.code, dateCount, first.reviewFields.length),
			courseId,
			createdAt: now - 3 * 24 * 60 * 60 * 1000,
		});
	}
	tx.insert(appState)
		.values({ id: APP_STATE_ID, notificationsCheckedAt: now })
		.onConflictDoNothing()
		.run();
}
