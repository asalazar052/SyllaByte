CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`semester_id` integer,
	`course_id` integer,
	`type` text NOT NULL,
	`filename` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`page_count` integer,
	`bytes` integer NOT NULL,
	`checksum` text NOT NULL,
	FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "files_version" CHECK("files"."version" >= 1),
	CONSTRAINT "files_page_count" CHECK("files"."page_count" is null or "files"."page_count" > 0),
	CONSTRAINT "files_bytes" CHECK("files"."bytes" >= 0),
	CONSTRAINT "files_checksum_format" CHECK(length("files"."checksum") = 32 and not "files"."checksum" glob '*[^0-9a-f]*')
);
