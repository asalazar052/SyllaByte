import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';
import type { CalendarEvent, Course } from '@/db/queries';
import { formatShortDate } from '@/lib/dates';
import { formatTime, joinParts } from '@/lib/format';

import { type CalendarItem, categoryInfo, courseColor, formatItemTime } from './calendar-items';
import { EventSymbol } from './event-symbol';

// Pass `onPress` to make the card open the item's details.
export function EventCard({
	item,
	course,
	onPress,
}: {
	item: CalendarItem;
	course?: Course;
	onPress?: () => void;
}) {
	const color = courseColor(course);
	return (
		<Pressable
			accessibilityRole={onPress ? 'button' : undefined}
			accessibilityHint={onPress ? 'Shows this item’s details' : undefined}
			disabled={!onPress}
			onPress={onPress}
			className="flex-row gap-3 rounded-2xl bg-sylla-surface p-3.5 active:opacity-75"
		>
			<View
				className="w-[3px] self-stretch rounded-full"
				style={{ backgroundColor: color }}
			/>
			<View className="min-w-0 flex-1 gap-1.5">
				<View className="flex-row items-start justify-between gap-3">
					{/* The reminder sits beside the course and title, so its second line doesn't push the title down. */}
					<View className="min-w-0 flex-1 gap-1.5">
						{course && (
							<AppText variant="micro" className="text-sylla-muted">
								{course.code} · {course.title}
							</AppText>
						)}
						<AppText variant="label">{item.title}</AppText>
					</View>
					{item.reminder && (
						<View
							className="items-end gap-0.5"
							accessible
							accessibilityLabel={`Reminder, ${formatShortDate(item.reminder.date)} at ${formatTime(item.reminder.time)}`}
						>
							<View className="flex-row items-center gap-1">
								<AppIcon name="alarmClock" size={14} tintColor={SyllaColors.navy} />
								<AppText variant="micro" className="text-sylla-muted">
									{formatShortDate(item.reminder.date)}
								</AppText>
							</View>
							<AppText variant="micro" className="text-sylla-muted">
								{formatTime(item.reminder.time)}
							</AppText>
						</View>
					)}
				</View>
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
		</Pressable>
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
