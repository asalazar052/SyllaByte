import type { db } from '@/db/client';
import { notifications } from '@/db/schema';

export type NewNotification = Omit<typeof notifications.$inferInsert, 'id' | 'readAt'>;

// Writes a notification, unless one with the same `dedupeKey` is already there. It takes the database or a
// transaction, so a command can record a notification in the same transaction as the change it reports.
export function recordNotification(database: Pick<typeof db, 'insert'>, values: NewNotification) {
	database
		.insert(notifications)
		.values(values)
		.onConflictDoNothing({ target: notifications.dedupeKey })
		.run();
}
