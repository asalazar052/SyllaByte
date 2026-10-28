import { relations, sql } from 'drizzle-orm';
import {
	type AnySQLiteColumn,
	check,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from 'drizzle-orm/sqlite-core';

import type { AppIconName } from '@/components/ui/app-icon';

export const semesters = sqliteTable('semesters', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
});

export const professors = sqliteTable('professors', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name'),
	email: text('email'),
});

// Start and end times are set together (or both null), and end is after start.
const timeRange = (startTime: AnySQLiteColumn, endTime: AnySQLiteColumn) =>
	sql`(${startTime} is null) = (${endTime} is null) and (${endTime} is null or ${endTime} > ${startTime})`;

export const courses = sqliteTable(
	'courses',
	{
		id: text('id').primaryKey(),
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
	},
	(table) => [check('courses_time_range', timeRange(table.startTime, table.endTime))],
);

// One set of office hours per professor for each course they teach; every cell is optional.
export const officeHours = sqliteTable(
	'office_hours',
	{
		professorId: integer('professor_id')
			.notNull()
			.references(() => professors.id, { onDelete: 'cascade' }),
		courseId: text('course_id')
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
		primaryKey({ columns: [table.professorId, table.courseId] }),
		check('office_hours_time_range', timeRange(table.startTime, table.endTime)),
	],
);

export const courseReviewFields = sqliteTable('course_review_fields', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	courseId: text('course_id')
		.notNull()
		.references(() => courses.id, { onDelete: 'cascade' }),
	label: text('label').notNull(),
	value: text('value').notNull(),
});

export const semestersRelations = relations(semesters, ({ many }) => ({
	courses: many(courses),
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
}));

export const courseReviewFieldsRelations = relations(courseReviewFields, ({ one }) => ({
	course: one(courses, { fields: [courseReviewFields.courseId], references: [courses.id] }),
}));
