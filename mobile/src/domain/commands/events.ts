import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { events, settings, SETTINGS_ID } from '@/db/schema';

import { type EventType } from '../event-types';
import { ports } from '../ports';
import {
	defaultReminder,
	type ItemReminder,
	NO_OWN_REMINDER,
	reminderToFields,
} from '../reminders/resolve';

export type NewEvent = {
	courseId: number | null;
	type: EventType;
	title: string;
	// 'YYYY-MM-DD'
	date: string;
	// Minutes after midnight.
	startTime: number | null;
	notes: string | null;
	// The reminder the item ends up with. If it matches the default, the item keeps following the default.
	reminder: ItemReminder;
};

export type EventEdit = Partial<
	Pick<
		typeof events.$inferInsert,
		'courseId' | 'type' | 'title' | 'date' | 'startTime' | 'endTime' | 'location' | 'notes'
	>
>;

function currentDefaults() {
	return defaultReminder(db.select().from(settings).where(eq(settings.id, SETTINGS_ID)).get());
}

// Adds a dated item to the calendar.
export function createEvent({ reminder, ...values }: NewEvent) {
	const { id } = db
		.insert(events)
		.values({ ...values, ...reminderToFields(reminder, currentDefaults()) })
		.returning({ id: events.id })
		.get();
	// A reminder was set, so this is the moment to ask to send notifications.
	if (reminder.enabled) void ports.requestNotificationPermission();
	return id;
}

export function updateEvent(id: number, edit: EventEdit) {
	db.update(events).set(edit).where(eq(events.id, id)).run();
}

// Gives an item its own reminder. One that matches the default goes back to following the default.
export function setEventReminder(id: number, reminder: ItemReminder) {
	db.update(events)
		.set(reminderToFields(reminder, currentDefaults()))
		.where(eq(events.id, id))
		.run();
	if (reminder.enabled) void ports.requestNotificationPermission();
}

// Takes an item back to the default reminder.
export function resetEventReminder(id: number) {
	db.update(events).set(NO_OWN_REMINDER).where(eq(events.id, id)).run();
}

// Removes a dated item from the calendar. Its scheduled reminder goes with it when reminders next sync.
export function deleteEvent(id: number) {
	db.delete(events).where(eq(events.id, id)).run();
}
