import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { goBackOr, PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import {
	eventsWithCoursesQuery,
	filesQuery,
	reviewFieldCoursesQuery,
	settingsQuery,
} from '@/db/queries';
import { useStoredState } from '@/hooks/use-stored-state';
import { toIsoDate } from '@/lib/dates';
import { showEventOnCalendar } from '@/lib/show-event';

import { type AppNotification, buildNotifications, dayHeading } from './build-notifications';
import { NotificationCard } from './notification-card';

// The notifications the user has opened or marked as read, remembered on the device.
function parseReadIds(stored: unknown) {
	return Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [];
}

export function NotificationsScreen() {
	const now = new Date();
	const today = toIsoDate(now);
	const { data: events } = useLiveQuery(eventsWithCoursesQuery());
	const { data: files } = useLiveQuery(filesQuery());
	const { data: reviewFields } = useLiveQuery(reviewFieldCoursesQuery());
	const { data: settings } = useLiveQuery(settingsQuery());
	const [readIds, setReadIds] = useStoredState<string[]>(
		'notifications.readIds',
		[],
		parseReadIds,
	);

	const reviewCounts = new Map<number, number>();
	for (const { courseId } of reviewFields) {
		reviewCounts.set(courseId, (reviewCounts.get(courseId) ?? 0) + 1);
	}
	const notifications = buildNotifications({ events, files, reviewCounts, settings, now });
	const isUnread = (notification: AppNotification) => !readIds.includes(notification.id);
	const unreadCount = notifications.filter(isUnread).length;

	const groups: { day: string; items: AppNotification[] }[] = [];
	for (const notification of notifications) {
		const day = toIsoDate(notification.at);
		const group = groups.find((item) => item.day === day);
		if (group) group.items.push(notification);
		else groups.push({ day, items: [notification] });
	}

	function open(notification: AppNotification) {
		if (isUnread(notification)) setReadIds([...readIds, notification.id]);
		const { target } = notification;
		if (target.kind === 'event') showEventOnCalendar(target.event);
		else router.push({ pathname: '/courses/[id]', params: { id: target.id } });
	}

	return (
		<Screen>
			<PageHeader
				parent="HOME"
				backLabel="Back to home"
				onBack={() => goBackOr('/home')}
				title="Notifications"
			/>
			{notifications.length === 0 ? (
				<AppCard>
					<AppText variant="heading">Nothing yet</AppText>
					<AppText className="text-sylla-muted">
						Reminders for your due dates and updates on your syllabi will show up here.
					</AppText>
				</AppCard>
			) : (
				<>
					<View className="flex-row items-center justify-between gap-3">
						<View className="rounded-full bg-sylla-paleBlue/60 px-2.5 py-1.5">
							<AppText
								className="font-inter-semibold text-[11px] text-sylla-blue"
								accessibilityLiveRegion="polite"
							>
								{unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`}
							</AppText>
						</View>
						{unreadCount > 0 && (
							<Pressable
								accessibilityRole="button"
								onPress={() => setReadIds(notifications.map((item) => item.id))}
								hitSlop={12}
								className="active:opacity-70"
							>
								<AppText variant="action" className="text-sylla-blue">
									Mark all as read
								</AppText>
							</Pressable>
						)}
					</View>
					{groups.map(({ day, items }) => (
						<View key={day} className="gap-2.5">
							<AppText
								variant="eyebrow"
								accessibilityRole="header"
								className="text-sylla-blue"
							>
								{dayHeading(day, today)}
							</AppText>
							{items.map((notification) => (
								<NotificationCard
									key={notification.id}
									notification={notification}
									unread={isUnread(notification)}
									today={today}
									onPress={() => open(notification)}
								/>
							))}
						</View>
					))}
				</>
			)}
		</Screen>
	);
}
