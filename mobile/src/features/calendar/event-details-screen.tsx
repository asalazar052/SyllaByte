import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { currentSemesterQuery, eventQuery, settingsQuery } from '@/db/queries';

import { categoryInfo, courseColor, eventTypeInfo } from './calendar-items';
import { EventInformation } from './event-information';
import { EventSymbol } from './event-symbol';

function closeDetails() {
	if (router.canGoBack()) router.back();
	else router.replace('/calendar');
}

// What opens over the calendar when an item on it is tapped.
export function EventDetailsScreen() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const eventId = Number.isInteger(Number(id)) ? Number(id) : 0;
	const { data: event, updatedAt } = useLiveQuery(eventQuery(eventId), [eventId]);
	const { data: settings } = useLiveQuery(settingsQuery());
	const { data: semester } = useLiveQuery(currentSemesterQuery());

	return (
		<Screen grabber>
			<AppText variant="eyebrow" className="mt-3 text-sylla-blue">
				{(semester?.name ?? '').toUpperCase()} / CALENDAR
			</AppText>
			{updatedAt === undefined ? null : event ? (
				<>
					<View className="gap-2">
						<View className="flex-row items-center gap-1.5">
							<EventSymbol
								shape={categoryInfo[eventTypeInfo[event.type].category].shape}
								color={courseColor(event.course ?? undefined)}
								size={8}
							/>
							<AppText variant="caption" className="text-sylla-muted">
								{eventTypeInfo[event.type].label}
							</AppText>
						</View>
						<AppText variant="title" accessibilityRole="header">
							{event.title}
						</AppText>
					</View>
					{settings && <EventInformation event={event} settings={settings} />}
				</>
			) : (
				<AppCard>
					<AppText variant="heading">Item not found</AppText>
					<AppText className="text-sylla-muted">
						This item is no longer on your calendar.
					</AppText>
				</AppCard>
			)}
			<Pressable
				accessibilityRole="button"
				className="min-h-11 items-center justify-center"
				onPress={closeDetails}
			>
				<AppText variant="action" className="text-sylla-muted">
					Back to calendar
				</AppText>
			</Pressable>
			<View style={{ height: insets.bottom }} />
		</Screen>
	);
}
