// What a reviewed course looks like before it is saved: the shape any source of course details produces (the
// demo, a model on the phone, or a server) and the shape saving takes, so the two never need to know about each
// other. Everything is text or a plain number, because it is what the review form edits.
import { EMAIL } from '@/lib/input';

export type ReviewItem = {
	id: string;
	title: string;
	include: boolean;
	needsReview: boolean;
	confirmed: boolean;
};
export type CourseDraft = {
	code: string;
	title: string;
	semester: string;
	credits: string;
	days: string;
	startTime: number | null;
	endTime: number | null;
	location: string;
	professorName: string;
	professorEmail: string;
	officeDays: string;
	officeStart: number | null;
	officeEnd: number | null;
	officeLocation: string;
	dates: (ReviewItem & { date: string; time: string })[];
	materials: (ReviewItem & { details: string })[];
};

function validRange(start: number | null, end: number | null) {
	return (
		(start === null && end === null) ||
		(start !== null &&
			end !== null &&
			Number.isInteger(start) &&
			Number.isInteger(end) &&
			start >= 0 &&
			end < 1440 &&
			end > start)
	);
}

export function validateDraft(draft: CourseDraft): string | null {
	if (!draft.code.trim() || !draft.title.trim() || !draft.semester.trim())
		return 'Enter a course code, title, and semester.';
	if (
		draft.credits.trim() &&
		(!/^\d+$/.test(draft.credits.trim()) ||
			Number(draft.credits) < 1 ||
			!Number.isSafeInteger(Number(draft.credits)))
	)
		return 'Credits must be a whole number above 0.';
	if (draft.professorEmail.trim() && !EMAIL.test(draft.professorEmail.trim()))
		return 'Enter a valid professor email address.';
	if (
		!validRange(draft.startTime, draft.endTime) ||
		!validRange(draft.officeStart, draft.officeEnd)
	)
		return 'Each time range needs an end time after its start time.';
	for (const item of [...draft.dates, ...draft.materials].filter((item) => item.include)) {
		if (!item.title.trim()) return 'Give every included date and material a title.';
	}
	for (const item of draft.dates.filter((item) => item.include)) {
		const date = new Date(`${item.date}T12:00:00Z`);
		if (
			!/^\d{4}-\d{2}-\d{2}$/.test(item.date) ||
			!Number.isFinite(date.getTime()) ||
			date.toISOString().slice(0, 10) !== item.date
		)
			return `Choose a valid date for ${item.title}.`;
		if (item.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))
			return `Choose a valid time for ${item.title}, or clear it.`;
	}
	return null;
}
