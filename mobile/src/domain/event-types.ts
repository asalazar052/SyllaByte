// The rules for each kind of calendar event, in one place: what it's called, how the calendar groups it, and
// whether it counts as due, important or a plain reminder. Nothing here depends on React or the device.
import { type EventType, eventTypes } from '@/db/schema';

export { type EventType, eventTypes };

// The group the calendar files an event under. The calendar adds office hours, which aren't events.
export type EventTypeCategory = 'due' | 'exam' | 'reminder';

export type EventTypeInfo = {
	// What the event is called wherever it is named: the calendar, its details and a reminder.
	label: string;
	category: EventTypeCategory;
	// Handed in on its date, so it reads 'is due' and 'Submit by'.
	hasDueDate: boolean;
	// Listed among a course's important dates.
	important: boolean;
	// Counts toward what is due this week. A plain reminder isn't something that is due.
	deadline: boolean;
};

export const eventTypeInfo: Record<EventType, EventTypeInfo> = {
	assignment: {
		label: 'Assignment',
		category: 'due',
		hasDueDate: true,
		important: false,
		deadline: true,
	},
	lab_report: {
		label: 'Lab report',
		category: 'due',
		hasDueDate: true,
		important: false,
		deadline: true,
	},
	quiz: { label: 'Quiz', category: 'exam', hasDueDate: false, important: true, deadline: true },
	exam: { label: 'Exam', category: 'exam', hasDueDate: false, important: true, deadline: true },
	other: {
		label: 'Other',
		category: 'reminder',
		hasDueDate: false,
		important: false,
		deadline: false,
	},
};

export const eventTypeOptions = eventTypes.map((value) => ({
	value,
	label: eventTypeInfo[value].label,
}));

export const importantEventTypes = eventTypes.filter((type) => eventTypeInfo[type].important);

export function isEventType(value: string): value is EventType {
	return (eventTypes as readonly string[]).includes(value);
}

// The label for a stored type, or the stored text itself if it isn't one we know.
export function eventTypeLabel(type: string) {
	return isEventType(type) ? eventTypeInfo[type].label : type;
}

// The best guess at a kind of event from its title, for dates read out of a syllabus.
export function inferEventType(title: string): EventType {
	return /exam|midterm|final/i.test(title) ? 'exam' : 'assignment';
}
