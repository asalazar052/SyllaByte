import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { settings, SETTINGS_ID } from '@/db/schema';

import { ports } from '../ports';

type SettingsEdit = Partial<Omit<typeof settings.$inferInsert, 'id'>>;

export function updateSettings(values: SettingsEdit) {
	db.update(settings).set(values).where(eq(settings.id, SETTINGS_ID)).run();
	// Turning reminders on is the moment to ask to send notifications.
	if (values.defaultRemindersEnabled) void ports.requestNotificationPermission();
}
