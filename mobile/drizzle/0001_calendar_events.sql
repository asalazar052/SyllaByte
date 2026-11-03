CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` text,
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
CREATE INDEX `events_date_idx` ON `events` (`date`);--> statement-breakpoint
ALTER TABLE `courses` ADD `accent_color` text DEFAULT '#315F85' NOT NULL;