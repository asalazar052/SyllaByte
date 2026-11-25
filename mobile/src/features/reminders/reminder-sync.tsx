import { useEffect } from 'react';
import { AppState } from 'react-native';

import { db } from '@/db/client';
import { settingsQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { recordFiredReminders } from '@/domain/commands';

import { configureReminders, type OpenEvent, syncReminders, useReminderTaps } from './reminders';

// Keeps the scheduled notifications in step with the calendar and the reminder settings. It renders
// nothing, so it can sit anywhere under the root layout. `onOpenEvent` shows the item when its reminder is
// tapped.
function refresh() {
	// Reminders that have gone off are written to the notification list, and the ones still to come are scheduled.
	try {
		recordFiredReminders();
	} catch (error) {
		console.warn('Could not record reminders that went off', error);
	}
	void syncReminders();
}

export function ReminderSync({ onOpenEvent }: { onOpenEvent: OpenEvent }) {
	const { data: events } = useQuery(db.query.events.findMany());
	const { data: settings } = useQuery(settingsQuery());

	useEffect(() => {
		configureReminders();
		// The soonest reminders are scheduled first, so more come in as time passes.
		const subscription = AppState.addEventListener('change', (state) => {
			if (state === 'active') refresh();
		});
		return () => subscription.remove();
	}, []);

	useEffect(() => {
		refresh();
	}, [events, settings]);

	useReminderTaps(onOpenEvent);
	return null;
}
