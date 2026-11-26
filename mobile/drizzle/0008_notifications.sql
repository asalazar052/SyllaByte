CREATE TABLE `app_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`notifications_checked_at` integer,
	CONSTRAINT "app_state_single_row" CHECK("app_state"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`dedupe_key` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`event_type` text,
	`event_id` integer,
	`course_id` integer,
	`created_at` integer NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_dedupe_key_unique` ON `notifications` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);