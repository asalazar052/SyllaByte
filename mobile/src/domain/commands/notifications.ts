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
// reminder is recorded once however often this runs, and one that was already past when its item was added or
// changed is never recorded, because the phone never sent it. The first run only notes the time, so nothing
// from before the app was in use is recorded.
export function recordFiredReminders(now = new Date()) {
	db.transaction((tx) => {
		const nowMs = now.getTime();
		const checkedAt =
			tx
				.select({ at: appState.notificationsCheckedAt })
				.from(appState)
				.where(eq(appState.id, APP_STATE_ID))
				.get()?.at ?? null;
		// The time never moves backward, so a clock set back can't send reminders out a second time.
		const next = Math.max(checkedAt ?? nowMs, nowMs);
		tx.insert(appState)
			.values({ id: APP_STATE_ID, notificationsCheckedAt: next })
			.onConflictDoUpdate({ target: appState.id, set: { notificationsCheckedAt: next } })
			.run();
		if (checkedAt === null) return;

		const defaults = tx.select().from(settings).where(eq(settings.id, SETTINGS_ID)).get();
		if (!defaults) return;
		// A reminder can't go off before the day it is set for, so items dated earlier can't be among them.
		const candidates = tx.query.events
			.findMany({
				where: gte(events.date, toIsoDate(new Date(checkedAt))),
				with: { course: true },
			})
			.sync();
		const fired = [];
		for (const event of candidates) {
			const reminder = resolveReminder(event, defaults);
			if (!reminder.enabled) continue;
			const fire = reminderFireTime(event.date, reminder);
			const at = fire.at.getTime();
			if (at > checkedAt && at <= nowMs) fired.push({ event, reminder, fire, at });
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
