CREATE TABLE `course_review_fields` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` text NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
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
	FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`professor_id`) REFERENCES `professors`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "courses_time_range" CHECK(("courses"."start_time" is null) = ("courses"."end_time" is null) and ("courses"."end_time" is null or "courses"."end_time" > "courses"."start_time"))
);
--> statement-breakpoint
CREATE TABLE `office_hours` (
	`professor_id` integer NOT NULL,
	`course_id` text NOT NULL,
	`days` text,
	`start_time` integer,
	`end_time` integer,
	`location` text,
	PRIMARY KEY(`professor_id`, `course_id`),
	FOREIGN KEY (`professor_id`) REFERENCES `professors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "office_hours_time_range" CHECK(("office_hours"."start_time" is null) = ("office_hours"."end_time" is null) and ("office_hours"."end_time" is null or "office_hours"."end_time" > "office_hours"."start_time"))
);
--> statement-breakpoint
CREATE TABLE `professors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text
);
--> statement-breakpoint
CREATE TABLE `semesters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `semesters_name_unique` ON `semesters` (`name`);