import { addDays, daysUntil, formatDateRange, formatMonthDay } from '@/lib/dates';

const WEEK = 7;

export type SemesterProgress = {
	// 'Week 4 of 16  ·  Sep 21–27', or where the semester stands when today is outside it.
	summary: string;
	// The semester's current week as 'YYYY-MM-DD' bounds, counted in weeks from the first day of the semester.
	// Null before the semester starts or after it ends.
	week: { start: string; end: string } | null;
};

// Where `today` falls in a semester. Weeks run from the semester's first day, so the first is its first seven days.
export function semesterProgress(
	semester: { startDate: string | null; endDate: string | null },
	today: string,
): SemesterProgress {
	const { startDate, endDate } = semester;
	if (startDate === null || endDate === null) return { summary: '', week: null };
	if (today < startDate) return { summary: `Starts ${formatMonthDay(startDate)}`, week: null };
	if (today > endDate) return { summary: `Ended ${formatMonthDay(endDate)}`, week: null };
	const total = Math.ceil((daysUntil(endDate, startDate) + 1) / WEEK);
	const number = Math.floor(daysUntil(today, startDate) / WEEK) + 1;
	const start = addDays(startDate, (number - 1) * WEEK);
	const end = addDays(start, WEEK - 1);
	return {
		summary: `Week ${number} of ${total}  ·  ${formatDateRange(start, end)}`,
		week: { start, end: end > endDate ? endDate : end },
	};
}
