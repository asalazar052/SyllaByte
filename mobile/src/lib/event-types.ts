import type { EventType } from '@/db/schema';

// What each kind of event is called wherever it is named: the calendar, its details and a reminder.
export const eventTypeLabels: Record<EventType, string> = {
	assignment: 'Assignment',
	lab_report: 'Lab report',
	quiz: 'Quiz',
	exam: 'Exam',
	other: 'Other',
};
