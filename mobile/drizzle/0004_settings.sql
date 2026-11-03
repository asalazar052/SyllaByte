CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text,
	`preferred_name` text,
	`email` text,
	`institution` text,
	`review_before_adding` integer DEFAULT true NOT NULL,
	`default_reminders_enabled` integer DEFAULT true NOT NULL,
	`reminder_days_ahead` integer DEFAULT 3 NOT NULL,
	`reminder_time` integer DEFAULT 540 NOT NULL,
	CONSTRAINT "settings_single_row" CHECK("settings"."id" = 1),
	CONSTRAINT "settings_reminder_days_ahead" CHECK("settings"."reminder_days_ahead" > 0),
	CONSTRAINT "settings_reminder_time" CHECK("settings"."reminder_time" between 0 and 1439)
);
--> statement-breakpoint
-- The one row of settings, with the column defaults.
INSERT INTO `settings` (`id`) VALUES (1);
