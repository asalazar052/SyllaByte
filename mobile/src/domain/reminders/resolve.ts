// What reminder an item has and when it goes off. The calendar, the scheduled notifications and the
// notification list all ask here, so they can't disagree. Nothing here depends on React or the device.
import { addDays, dateAtTime } from '@/lib/dates';

export type ItemReminder = {
	enabled: boolean;
	// Whole days before the date.
	daysAhead: number;
	// Minutes after midnight.
	time: number;
};

// The reminder settings that apply to every item without a reminder of its own.
export type ReminderSettings = {
	defaultRemindersEnabled: boolean;
	reminderDaysAhead: number;
	reminderTime: number;
};

// How an item stores its own reminder. All three are null while it follows the default in settings.
export type EventReminderFields = {
	reminderEnabled: boolean | null;
	reminderDaysAhead: number | null;
	reminderTime: number | null;
};

export const NO_OWN_REMINDER: EventReminderFields = {
	reminderEnabled: null,
	reminderDaysAhead: null,
	reminderTime: null,
};

// Used until settings have loaded; these match the defaults the settings table starts with.
export const FALLBACK_REMINDER: ItemReminder = { enabled: true, daysAhead: 3, time: 9 * 60 };

// The default reminder from settings.
export function defaultReminder(settings: ReminderSettings | undefined): ItemReminder {
	return settings
		? {
				enabled: settings.defaultRemindersEnabled,
				daysAhead: settings.reminderDaysAhead,
				time: settings.reminderTime,
			}
		: FALLBACK_REMINDER;
}

// The reminder an item uses: its own if it has one, otherwise the default from settings. An item either has
// all of its own reminder or none of it, so its stored days and time only count once it has switched it on or off.
export function resolveReminder(
	event: EventReminderFields,
	settings: ReminderSettings,
): ItemReminder {
	const defaults = defaultReminder(settings);
	return event.reminderEnabled === null
		? defaults
		: {
				enabled: event.reminderEnabled,
				daysAhead: event.reminderDaysAhead ?? defaults.daysAhead,
				time: event.reminderTime ?? defaults.time,
			};
}

export function isSameReminder(a: ItemReminder, b: ItemReminder) {
	return a.enabled === b.enabled && a.daysAhead === b.daysAhead && a.time === b.time;
}

// What to store for an item's reminder: nothing of its own when it matches the default, so it keeps following
// the default if that changes.
export function reminderToFields(
	reminder: ItemReminder,
	defaults: ItemReminder,
): EventReminderFields {
	return isSameReminder(reminder, defaults)
		? NO_OWN_REMINDER
		: {
				reminderEnabled: reminder.enabled,
				reminderDaysAhead: reminder.daysAhead,
				reminderTime: reminder.time,
			};
}

// When a reminder goes off for an item on `eventDate`: the day ('YYYY-MM-DD'), the time of day in minutes
// after midnight, and the moment itself in the device's time zone.
export function reminderFireTime(eventDate: string, { daysAhead, time }: ItemReminder) {
	const date = addDays(eventDate, -daysAhead);
	return { date, time, at: dateAtTime(date, time) };
}
