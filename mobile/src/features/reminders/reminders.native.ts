import { gte } from 'drizzle-orm';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { SyllaColors } from '@/constants/theme';
import { db } from '@/db/client';
import { settingsQuery } from '@/db/queries';
import { events } from '@/db/schema';
import { eventTypeInfo } from '@/features/calendar/calendar-items';
import { toIsoDate } from '@/lib/dates';

import { planReminders, REMINDER_ID_PREFIX } from './plan-reminders';

const CHANNEL_ID = 'reminders';

// Call once at startup. Reminders show as a banner even while the app is open.
export function configureReminders() {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowBanner: true,
			shouldShowList: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
		}),
	});
	if (Platform.OS === 'android') {
		void Notifications.setNotificationChannelAsync(CHANNEL_ID, {
			name: 'Reminders',
			importance: AndroidImportance.DEFAULT,
			lightColor: SyllaColors.blue,
		});
	}
}

async function hasPermission() {
	return (await Notifications.getPermissionsAsync()).granted;
}

// Asks to send notifications if that hasn't been decided yet, and schedules the reminders once it's allowed.
// Call it when the user does something that sets a reminder, so the prompt has a reason. Resolves to whether
// notifications are allowed.
export async function requestReminderPermission() {
	try {
		if (!(await hasPermission())) {
			const current = await Notifications.getPermissionsAsync();
			if (!current.canAskAgain) return false;
			await Notifications.requestPermissionsAsync();
		}
		const allowed = await hasPermission();
		if (allowed) {
			await allowExactTiming();
			await syncReminders();
		}
		return allowed;
	} catch {
		return false;
	}
}

// On Android 12 and later, reminders arrive at their exact time only with the exact alarm permission, and
// Android 14 and later don't grant it by default. Without it they still arrive, a few minutes off. Asking
// opens the system's alarm settings, and does nothing on iOS.
async function allowExactTiming() {
	if (Platform.OS !== 'android') return;
	try {
		if (!(await Notifications.getExactAlarmPermissionsAsync()).granted)
			await Notifications.requestExactAlarmPermissionsAsync();
	} catch {
		/* Reminders still arrive, only less exactly. */
	}
}

async function schedule() {
	const scheduled = await Notifications.getAllScheduledNotificationsAsync();
	// Only reminders are touched, so anything else the app schedules is left alone.
	await Promise.all(
		scheduled
			.filter(({ identifier }) => identifier.startsWith(REMINDER_ID_PREFIX))
			.map(({ identifier }) => Notifications.cancelScheduledNotificationAsync(identifier)),
	);
	if (!(await hasPermission())) return;

	const settings = await settingsQuery();
	if (!settings) return;
	const now = new Date();
	const upcoming = await db.query.events.findMany({
		where: gte(events.date, toIsoDate(now)),
		with: { course: true },
	});
	const reminders = planReminders(upcoming, settings, now, (type) =>
		type in eventTypeInfo ? eventTypeInfo[type as keyof typeof eventTypeInfo].label : type,
	);
	for (const reminder of reminders) {
		await Notifications.scheduleNotificationAsync({
			identifier: reminder.identifier,
			content: {
				title: reminder.title,
				body: reminder.body,
				data: { eventId: reminder.eventId },
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.DATE,
				date: reminder.fireAt,
				channelId: CHANNEL_ID,
			},
		});
	}
}

// Syncs run one at a time, because the app asks for one each time an item or the settings change and two
// running together would schedule the same reminders twice.
let queue: Promise<void> = Promise.resolve();

// Replaces the scheduled reminders with the ones the calendar and settings call for right now.
export function syncReminders() {
	queue = queue.then(schedule).catch(() => {});
	return queue;
}

// How long to wait, once the app's first screen is showing, before opening an item from a tapped
// reminder. A tap that launches the app arrives before the router has finished setting up its first
// screen, and a push made then can be overwritten by that setup.
const COLD_START_DELAY_MS = 350;

// Opens the item when its reminder is tapped, including a tap that started the app.
export function useReminderTaps() {
	const response = Notifications.useLastNotificationResponse();
	const navigationReady = useRootNavigationState()?.key !== undefined;
	// Empty until the router has worked out which screen it's on.
	const firstScreenShowing = useSegments().length > 0;
	useEffect(() => {
		if (!response || !navigationReady || !firstScreenShowing) return;
		if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
		const eventId = Number(response.notification.request.content.data?.eventId);
		const timer = setTimeout(() => {
			// The tap is only used up once the item is open, so a render that cancels the wait doesn't lose it.
			Notifications.clearLastNotificationResponse();
			if (Number.isInteger(eventId) && eventId > 0)
				router.push({ pathname: '/event/[id]', params: { id: eventId } });
		}, COLD_START_DELAY_MS);
		return () => clearTimeout(timer);
	}, [response, navigationReady, firstScreenShowing]);
}
