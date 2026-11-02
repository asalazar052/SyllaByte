import { relations, sql } from 'drizzle-orm';
import {
	type AnySQLiteColumn,
	check,
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import type { AppIconName } from '@/components/ui/app-icon';

import { SyllaColors } from '../constants/palette';

// A start and end are set together (or both null), and end is after start. Times are minutes after
// midnight and dates are 'YYYY-MM-DD', so both compare in order as they are stored.
const pairedRange = (start: AnySQLiteColumn, end: AnySQLiteColumn) =>
	sql`(${start} is null) = (${end} is null) and (${end} is null or ${end} > ${start})`;

// The only row's id; the table holds one set of settings, created by the migration that adds it.
export const SETTINGS_ID = 1;

export const settings = sqliteTable(
	'settings',
	{
		id: integer('id').primaryKey(),
		fullName: text('full_name'),
		preferredName: text('preferred_name'),
		email: text('email'),
		institution: text('institution'),
		reviewBeforeAdding: integer('review_before_adding', { mode: 'boolean' })
			.notNull()
			.default(true),
		defaultRemindersEnabled: integer('default_reminders_enabled', { mode: 'boolean' })
			.notNull()
			.default(true),
		// Whole days before an item's due date.
		reminderDaysAhead: integer('reminder_days_ahead').notNull().default(3),
		// Minutes after midnight, 9:00 AM by default.
		reminderTime: integer('reminder_time')
			.notNull()
			.default(9 * 60),
	},
	(table) => [
		check('settings_single_row', sql`${table.id} = ${sql.raw(String(SETTINGS_ID))}`),
		check('settings_reminder_days_ahead', sql`${table.reminderDaysAhead} > 0`),
		check('settings_reminder_time', sql`${table.reminderTime} between 0 and 1439`),
	],
);

export const semesters = sqliteTable(
	'semesters',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull().unique(),
		// 'YYYY-MM-DD' with no time zone, so dates sort and compare as text.
		startDate: text('start_date'),
		endDate: text('end_date'),
	},
	(table) => [
		check(
			'semesters_date_format',
			sql`${table.startDate} glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' and ${table.endDate} glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'`,
		),
		check('semesters_date_range', pairedRange(table.startDate, table.endDate)),
	],
);

export const professors = sqliteTable('professors', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name'),
	email: text('email'),
});

export const courses = sqliteTable(
	'courses',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		semesterId: integer('semester_id')
			.notNull()
			.references(() => semesters.id, { onDelete: 'cascade' }),
		professorId: integer('professor_id').references(() => professors.id, {
			onDelete: 'set null',
		}),
		code: text('code').notNull(),
		title: text('title').notNull(),
		// Single-letter day codes, e.g. 'MWF' or 'TTh'.
		days: text('days'),
		// Minutes after midnight.
		startTime: integer('start_time'),
		endTime: integer('end_time'),
		location: text('location'),
		credits: integer('credits'),
		icon: text('icon').$type<AppIconName>().notNull(),
		iconBackground: text('icon_background').notNull(),
		// Marks the course's events on the calendar.
		accentColor: text('accent_color').notNull().default(SyllaColors.blue),
	},
	(table) => [check('courses_time_range', pairedRange(table.startTime, table.endTime))],
);

// One set of office hours per professor for each course they teach; every cell is optional.
export const officeHours = sqliteTable(
	'office_hours',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		professorId: integer('professor_id')
			.notNull()
			.references(() => professors.id, { onDelete: 'cascade' }),
		courseId: integer('course_id')
			.notNull()
			.references(() => courses.id, { onDelete: 'cascade' }),
		// Single-letter day codes, e.g. 'MWF' or 'TTh'.
		days: text('days'),
		// Minutes after midnight.
		startTime: integer('start_time'),
		endTime: integer('end_time'),
		location: text('location'),
	},
	(table) => [
		uniqueIndex('office_hours_professor_id_course_id_unique').on(
			table.professorId,
			table.courseId,
		),
		check('office_hours_time_range', pairedRange(table.startTime, table.endTime)),
	],
);

