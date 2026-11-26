import { remindableEventsQuery, settingsQuery } from '@/db/queries';
import { toIsoDate } from '@/lib/dates';

import { type PlannedReminder, planReminders } from './plan';

// The reminders still to go off, soonest first, as the calendar and the settings call for right now.
export function plannedReminders(now = new Date()): PlannedReminder[] {
	const settings = settingsQuery().sync();
	if (!settings) return [];
	return planReminders(remindableEventsQuery(toIsoDate(now)).sync(), settings, now);
}

// Changes whenever when a reminder goes off or what it says changes, so a reminder already scheduled can be
// told from one that has gone stale.
export function reminderSignature({ fireAt, title, body }: PlannedReminder) {
	return `${fireAt.getTime()}|${title}|${body}`;
}
