import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';
import { lighten } from '@/lib/colors';
import { dayOfMonth, formatLongDate, formatMonth } from '@/lib/dates';

import {
	type CalendarItem,
	categoryInfo,
	eventCategories,
	type EventCategory,
} from './calendar-items';
import { EventSymbol } from './event-symbol';

const WEEKDAY_HEADINGS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MAX_MARKERS = 3;

function DayCell({
	date,
	inMonth,
	isToday,
	isSelected,
	items,
	colorOf,
	onPress,
}: {
	date: string;
	inMonth: boolean;
	isToday: boolean;
	isSelected: boolean;
	items: CalendarItem[];
	colorOf: (courseId: number | null) => string;
	onPress: () => void;
}) {
	// One marker for each category and course color on the day, so two assignments for the same course show once.
	const markers = eventCategories
		.flatMap((category) => {
			const colors = new Set(
				items
					.filter((item) => item.category === category)
					.map((item) => colorOf(item.courseId)),
			);
			return [...colors].map((color) => ({ category, color }));
		})
		.slice(0, MAX_MARKERS);
	const background = isSelected ? 'bg-sylla-navy' : isToday ? 'bg-sylla-paleBlue' : '';
	const color = isSelected ? 'text-white' : inMonth ? undefined : 'text-sylla-softBlue';
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${formatLongDate(date)}, ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
			aria-selected={isSelected}
			onPress={onPress}
			className={`min-h-8 flex-1 items-center justify-center gap-1 rounded-small ${background}`}
		>
			<AppText className={color}>{dayOfMonth(date)}</AppText>
			<View className="h-[12px] flex-row gap-0.5">
				{markers.map(({ category, color }) => (
					<EventSymbol
						key={`${category}-${color}`}
						shape={categoryInfo[category].shape}
						color={isSelected ? lighten(color, 0.5) : color}
					/>
				))}
			</View>
		</Pressable>
	);
}

export function MonthCalendar({
	month,
	weeks,
	today,
	selected,
	itemsByDate,
	colorOf,
	hiddenCategories,
	onToggleCategory,
	onSelect,
	onChangeMonth,
	onToday,
}: {
	month: string;
	weeks: string[][];
	today: string;
	selected: string;
	itemsByDate: Map<string, CalendarItem[]>;
	colorOf: (courseId: number | null) => string;
	hiddenCategories: EventCategory[];
	onToggleCategory: (category: EventCategory) => void;
	onSelect: (date: string) => void;
	onChangeMonth: (step: -1 | 1) => void;
	onToday: () => void;
}) {
	return (
		<View className="gap-3">
			<View className="flex-row items-center justify-between">
				<AppText variant="section" accessibilityRole="header">
					{formatMonth(month)}
				</AppText>
				<View className="flex-row items-center gap-5">
					<Pressable accessibilityRole="button" onPress={onToday} hitSlop={12}>
						<AppText variant="action" className="text-sylla-blue">
							Today
						</AppText>
					</Pressable>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Previous month"
						onPress={() => onChangeMonth(-1)}
						hitSlop={12}
					>
						<AppIcon name="chevronLeft" size={17} />
					</Pressable>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Next month"
						onPress={() => onChangeMonth(1)}
						hitSlop={12}
					>
						<AppIcon name="chevronRight" size={17} />
					</Pressable>
				</View>
			</View>

			<View className="gap-1">
				<View className="flex-row gap-[5px]" accessible={false}>
					{WEEKDAY_HEADINGS.map((heading, index) => (
						<AppText
							key={index}
							variant="action"
							className="min-w-0 flex-1 text-center text-sylla-muted"
						>
							{heading}
						</AppText>
					))}
				</View>
				{weeks.map((week) => (
					<View key={week[0]} className="flex-row gap-[5px]">
						{week.map((date) => (
							<DayCell
								key={date}
								date={date}
								inMonth={date.startsWith(month.slice(0, 7))}
								isToday={date === today}
								isSelected={date === selected}
								items={itemsByDate.get(date) ?? []}
								colorOf={colorOf}
								onPress={() => onSelect(date)}
							/>
						))}
					</View>
				))}
			</View>

			<View className="flex-row flex-wrap gap-x-[18px] gap-y-1.5">
				{eventCategories.map((category) => {
					const shown = !hiddenCategories.includes(category);
					const { shape, label } = categoryInfo[category];
					return (
						<Pressable
							key={category}
							accessibilityRole="checkbox"
							accessibilityLabel={label}
							aria-checked={shown}
							onPress={() => onToggleCategory(category)}
							hitSlop={8}
							className={`flex-row items-center gap-1.5 active:opacity-75 ${shown ? '' : 'opacity-50'}`}
						>
							<EventSymbol shape={shape} color={SyllaColors.muted} size={8} />
							<AppText
								variant="micro"
								className={`text-sylla-muted ${shown ? '' : 'line-through'}`}
							>
								{label}
							</AppText>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
