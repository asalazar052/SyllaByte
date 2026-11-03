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

export function createSampleDraft(): CourseDraft {
	return {
		code: 'CS 240',
		title: 'Data Structures',
		semester: 'Fall 2026',
		credits: '3',
		days: 'MWF',
		startTime: 600,
		endTime: 650,
		location: 'Technology Hall 208',
		professorName: 'Dr. Alex Morgan',
		professorEmail: 'amorgan@example.edu',
		officeDays: 'TTh',
		officeStart: 840,
		officeEnd: 900,
		officeLocation: 'Technology Hall 214',
		dates: [
			{
				id: 'project',
				title: 'Project 1',
				date: '2026-09-18',
				time: '23:59',
				include: true,
				needsReview: false,
				confirmed: true,
			},
			{
				id: 'midterm',
				title: 'Midterm exam',
				date: '2026-10-16',
				time: '10:00',
				include: true,
				needsReview: false,
				confirmed: true,
			},
			{
				id: 'final',
				title: 'Final exam',
				date: '2026-12-14',
				time: '',
				include: true,
				needsReview: true,
				confirmed: false,
			},
		],
		materials: [
			{
				id: 'textbook',
				title: 'Data Structures and Algorithms',
				details: 'Edition unspecified',
				include: true,
				needsReview: true,
				confirmed: false,
			},
			{
				id: 'portal',
				title: 'Course learning portal',
				details: 'Online resources',
				include: true,
				needsReview: false,
				confirmed: true,
			},
		],
	};
}

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
	if (
		draft.professorEmail.trim() &&
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.professorEmail.trim())
	)
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
			return `Enter a valid date (YYYY-MM-DD) for ${item.title}.`;
		if (item.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))
			return `Enter a time in 24-hour HH:MM format for ${item.title}, or leave it blank.`;
	}
	return null;
}
