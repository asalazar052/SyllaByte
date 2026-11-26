import { router, useLocalSearchParams } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { type ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { EmptyCard } from '@/components/ui/empty-card';
import { Screen } from '@/components/ui/screen';
import { TabHeader } from '@/components/ui/tab-header';
import { useCurrentSemesterCourses, useSettings } from '@/db/hooks';
import {
	allOfficeHoursQuery,
	type CalendarEvent,
	eventsBetweenQuery,
	nextExamQuery,
} from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { eventTypeInfo } from '@/domain/event-types';
import { useToday } from '@/hooks/use-now';
import { useStoredState } from '@/hooks/use-stored-state';
import { courseColor } from '@/lib/colors';
import { addMonths, formatLongDate, monthWeeks, startOfMonth } from '@/lib/dates';
import { isoToDate } from '@/lib/format';
import { plural } from '@/lib/plural';

import {
	type CalendarItem,
	compareByTime,
	eventCategories,
	type EventCategory,
	eventItem,
	officeHoursItems,
	parseHiddenCategories,
} from './calendar-items';
import { CourseFilter } from './course-filter';
import { EventCard, NextExamCard } from './event-card';
import { MonthCalendar } from './month-calendar';

export function CalendarScreen() {
	const today = useToday();
	const [month, setMonth] = useState(() => startOfMonth(today));
	const [selected, setSelected] = useState(today);
	const [courseId, setCourseId] = useState<number | null>(null);
	const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
	// Sent along with a date to show that day: after an item is added, or when a reminder is tapped. `focus`
	// changes on every visit, so going to the same day twice still counts.
	const { date: focusDate, focus } = useLocalSearchParams<{ date?: string; focus?: string }>();
	const [shownFocus, setShownFocus] = useState<string>();
	if (focus && focus !== shownFocus) {
		setShownFocus(focus);
		if (focusDate && isoToDate(focusDate)) {
			setSelected(focusDate);
			setMonth(startOfMonth(focusDate));
		}
	}
	const [hiddenCategories, setHiddenCategories] = useStoredState<EventCategory[]>(
		'calendar.hiddenCategories',
		[],
		parseHiddenCategories,
	);
	const weeks = monthWeeks(month);
	const gridStart = weeks[0][0];
	const gridEnd = weeks[weeks.length - 1][6];
	const { semester, courses } = useCurrentSemesterCourses();
	const { data: monthEvents } = useQuery(eventsBetweenQuery(gridStart, gridEnd), [
		gridStart,
		gridEnd,
	]);
	const { data: officeHours } = useQuery(allOfficeHoursQuery());
	const settings = useSettings();
	const { data: nextExam } = useQuery(nextExamQuery(today, courseId), [today, courseId]);

	const courseById = (id: number | null) => courses.find((course) => course.id === id);
	const items = [
		...monthEvents.map((event) => eventItem(event, settings)),
		...officeHoursItems(
			officeHours.filter((hours) => courseById(hours.courseId)),
			weeks.flat(),
		),
	];
	const itemsByDate = new Map<string, CalendarItem[]>();
	for (const item of items) {
		if (courseId !== null && item.courseId !== courseId) continue;
		if (hiddenCategories.includes(item.category)) continue;
		itemsByDate.set(item.date, [...(itemsByDate.get(item.date) ?? []), item]);
	}
	for (const dayItems of itemsByDate.values()) dayItems.sort(compareByTime);
	const agenda = itemsByDate.get(selected) ?? [];

	function changeMonth(step: -1 | 1) {
		const next = addMonths(month, step);
		setMonth(next);
		setSelected(next === startOfMonth(today) ? today : next);
	}

	function showToday() {
		setMonth(startOfMonth(today));
		setSelected(today);
	}

	function select(date: string) {
		setSelected(date);
		setMonth(startOfMonth(date));
	}

	// Takes the calendar to the exam's day with its course selected, and scrolls up to show it. If the user
	// had turned exams off, they are turned back on, or the exam would not show.
	function showExam(exam: CalendarEvent) {
		const { category } = eventTypeInfo[exam.type];
		if (hiddenCategories.includes(category)) {
			setHiddenCategories(hiddenCategories.filter((hidden) => hidden !== category));
		}
		setCourseId(courseById(exam.courseId) ? exam.courseId : null);
		select(exam.date);
		scrollRef.current?.scrollTo({ y: 0, animated: true });
	}

	function toggleCategory(category: EventCategory) {
		setHiddenCategories(
			hiddenCategories.includes(category)
				? hiddenCategories.filter((hidden) => hidden !== category)
				: [...hiddenCategories, category],
		);
	}

	// Shows one type of item and hides all the others.
	function soloCategory(category: EventCategory) {
		setHiddenCategories(eventCategories.filter((other) => other !== category));
	}

	return (
		<Screen scrollRef={scrollRef}>
			<TabHeader
				eyebrow={`${(semester?.name ?? '').toUpperCase()} / CALENDAR`}
				title="Make room for it all."
				action={{
					icon: 'calendarPlus',
					label: 'Add an item',
					onPress: () =>
						router.push({ pathname: '/calendar/add', params: { date: selected } }),
				}}
			/>

			<MonthCalendar
				month={month}
				weeks={weeks}
				today={today}
				selected={selected}
				itemsByDate={itemsByDate}
				colorOf={(id) => courseColor(courseById(id))}
				hiddenCategories={hiddenCategories}
				onToggleCategory={toggleCategory}
				onSoloCategory={soloCategory}
				onSelect={select}
				onChangeMonth={changeMonth}
				onToday={showToday}
			/>

			<CourseFilter courses={courses} selectedId={courseId} onSelect={setCourseId} />

			<View className="gap-3">
				<View className="flex-row flex-wrap items-center justify-between gap-2">
					<AppText variant="section" accessibilityRole="header">
						{formatLongDate(selected)}
					</AppText>
					<AppText variant="action" className="text-sylla-blue">
						{plural(agenda.length, 'item')}
					</AppText>
				</View>
				{agenda.map((item) => {
					const { eventId } = item;
					return (
						<EventCard
							key={item.key}
							item={item}
							course={courseById(item.courseId)}
							onPress={
								eventId === null
									? undefined
									: () =>
											router.push({
												pathname: '/event/[id]',
												params: { id: eventId },
											})
							}
						/>
					);
				})}
				{agenda.length === 0 && (
					<EmptyCard title="Nothing scheduled" message="No events on this day." />
				)}
			</View>

			{nextExam && (
				<NextExamCard
					event={nextExam}
					course={courseById(nextExam.courseId)}
					onPress={() => showExam(nextExam)}
				/>
			)}
		</Screen>
	);
}
