import { SyllaColors } from '@/constants/theme';
import type { CalendarEvent, Course, OfficeHoursWithProfessor } from '@/db/queries';
import type { EventType } from '@/db/schema';
import { dayOfWeek } from '@/lib/dates';
import { type DayCode, formatTime, formatTimeRange, parseDays } from '@/lib/format';

import type { SymbolShape } from './event-symbol';

export type EventCategory = 'due' | 'exam' | 'officeHours' | 'reminder';

// A marker's shape says which category it is; its color says which course it belongs to.
export const categoryInfo: Record<EventCategory, { label: string; shape: SymbolShape }> = {
	due: { label: 'Due dates', shape: 'circle' },
	exam: { label: 'Exams & quizzes', shape: 'triangle' },
	officeHours: { label: 'Office hours', shape: 'square' },
	reminder: { label: 'Reminders', shape: 'diamond' },
};

export const eventTypeInfo: Record<EventType, { label: string; category: EventCategory }> = {
	assignment: { label: 'Assignment', category: 'due' },
	lab_report: { label: 'Lab report', category: 'due' },
	quiz: { label: 'Quiz', category: 'exam' },
	exam: { label: 'Exam', category: 'exam' },
	reminder: { label: 'Reminder', category: 'reminder' },
};

const NO_COURSE_COLOR = SyllaColors.muted;

export function courseColor(course: Course | undefined) {
	return course?.accentColor ?? NO_COURSE_COLOR;
}

export const eventCategories = Object.keys(categoryInfo) as EventCategory[];

// The categories the user has turned off, read back from storage. Anything that isn't a known category
// is dropped, so a stored value from an older version can't hide something by accident.
export function parseHiddenCategories(stored: unknown) {
	return Array.isArray(stored)
		? eventCategories.filter((category) => stored.includes(category))
		: [];
}

// What the calendar lists for a day: a dated event, or one occurrence of a weekly set of office hours.
export type CalendarItem = {
	key: string;
	date: string;
	courseId: number | null;
	category: EventCategory;
	title: string;
	typeLabel: string;
	startTime: number | null;
	endTime: number | null;
};

export function eventItem(event: CalendarEvent): CalendarItem {
	const { label, category } = eventTypeInfo[event.type];
	return {
		key: `event-${event.id}`,
		date: event.date,
		courseId: event.courseId,
		category,
		title: event.title,
		typeLabel: label,
		startTime: event.startTime,
		endTime: event.endTime,
	};
}

// Weekday numbers as Date.getDay() counts them, matching the stored day codes.
const WEEKDAYS: Record<DayCode, number> = { Su: 0, M: 1, T: 2, W: 3, Th: 4, F: 5, Sa: 6 };

// Repeats each set of office hours on its days of the week, on whichever of `dates` fall on those days.
export function officeHoursItems(
	officeHours: OfficeHoursWithProfessor[],
	dates: string[],
): CalendarItem[] {
	return officeHours.flatMap((hours) => {
		const weekdays = new Set(parseDays(hours.days ?? '').map((code) => WEEKDAYS[code]));
		return dates
			.filter((date) => weekdays.has(dayOfWeek(date)))
			.map((date): CalendarItem => ({
				key: `office-hours-${hours.id}-${date}`,
				date,
				courseId: hours.courseId,
				category: 'officeHours',
				title: hours.professor?.name ?? 'Office hours',
				typeLabel: 'Office hours',
				startTime: hours.startTime,
				endTime: hours.endTime,
			}));
	});
}

// Earlier items first; an item with no time goes last.
export function compareByTime(a: CalendarItem, b: CalendarItem) {
	return (a.startTime ?? 24 * 60) - (b.startTime ?? 24 * 60);
}

// '11:59 PM' for a due time, '9:00–9:50 AM' for a span, and '' for an item with no time.
export function formatItemTime({
	startTime,
	endTime,
}: {
	startTime: number | null;
	endTime: number | null;
}) {
	if (startTime === null) return '';
	return formatTimeRange(startTime, endTime) || formatTime(startTime);
}
