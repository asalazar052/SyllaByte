import { useEffect } from 'react';
import { AppState } from 'react-native';

import { onTablesChanged } from '@/db/change-bus';
import { events, settings } from '@/db/schema';
import { recordFiredReminders } from '@/domain/commands';
import { plannedReminders } from '@/domain/reminders/upcoming';

import { configureReminders, type OpenEvent, syncReminders, useReminderTaps } from './reminders';

// Wake just after a reminder's time, so it has gone off by the time the app looks. And never wait longer than an
// hour, so a clock that jumped or a timer that was held back is caught up soon after.
const SETTLE_MS = 1000;
const LONGEST_WAIT_MS = 60 * 60 * 1000;

// Keeps reminders in step with the calendar and the reminder settings, and records them in the notification
// list as they go off. It renders nothing, so it can sit anywhere under the root layout. `onOpenEvent` shows
// the item when its reminder is tapped.
//
// It runs when the app opens, whenever the app returns to the front, whenever the items or settings change
// (including changes it didn't make itself, such as a cascading delete), and when the next reminder is due.
export function ReminderSync({ onOpenEvent }: { onOpenEvent: OpenEvent }) {
	useEffect(() => {
		configureReminders();
		let timer: ReturnType<typeof setTimeout> | undefined;

		function refresh() {
			clearTimeout(timer);
			try {
				recordFiredReminders();
				const next = plannedReminders()[0];
				if (next) {
					const wait = Math.max(next.fireAt.getTime() - Date.now(), 0) + SETTLE_MS;
					timer = setTimeout(refresh, Math.min(wait, LONGEST_WAIT_MS));
				}
			} catch (error) {
				console.warn('Could not look for reminders that went off', error);
			}
			void syncReminders();
		}

		refresh();
		const stopWatching = onTablesChanged([events, settings], refresh);
		const appState = AppState.addEventListener('change', (state) => {
			if (state === 'active') refresh();
		});
		return () => {
			clearTimeout(timer);
			stopWatching();
			appState.remove();
		};
	}, []);

	useReminderTaps(onOpenEvent);
	return null;
}
