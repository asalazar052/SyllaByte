CREATE TABLE `course_materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`title` text NOT NULL,
	`details` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `syllabus_name` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `syllabus_path` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `syllabus_uploaded_at` integer;--> statement-breakpoint
ALTER TABLE `courses` ADD `is_sample` integer DEFAULT false NOT NULL;