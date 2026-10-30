import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import type { CalendarEvent, Course } from '@/db/queries';
import { formatShortDate } from '@/lib/dates';
import { formatTime, joinParts } from '@/lib/format';

import { type CalendarItem, categoryInfo, courseColor, formatItemTime } from './calendar-items';
import { EventSymbol } from './event-symbol';

export function EventCard({ item, course }: { item: CalendarItem; course?: Course }) {
	const color = courseColor(course);
	return (
		<View className="flex-row gap-3 rounded-2xl bg-sylla-surface p-3.5">
			<View
				className="w-[3px] self-stretch rounded-full"
				style={{ backgroundColor: color }}
			/>
			<View className="min-w-0 flex-1 gap-1.5">
				{course && (
					<AppText variant="micro" className="text-sylla-muted">
						{course.code} · {course.title}
					</AppText>
				)}
				<AppText variant="label">{item.title}</AppText>
				<View className="flex-row items-start justify-between gap-3">
					<View className="flex-row items-center gap-1.5">
						<EventSymbol
							shape={categoryInfo[item.category].shape}
							color={color}
							size={8}
						/>
						<AppText variant="caption" className="text-sylla-muted">
							{item.typeLabel}
						</AppText>
					</View>
					<AppText variant="caption">{formatItemTime(item)}</AppText>
				</View>
			</View>
		</View>
	);
}

export function NextExamCard({
	event,
	course,
	onPress,
}: {
	event: CalendarEvent;
	course?: Course;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityHint="Shows this exam on the calendar"
			onPress={onPress}
			className="gap-2 rounded-2xl bg-sylla-peach p-4 active:opacity-75"
		>
			<View className="flex-row items-start justify-between">
				<AppText variant="micro" className="text-sylla-brown">
					ON THE HORIZON
				</AppText>
				<AppIcon name="alarmClock" size={17} />
			</View>
			<AppText variant="label">
				{course ? `${course.title} · ${event.title}` : event.title}
			</AppText>
			<AppText variant="caption" className="text-sylla-brown">
				{joinParts(
					formatShortDate(event.date),
					event.startTime !== null && formatTime(event.startTime),
					event.location,
				)}
			</AppText>
		</Pressable>
	);
}
