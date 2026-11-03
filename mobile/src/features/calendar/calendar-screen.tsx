import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { type ComponentRef, useRef, useState } from 'react';
import { type ScrollView, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import {
	allOfficeHoursQuery,
	type CalendarEvent,
	currentSemesterQuery,
	eventsBetweenQuery,
	nextExamQuery,
	semesterCoursesQuery,
} from '@/db/queries';
import { useStoredState } from '@/hooks/use-stored-state';
import { addMonths, formatLongDate, monthWeeks, startOfMonth, toIsoDate } from '@/lib/dates';

import {
	type CalendarItem,
	compareByTime,
	courseColor,
	type EventCategory,
	eventItem,
	eventTypeInfo,
	officeHoursItems,
	parseHiddenCategories,
} from './calendar-items';
import { CourseFilter } from './course-filter';
import { EventCard, NextExamCard } from './event-card';
import { MonthCalendar } from './month-calendar';

export function CalendarScreen() {
	const today = toIsoDate(new Date());
	const [month, setMonth] = useState(() => startOfMonth(today));
	const [selected, setSelected] = useState(today);
	const [courseId, setCourseId] = useState<number | null>(null);
	const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
	const [hiddenCategories, setHiddenCategories] = useStoredState<EventCategory[]>(
		'calendar.hiddenCategories',
		[],
		parseHiddenCategories,
	);
	const weeks = monthWeeks(month);
	const gridStart = weeks[0][0];
	const gridEnd = weeks[weeks.length - 1][6];
	const { data: semester } = useLiveQuery(currentSemesterQuery());
	const { data: courses } = useLiveQuery(semesterCoursesQuery(semester?.id ?? 0), [semester?.id]);
	const { data: monthEvents } = useLiveQuery(eventsBetweenQuery(gridStart, gridEnd), [
		gridStart,
		gridEnd,
	]);
	const { data: officeHours } = useLiveQuery(allOfficeHoursQuery());
	const { data: nextExam } = useLiveQuery(nextExamQuery(today, courseId), [today, courseId]);

	const courseById = (id: number | null) => courses.find((course) => course.id === id);
	const items = [
		...monthEvents.map(eventItem),
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

	return (
		<Screen scrollRef={scrollRef}>
			<View className="gap-4">
				<View className="min-h-5 flex-row items-center justify-between">
					<AppText variant="eyebrow" className="text-sylla-blue">
						{(semester?.name ?? '').toUpperCase()} / CALENDAR
					</AppText>
					<AppIcon name="calendarPlus" size={21} />
				</View>
				<AppText variant="title" accessibilityRole="header">
					Make room for it all.
				</AppText>
			</View>

			<MonthCalendar
				month={month}
				weeks={weeks}
				today={today}
				selected={selected}
				itemsByDate={itemsByDate}
				colorOf={(id) => courseColor(courseById(id))}
				hiddenCategories={hiddenCategories}
				onToggleCategory={toggleCategory}
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
						{agenda.length} {agenda.length === 1 ? 'item' : 'items'}
					</AppText>
				</View>
				{agenda.map((item) => (
					<EventCard key={item.key} item={item} course={courseById(item.courseId)} />
				))}
				{agenda.length === 0 && (
					<AppCard>
						<AppText variant="heading">Nothing scheduled</AppText>
						<AppText className="text-sylla-muted">No events on this day.</AppText>
					</AppCard>
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
