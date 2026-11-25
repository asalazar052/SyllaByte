import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { settings, SETTINGS_ID } from '@/db/schema';

import { ports } from '../ports';
import { catchUpReminders } from './notifications';

type SettingsEdit = Partial<Omit<typeof settings.$inferInsert, 'id'>>;

export function updateSettings(values: SettingsEdit) {
	// Changing the default reminder changes when every item without its own reminder goes off.
	if (
		values.defaultRemindersEnabled !== undefined ||
		values.reminderDaysAhead !== undefined ||
		values.reminderTime !== undefined
	)
		catchUpReminders();
	db.update(settings).set(values).where(eq(settings.id, SETTINGS_ID)).run();
	// Turning reminders on is the moment to ask to send notifications.
	if (values.defaultRemindersEnabled) void ports.requestNotificationPermission();
}