export const eventTypes = ['assignment', 'lab_report', 'quiz', 'exam', 'reminder'] as const;
export type EventType = (typeof eventTypes)[number];

// Dated items on the calendar. Recurring class meetings and weekly office hours stay on courses and
// office_hours, and the calendar adds the office hours itself.
export const events = sqliteTable(
	'events',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		// Optional, so a reminder doesn't have to belong to a course.
		courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
		type: text('type', { enum: eventTypes }).notNull(),
		title: text('title').notNull(),
		// 'YYYY-MM-DD' with no time zone, so dates sort and compare as text.
		date: text('date').notNull(),
		// Minutes after midnight. A due time has only a start; an exam or session has both.
		startTime: integer('start_time'),
		endTime: integer('end_time'),
		location: text('location'),
		notes: text('notes'),
	},
	(table) => [
		index('events_date_idx').on(table.date),
		check(
			'events_date_format',
			sql`${table.date} glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'`,
		),
		check(
			'events_time_range',
			sql`${table.endTime} is null or (${table.startTime} is not null and ${table.endTime} > ${table.startTime})`,
		),
	],
);

export const fileTypes = ['syllabus'] as const;
export type FileType = (typeof fileTypes)[number];

// Files the user has uploaded. Both links are optional, so a file can be kept before it is matched to a
// course, and removing a semester or course removes the files that belong to it.
export const files = sqliteTable(
	'files',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		semesterId: integer('semester_id').references(() => semesters.id, { onDelete: 'cascade' }),
		courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
		type: text('type', { enum: fileTypes }).notNull(),
		filename: text('filename').notNull(),
		// Starts at 1 and goes up each time the file is uploaded again.
		version: integer('version').notNull().default(1),
		// Known for a PDF, and optional for any other kind of file.
		pageCount: integer('page_count'),
		// Size of the file in bytes.
		bytes: integer('bytes').notNull(),
		// MD5 of the file's contents, as 32 lowercase hex digits.
		checksum: text('checksum').notNull(),
	},
	(table) => [
		check('files_version', sql`${table.version} >= 1`),
		check('files_page_count', sql`${table.pageCount} is null or ${table.pageCount} > 0`),
		check('files_bytes', sql`${table.bytes} >= 0`),
		check(
			'files_checksum_format',
			sql`length(${table.checksum}) = 32 and not ${table.checksum} glob '*[^0-9a-f]*'`,
		),
	],
);

export const courseReviewFields = sqliteTable('course_review_fields', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	courseId: integer('course_id')
		.notNull()
		.references(() => courses.id, { onDelete: 'cascade' }),
	label: text('label').notNull(),
	value: text('value').notNull(),
});

export const semestersRelations = relations(semesters, ({ many }) => ({
	courses: many(courses),
	files: many(files),
}));

export const professorsRelations = relations(professors, ({ many }) => ({
	courses: many(courses),
	officeHours: many(officeHours),
}));

export const officeHoursRelations = relations(officeHours, ({ one }) => ({
	professor: one(professors, { fields: [officeHours.professorId], references: [professors.id] }),
	course: one(courses, { fields: [officeHours.courseId], references: [courses.id] }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
	semester: one(semesters, { fields: [courses.semesterId], references: [semesters.id] }),
	professor: one(professors, { fields: [courses.professorId], references: [professors.id] }),
	reviewFields: many(courseReviewFields),
	officeHours: many(officeHours),
	events: many(events),
	files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
	semester: one(semesters, { fields: [files.semesterId], references: [semesters.id] }),
	course: one(courses, { fields: [files.courseId], references: [courses.id] }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
	course: one(courses, { fields: [events.courseId], references: [courses.id] }),
}));

export const courseReviewFieldsRelations = relations(courseReviewFields, ({ one }) => ({
	course: one(courses, { fields: [courseReviewFields.courseId], references: [courses.id] }),
}));
