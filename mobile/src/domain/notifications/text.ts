// What a notification says. It takes plain data, so it needs neither the app nor the device.
import { formatShortDate } from '@/lib/dates';
import { formatLeadTime, formatTime, joinParts } from '@/lib/format';
import { plural } from '@/lib/plural';

import { type EventType, eventTypeInfo } from '../event-types';

function whenText(daysAhead: number) {
	return daysAhead === 0
		? 'today'
		: daysAhead === 1
			? 'tomorrow'
			: `in ${formatLeadTime(daysAhead)}`;
}

// 'Problem set 3 is due in 3 days', with 'MATH 201 · Submit by Sep 23 at 11:59 PM.' under it.
export function reminderText(
	event: {
		title: string;
		type: EventType;
		// 'YYYY-MM-DD'
		date: string;
		startTime: number | null;
		location: string | null;
		course: { code: string } | null;
	},
	daysAhead: number,
) {
	const due = eventTypeInfo[event.type].hasDueDate;
	const time = event.startTime === null ? '' : ` at ${formatTime(event.startTime)}`;
	return {
		title: `${event.title} is ${due ? 'due ' : ''}${whenText(daysAhead)}`,
		body: joinParts(
			event.course?.code,
			`${due ? 'Submit by ' : ''}${formatShortDate(event.date)}${time}${event.location ? ` in ${event.location}` : ''}.`,
		),
	};
}

// 'Your MATH 201 syllabus is ready', with what was found under it.
export function syllabusText(courseCode: string, dateCount: number, reviewCount = 0) {
	return {
		title: `Your ${courseCode} syllabus is ready`,
		body: [
			dateCount > 0
				? `We found ${plural(dateCount, 'date')}.`
				: 'Your course details are saved.',
			reviewCount > 0 && `Review ${plural(reviewCount, 'detail')} before relying on them.`,
		]
			.filter(Boolean)
			.join(' '),
	};
}
