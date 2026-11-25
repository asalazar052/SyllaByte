import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { EmptyCard } from '@/components/ui/empty-card';
import { goBackOr, PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { notificationsQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { markAllNotificationsRead, markNotificationRead } from '@/domain/commands';
import { useToday } from '@/hooks/use-now';
import { showEventOnCalendar } from '@/lib/show-event';

import { NotificationCard } from './notification-card';
import {
	type AppNotification,
	dayHeading,
	groupByDay,
	toAppNotification,
} from './notification-display';

export function NotificationsScreen() {
	const today = useToday();
	const { data: rows } = useQuery(notificationsQuery());
	const notifications = rows.map(toAppNotification);
	const unreadCount = notifications.filter((notification) => notification.unread).length;
	const groups = groupByDay(notifications);

	function open(notification: AppNotification) {
		if (notification.unread) markNotificationRead(notification.id);
		const { target } = notification;
		if (target?.kind === 'event') showEventOnCalendar(target.event);
		else if (target?.kind === 'course')
			router.push({ pathname: '/courses/[id]', params: { id: target.id } });
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
				<EmptyCard
					title="Nothing yet"
					message="Reminders for your due dates and updates on your syllabi will show up here."
				/>
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
								onPress={markAllNotificationsRead}
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
