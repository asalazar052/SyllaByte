ALTER TABLE `semesters` ADD `start_date` text;--> statement-breakpoint
ALTER TABLE `semesters` ADD `end_date` text CONSTRAINT "semesters_date_format" CHECK(`start_date` glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' and `end_date` glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]') CONSTRAINT "semesters_date_range" CHECK((`start_date` is null) = (`end_date` is null) and (`end_date` is null or `end_date` > `start_date`));--> statement-breakpoint
-- The mock semester was seeded before it had dates; give it the dates the seed now uses.
UPDATE `semesters` SET `start_date` = '2026-08-31', `end_date` = '2026-12-18' WHERE `name` = 'Fall 2026';
