import type { AppIconName } from '@/components/ui/app-icon';
import type { NotificationRow } from '@/db/queries';
import type { EventType } from '@/domain/event-types';
import { addDays, formatMonthDay, toIsoDate } from '@/lib/dates';
import { dateToMinutes, formatTime } from '@/lib/format';

// Each kind of notification has a color: blue for things that are due, brown for exams and green for syllabi.
export type NotificationTone = 'blue' | 'brown' | 'green';

export type AppNotification = {
	id: number;
	at: Date;
	title: string;
	body: string;
	// What kind of notification it is, shown after the time: 'Due date reminder', 'Syllabus scan'.
	kind: string;
	tone: NotificationTone;
	icon: AppIconName;
	unread: boolean;
	// What opening it goes to, or null when what it was about is gone.
	target:
		| { kind: 'event'; event: { id: number; date: string } }
		| { kind: 'course'; id: number }
		| null;
};

type Style = { tone: NotificationTone; icon: AppIconName; kind: string };

const syllabusStyle: Style = { tone: 'green', icon: 'scan', kind: 'Syllabus scan' };

const reminderStyle: Record<EventType, Style> = {
	assignment: { tone: 'blue', icon: 'bell', kind: 'Due date reminder' },
	lab_report: { tone: 'blue', icon: 'calendar', kind: 'Due date reminder' },
	quiz: { tone: 'brown', icon: 'alarmClock', kind: 'Quiz reminder' },
	exam: { tone: 'brown', icon: 'alarmClock', kind: 'Exam reminder' },
	other: { tone: 'blue', icon: 'bell', kind: 'Reminder' },
};

// A stored notification, ready to show.
export function toAppNotification(row: NotificationRow): AppNotification {
	const style = row.kind === 'syllabus' ? syllabusStyle : reminderStyle[row.eventType ?? 'other'];
	return {
		id: row.id,
		at: new Date(row.createdAt),
		title: row.title,
		body: row.body,
		...style,
		unread: row.readAt === null,
		target: row.event
			? { kind: 'event', event: { id: row.event.id, date: row.event.date } }
			: row.courseId !== null
				? { kind: 'course', id: row.courseId }
				: null,
	};
}

// Groups notifications by the day they happened, keeping their order (newest first).
export function groupByDay(notifications: AppNotification[]) {
	const groups: { day: string; items: AppNotification[] }[] = [];
	for (const notification of notifications) {
		const day = toIsoDate(notification.at);
		const group = groups.find((item) => item.day === day);
		if (group) group.items.push(notification);
		else groups.push({ day, items: [notification] });
	}
	return groups;
}

// 'TODAY · SEP 22', 'YESTERDAY', then 'SEP 18'.
export function dayHeading(day: string, today: string) {
	if (day === today) return `TODAY · ${formatMonthDay(day).toUpperCase()}`;
	if (day === addDays(today, -1)) return 'YESTERDAY';
	return formatMonthDay(day).toUpperCase();
}

// '9:00 AM · Due date reminder' for today's, 'Sep 21 · 9:00 AM' for an earlier day's.
export function notificationMeta(notification: AppNotification, today: string) {
	const time = formatTime(dateToMinutes(notification.at));
	return toIsoDate(notification.at) === today
		? `${time} · ${notification.kind}`
		: `${formatMonthDay(toIsoDate(notification.at))} · ${time}`;
}
