// Works out which reminders to schedule. It takes plain data, so it needs neither the app nor the device.
import { formatLongDate } from '@/lib/dates';
import { formatTime, joinParts } from '@/lib/format';

import { eventTypeLabel } from '../event-types';
import {
	type EventReminderFields,
	reminderFireTime,
	type ReminderSettings,
	resolveReminder,
} from './resolve';

export type ReminderEvent = EventReminderFields & {
	id: number;
	title: string;
	type: string;
	// 'YYYY-MM-DD'
	date: string;
	// Minutes after midnight, if the item has a time.
	startTime: number | null;
	course: { code: string } | null;
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

export function planReminders(
	events: ReminderEvent[],
	settings: ReminderSettings,
	now: Date,
): PlannedReminder[] {
	const planned: PlannedReminder[] = [];
	for (const event of events) {
		const reminder = resolveReminder(event, settings);
		if (!reminder.enabled) continue;
		const { at: fireAt } = reminderFireTime(event.date, reminder);
		if (fireAt.getTime() <= now.getTime()) continue;
		planned.push({
			identifier: `${REMINDER_ID_PREFIX}${event.id}`,
			eventId: event.id,
			fireAt,
			title: event.title,
			body: joinParts(
				event.course?.code,
				eventTypeLabel(event.type),
				`${formatLongDate(event.date)}${event.startTime === null ? '' : ` at ${formatTime(event.startTime)}`}`,
			),
		});
	}
	return planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, MAX_SCHEDULED);
}
