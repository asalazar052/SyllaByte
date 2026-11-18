import { Pressable, View } from 'react-native';

import { cardClassName } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { type SavedDate } from '@/db/queries';
import { courseColor } from '@/lib/colors';
import {
	dayOfMonth,
	formatCountdown,
	formatLongDate,
	formatMonthShort,
	formatWeekday,
} from '@/lib/dates';
import { eventTypeLabels } from '@/lib/event-types';
import { formatTime, formatTimeRange, joinParts } from '@/lib/format';

// The month and day, on a tile in the color of the course.
function DateTile({ date, color }: { date: string; color: string }) {
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			className="size-[52px] items-center justify-center rounded-small"
			style={{ backgroundColor: color }}
		>
			<AppText
				className="font-inter-semibold text-[9px] text-sylla-white"
				style={{ lineHeight: 11 }}
			>
				{formatMonthShort(date).toUpperCase()}
			</AppText>
			<AppText
				className="font-inter-semibold text-[22px] text-sylla-white"
				style={{ lineHeight: 26 }}
			>
				{dayOfMonth(date)}
			</AppText>
		</View>
	);
}

// One exam or quiz. `today` is the day its countdown counts from. `onPress` is left out where the card
// has nowhere to go.
export function ImportantDateCard({
	date,
	today,
	onPress,
}: {
	date: SavedDate;
	today: string;
	onPress?: () => void;
}) {
	const { item, course } = date;
	const type = eventTypeLabels[item.type];
	const when = joinParts(
		formatWeekday(item.date),
		item.startTime === null
			? 'All day'
			: formatTimeRange(item.startTime, item.endTime) || formatTime(item.startTime),
	);
	const content = (
		<>
			<DateTile date={item.date} color={courseColor(course)} />
			<View className="min-w-0 flex-1 gap-[5px]">
				<View
					className={`flex-row items-start justify-between gap-2 ${onPress ? '-mr-7' : ''}`}
				>
					<AppText className="font-inter-semibold text-[9px] text-sylla-blue">
						{type.toUpperCase()}
					</AppText>
					<AppText className="text-[9px] text-sylla-muted">
						{formatCountdown(item.date, today)}
					</AppText>
				</View>
				<AppText className="font-inter-semibold text-xs" numberOfLines={2}>
					{item.title}
				</AppText>
				<AppText className="text-[10px] text-sylla-muted">{when}</AppText>
				{course.isSample && (
					<AppText className="text-[10px] text-sylla-brown">Sample data</AppText>
				)}
			</View>
			{onPress && <AppIcon name="chevron" size={15} />}
		</>
	);
	const className = `${cardClassName} flex-row items-center gap-[13px] p-[13px]`;
	const label = `${type}, ${item.title}, ${formatLongDate(item.date)}, ${when}`;
	return onPress ? (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityHint="Shows this on the calendar"
			onPress={onPress}
			className={`${className} active:opacity-70`}
		>
			{content}
		</Pressable>
	) : (
		<View accessible accessibilityLabel={label} className={className}>
			{content}
		</View>
	);
}
