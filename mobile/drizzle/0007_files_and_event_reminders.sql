PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`semester_id` integer,
	`course_id` integer,
	`type` text NOT NULL,
	`filename` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`page_count` integer,
	`bytes` integer NOT NULL,
	`checksum` text,
	`storage_path` text,
	`uploaded_at` integer,
	FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "files_version" CHECK("__new_files"."version" >= 1),
	CONSTRAINT "files_page_count" CHECK("__new_files"."page_count" is null or "__new_files"."page_count" > 0),
	CONSTRAINT "files_bytes" CHECK("__new_files"."bytes" >= 0),
	CONSTRAINT "files_checksum_format" CHECK(length("__new_files"."checksum") = 32 and not "__new_files"."checksum" glob '*[^0-9a-f]*')
);
--> statement-breakpoint
INSERT INTO `__new_files`("id", "semester_id", "course_id", "type", "filename", "version", "page_count", "bytes", "checksum") SELECT "id", "semester_id", "course_id", "type", "filename", "version", "page_count", "bytes", "checksum" FROM `files`;--> statement-breakpoint
DROP TABLE `files`;--> statement-breakpoint
ALTER TABLE `__new_files` RENAME TO `files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `courses` DROP COLUMN `syllabus_name`;--> statement-breakpoint
ALTER TABLE `courses` DROP COLUMN `syllabus_path`;--> statement-breakpoint
ALTER TABLE `courses` DROP COLUMN `syllabus_uploaded_at`;--> statement-breakpoint
ALTER TABLE `events` ADD `reminder_enabled` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `reminder_days_ahead` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `reminder_time` integer;--> statement-breakpoint
-- The type once called "reminder" is now "other".
UPDATE `events` SET `type` = 'other' WHERE `type` = 'reminder';
