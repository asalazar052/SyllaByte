import { and, eq, gte, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { APP_STATE_ID, appState, events, notifications, settings, SETTINGS_ID } from '@/db/schema';
import { toIsoDate } from '@/lib/dates';

import { recordNotification } from '../notifications/record';
import { reminderText } from '../notifications/text';
import { reminderFireTime, resolveReminder } from '../reminders/resolve';

export function markNotificationRead(id: number) {
	db.update(notifications)
		.set({ readAt: Date.now() })
		.where(and(eq(notifications.id, id), isNull(notifications.readAt)))
		.run();
}

export function markAllNotificationsRead() {
	db.update(notifications).set({ readAt: Date.now() }).where(isNull(notifications.readAt)).run();
}

// The most reminders recorded in one go, for when the app hasn't been opened in a long while.
const MAX_RECORDED_AT_ONCE = 50;

// Records the reminders that have gone off since the last time it ran, each at the moment it went off. A
// reminder is recorded once however often this runs. The first run only notes the time, so nothing from before
// the app was in use is recorded. A reminder is recorded whether or not the phone was allowed to show it: the
// list says what came due, not what was delivered.
//
// "Since the last time it ran" is what keeps a reminder that was already past when its item was added or
// changed from being recorded, since it never went off. That only holds if this runs just before such a change,
// so the commands that make one call catchUpReminders first.
export function recordFiredReminders(now = new Date()) {
	db.transaction((tx) => {
		const nowMs = now.getTime();
		const checkedAt =
			tx
				.select({ at: appState.notificationsCheckedAt })
				.from(appState)
				.where(eq(appState.id, APP_STATE_ID))
				.get()?.at ?? null;
		tx.insert(appState)
			.values({ id: APP_STATE_ID, notificationsCheckedAt: nowMs })
			.onConflictDoUpdate({ target: appState.id, set: { notificationsCheckedAt: nowMs } })
			.run();
		if (checkedAt === null) return;
		// If the clock was set back, nothing between the two times is looked at again. A reminder that was already
		// recorded is never recorded twice either way, and a clock set far ahead can't hold recording back later.
		const since = Math.min(checkedAt, nowMs);

		const defaults = tx.select().from(settings).where(eq(settings.id, SETTINGS_ID)).get();
		if (!defaults) return;
		// A reminder can't go off before the day it is set for, so items dated earlier can't be among them.
		const candidates = tx.query.events
			.findMany({
				where: gte(events.date, toIsoDate(new Date(since))),
				with: { course: true },
			})
			.sync();
		const fired = [];
		for (const event of candidates) {
			const reminder = resolveReminder(event, defaults);
			if (!reminder.enabled) continue;
			const fire = reminderFireTime(event.date, reminder);
			const at = fire.at.getTime();
			if (at > since && at <= nowMs) fired.push({ event, reminder, fire, at });
		}
		fired.sort((a, b) => b.at - a.at);
		for (const { event, reminder, fire, at } of fired.slice(0, MAX_RECORDED_AT_ONCE)) {
			recordNotification(tx, {
				kind: 'reminder',
				dedupeKey: `reminder:${event.id}:${fire.date}:${fire.time}`,
				...reminderText(event, reminder.daysAhead),
				eventType: event.type,
				eventId: event.id,
				courseId: event.courseId,
				createdAt: at,
			});
		}
	});
}

// Records the reminders that have gone off up to now, and never throws, so a problem with this can't stop what
// the user asked for. Call it just before a change that could move when a reminder goes off (adding, moving or
// deleting an item, changing a reminder, or saving a course).
export function catchUpReminders() {
	try {
		recordFiredReminders();
	} catch (error) {
		console.warn('Could not record reminders that went off', error);
	}
}
