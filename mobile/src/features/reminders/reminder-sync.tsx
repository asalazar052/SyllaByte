import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { db } from '@/db/client';
import { settingsQuery } from '@/db/queries';

import { configureReminders, syncReminders, useReminderTaps } from './reminders';

// Keeps the scheduled notifications in step with the calendar and the reminder settings. It renders
// nothing, so it can sit anywhere under the root layout.
export function ReminderSync() {
	const { data: events } = useLiveQuery(db.query.events.findMany());
	const { data: settings } = useLiveQuery(settingsQuery());

	useEffect(() => {
		configureReminders();
		// The soonest reminders are scheduled first, so more come in as time passes.
		const subscription = AppState.addEventListener('change', (state) => {
			if (state === 'active') void syncReminders();
		});
		return () => subscription.remove();
	}, []);

	useEffect(() => {
		void syncReminders();
	}, [events, settings]);

	useReminderTaps();
	return null;
}
