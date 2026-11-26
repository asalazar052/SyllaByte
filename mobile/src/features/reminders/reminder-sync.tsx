import { useEffect } from 'react';
import { AppState } from 'react-native';

import { catchUpReminders } from '@/domain/commands';
import { plannedReminders } from '@/domain/reminders/upcoming';
import { onRemindersChanged } from '@/domain/reminders/watch';

import { configureReminders, type OpenEvent, syncReminders, useReminderTaps } from './reminders';

// Wake just after a reminder's time, so it has gone off by the time the app looks. And never wait longer than an
// hour, even with nothing due, so a clock that jumped or a timer that was held back is caught up soon after.
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
			// Each step is on its own, so a problem in one doesn't stop the others or the next wake-up.
			catchUpReminders();
			let wait = LONGEST_WAIT_MS;
			try {
				const next = plannedReminders()[0];
				if (next)
					wait = Math.min(
						Math.max(next.fireAt.getTime() - Date.now(), 0) + SETTLE_MS,
						wait,
					);
			} catch (error) {
				console.warn('Could not work out when the next reminder is due', error);
			}
			timer = setTimeout(refresh, wait);
			void syncReminders();
		}

		refresh();
		const stopWatching = onRemindersChanged(refresh);
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
