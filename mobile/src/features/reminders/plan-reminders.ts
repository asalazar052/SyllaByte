// Works out which reminders to schedule. It takes plain data and has no app or native imports, so it can be
// checked on its own.
import { addDays, formatLongDate } from '../../lib/dates';
import { formatTime, joinParts } from '../../lib/format';

export type ReminderEvent = {
	id: number;
	title: string;
	type: string;
	// 'YYYY-MM-DD'
	date: string;
	// Minutes after midnight, if the item has a time.
	startTime: number | null;
	// The item's own reminder. All three are null while it follows the default in settings.
	reminderEnabled: boolean | null;
	reminderDaysAhead: number | null;
	reminderTime: number | null;
	course: { code: string } | null;
};

export type ReminderSettings = {
	defaultRemindersEnabled: boolean;
	reminderDaysAhead: number;
	reminderTime: number;
};

export type PlannedReminder = {
	// Stable for an item, so a reminder can be found and replaced.
	identifier: string;
	eventId: number;
	fireAt: Date;
	title: string;
	body: string;
};

export const REMINDER_ID_PREFIX = 'reminder-';

// iOS keeps at most 64 scheduled notifications and drops the rest, so only the soonest are scheduled. The
// others are picked up the next time reminders are synced, which happens each time the app opens.
export const MAX_SCHEDULED = 60;

// 'YYYY-MM-DD' with minutes after midnight, as a Date in the device's time zone.
function localDate(iso: string, minutes: number) {
	const [year, month, day] = iso.split('-').map(Number);
	return new Date(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
}

export function planReminders(
	events: ReminderEvent[],
	settings: ReminderSettings,
	now: Date,
	typeLabel: (type: string) => string,
): PlannedReminder[] {
	const planned: PlannedReminder[] = [];
	for (const event of events) {
		const custom = event.reminderEnabled !== null;
		const enabled = custom ? event.reminderEnabled : settings.defaultRemindersEnabled;
		if (!enabled) continue;
		const daysAhead = event.reminderDaysAhead ?? settings.reminderDaysAhead;
		const time = event.reminderTime ?? settings.reminderTime;
		const fireAt = localDate(addDays(event.date, -daysAhead), time);
		if (fireAt.getTime() <= now.getTime()) continue;
		planned.push({
			identifier: `${REMINDER_ID_PREFIX}${event.id}`,
			eventId: event.id,
			fireAt,
			title: event.title,
			body: joinParts(
				event.course?.code,
				typeLabel(event.type),
				`${formatLongDate(event.date)}${event.startTime === null ? '' : ` at ${formatTime(event.startTime)}`}`,
			),
		});
	}
	return planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, MAX_SCHEDULED);
}
