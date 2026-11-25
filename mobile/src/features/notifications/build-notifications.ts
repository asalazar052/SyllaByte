import type { AppIconName } from '@/components/ui/app-icon';
import type { EventWithCourse, Settings, UploadedFile } from '@/db/queries';
import type { EventType } from '@/db/schema';
import { itemReminder } from '@/features/calendar/item-reminder';
import { localDate } from '@/features/reminders/plan-reminders';
import { addDays, formatMonthDay, formatShortDate, toIsoDate } from '@/lib/dates';
import { dateToMinutes, formatLeadTime, formatTime, joinParts } from '@/lib/format';
import { plural } from '@/lib/plural';

// How far back the list reaches, and the most it holds.
const DAYS_SHOWN = 14;
const MAX_SHOWN = 50;

// Each kind of notification has a color: blue for things that are due, brown for exams and green for syllabi.
export type NotificationTone = 'blue' | 'brown' | 'green';

export type AppNotification = {
	// Stays the same for the same notification, so it can be remembered as read.
	id: string;
	at: Date;
	title: string;
	body: string;
	// What kind of notification it is, shown after the time: 'Due date reminder', 'Syllabus scan'.
	kind: string;
	tone: NotificationTone;
	icon: AppIconName;
	// What opening it goes to.
	target: { kind: 'event'; event: { id: number; date: string } } | { kind: 'course'; id: number };
};

const dueTypes: EventType[] = ['assignment', 'lab_report'];

const reminderStyle: Record<
	EventType,
	{ tone: NotificationTone; icon: AppIconName; kind: string }
> = {
	assignment: { tone: 'blue', icon: 'bell', kind: 'Due date reminder' },
	lab_report: { tone: 'blue', icon: 'calendar', kind: 'Due date reminder' },
	quiz: { tone: 'brown', icon: 'alarmClock', kind: 'Quiz reminder' },
	exam: { tone: 'brown', icon: 'alarmClock', kind: 'Exam reminder' },
	other: { tone: 'blue', icon: 'bell', kind: 'Reminder' },
};

function whenText(daysAhead: number) {
	return daysAhead === 0
		? 'today'
		: daysAhead === 1
			? 'tomorrow'
			: `in ${formatLeadTime(daysAhead)}`;
}

// What has gone off lately: each item's reminder once its time has passed, and each syllabus once it was
// uploaded. Newest first. Reminders that haven't gone off yet are not here; they are still scheduled.
export function buildNotifications({
	events,
	files,
	reviewCounts,
	settings,
	now,
}: {
	events: EventWithCourse[];
	files: UploadedFile[];
	// How many details are flagged for review, by course.
	reviewCounts: Map<number, number>;
	settings: Settings | undefined;
	now: Date;
}): AppNotification[] {
	const oldest = addDays(toIsoDate(now), -DAYS_SHOWN);
	const notifications: AppNotification[] = [];

	for (const event of settings ? events : []) {
		const reminder = itemReminder(event, settings!);
		if (!reminder.enabled) continue;
		const fireDate = addDays(event.date, -reminder.daysAhead);
		const at = localDate(fireDate, reminder.time);
		if (at.getTime() > now.getTime() || fireDate < oldest) continue;
		const style = reminderStyle[event.type];
		const due = dueTypes.includes(event.type);
		const time = event.startTime === null ? '' : ` at ${formatTime(event.startTime)}`;
		notifications.push({
			id: `reminder-${event.id}-${fireDate}-${reminder.time}`,
			at,
			title: `${event.title} is ${due ? 'due ' : ''}${whenText(reminder.daysAhead)}`,
			body: joinParts(
				event.course?.code,
				`${due ? 'Submit by ' : ''}${formatShortDate(event.date)}${time}${event.location ? ` in ${event.location}` : ''}.`,
			),
			kind: style.kind,
			tone: style.tone,
			icon: style.icon,
			target: { kind: 'event', event: { id: event.id, date: event.date } },
		});
	}

	for (const file of files) {
		if (file.uploadedAt === null || !file.course) continue;
		const at = new Date(file.uploadedAt);
		if (toIsoDate(at) < oldest) continue;
		const courseId = file.course.id;
		const dates = events.filter((event) => event.courseId === courseId).length;
		const review = reviewCounts.get(courseId) ?? 0;
		notifications.push({
			id: `syllabus-${file.id}`,
			at,
			title: `Your ${file.course.code} syllabus is ready`,
			body: [
				dates > 0 ? `We found ${plural(dates, 'date')}.` : 'Your course details are saved.',
				review > 0 && `Review ${plural(review, 'detail')} before relying on them.`,
			]
				.filter(Boolean)
				.join(' '),
			kind: 'Syllabus scan',
			tone: 'green',
			icon: 'scan',
			target: { kind: 'course', id: courseId },
		});
	}

	return notifications.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, MAX_SHOWN);
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
