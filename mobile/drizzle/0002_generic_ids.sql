-- courses.id becomes an autoincrement integer, office_hours gets its own autoincrement id, and every foreign
-- key to courses now points at the integer id. Everything in these tables is seed data for now, so they are
-- rebuilt empty. The semesters and professors are cleared with them so the seed runs again on the next launch.
DROP TABLE `office_hours`;--> statement-breakpoint
DROP TABLE `course_review_fields`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
DROP TABLE `courses`;--> statement-breakpoint
DELETE FROM `semesters`;--> statement-breakpoint
DELETE FROM `professors`;--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`semester_id` integer NOT NULL,
	`professor_id` integer,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`days` text,
	`start_time` integer,
	`end_time` integer,
	`location` text,
	`credits` integer,
	`icon` text NOT NULL,
	`icon_background` text NOT NULL,
	`accent_color` text DEFAULT '#315F85' NOT NULL,
	FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`professor_id`) REFERENCES `professors`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "courses_time_range" CHECK(("courses"."start_time" is null) = ("courses"."end_time" is null) and ("courses"."end_time" is null or "courses"."end_time" > "courses"."start_time"))
);
--> statement-breakpoint
CREATE TABLE `office_hours` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`professor_id` integer NOT NULL,
	`course_id` integer NOT NULL,
	`days` text,
	`start_time` integer,
	`end_time` integer,
	`location` text,
	FOREIGN KEY (`professor_id`) REFERENCES `professors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "office_hours_time_range" CHECK(("office_hours"."start_time" is null) = ("office_hours"."end_time" is null) and ("office_hours"."end_time" is null or "office_hours"."end_time" > "office_hours"."start_time"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `office_hours_professor_id_course_id_unique` ON `office_hours` (`professor_id`,`course_id`);--> statement-breakpoint
CREATE TABLE `course_review_fields` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`start_time` integer,
	`end_time` integer,
	`location` text,
	`notes` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "events_date_format" CHECK("events"."date" glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "events_time_range" CHECK("events"."end_time" is null or ("events"."start_time" is not null and "events"."end_time" > "events"."start_time"))
);
--> statement-breakpoint
CREATE INDEX `events_date_idx` ON `events` (`date`);
