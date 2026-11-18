// Calendar dates are 'YYYY-MM-DD' strings with no time zone (the same form events store), so they compare
// as text. Date objects only appear inside these helpers, built from local components so a date never shifts.
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function toIsoDate(date: Date) {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

function parseIsoDate(iso: string) {
	const [year, month, day] = iso.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function addDays(iso: string, days: number) {
	const date = parseIsoDate(iso);
	date.setDate(date.getDate() + days);
	return toIsoDate(date);
}

export function startOfMonth(iso: string) {
	return `${iso.slice(0, 7)}-01`;
}

export function addMonths(iso: string, months: number) {
	const date = parseIsoDate(startOfMonth(iso));
	date.setMonth(date.getMonth() + months);
	return toIsoDate(date);
}

export function dayOfMonth(iso: string) {
	return Number(iso.slice(8));
}

// 0 for Sunday through 6 for Saturday.
export function dayOfWeek(iso: string) {
	return parseIsoDate(iso).getDay();
}

// The Sunday-first weeks that cover a month, including the neighboring months' days that fill the first and last week.
export function monthWeeks(month: string) {
	const first = parseIsoDate(startOfMonth(month));
	const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
	const gridStart = addDays(toIsoDate(first), -first.getDay());
	const weekCount = Math.ceil((first.getDay() + daysInMonth) / 7);
	return Array.from({ length: weekCount }, (_, week) =>
		Array.from({ length: 7 }, (_, day) => addDays(gridStart, week * 7 + day)),
	);
}

// 'September 2026'
export function formatMonth(iso: string) {
	const date = parseIsoDate(iso);
	return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// 'Sep'
export function formatMonthShort(iso: string) {
	return MONTHS[parseIsoDate(iso).getMonth()].slice(0, 3);
}

// 'Wednesday'
export function formatWeekday(iso: string) {
	return WEEKDAYS[dayOfWeek(iso)];
}

// How many days `iso` is after `from`: negative for a date that has passed.
export function daysUntil(iso: string, from: string) {
	return Math.round((parseIsoDate(iso).getTime() - parseIsoDate(from).getTime()) / 86_400_000);
}

// 'Today', 'Tomorrow' or 'Yesterday', then days up to 13 of them ('In 12 days', '3 days ago'), weeks from
// 14 to 30 ('2 weeks ago') and months from 31 ('1 month ago').
export function formatCountdown(iso: string, from: string) {
	const days = daysUntil(iso, from);
	if (days === 0) return 'Today';
	if (days === 1) return 'Tomorrow';
	if (days === -1) return 'Yesterday';
	const away = Math.abs(days);
	const [count, unit] =
		away < 14
			? [away, 'day']
			: away < 31
				? [Math.floor(away / 7), 'week']
				: [Math.floor(away / 30), 'month'];
	const span = `${count} ${unit}${count === 1 ? '' : 's'}`;
	return days > 0 ? `In ${span}` : `${span} ago`;
}

// 'Wednesday, Sep 23'
export function formatLongDate(iso: string) {
	const date = parseIsoDate(iso);
	return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

// 'Mon, Sep 28'
export function formatShortDate(iso: string) {
	const date = parseIsoDate(iso);
	return `${WEEKDAYS[date.getDay()].slice(0, 3)}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

// 'Aug 31'
export function formatMonthDay(iso: string) {
	const date = parseIsoDate(iso);
	return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

// 'Aug 31–Dec 18'; '' when either end is unset.
export function formatDateRange(start: string | null, end: string | null) {
	if (start === null || end === null) return '';
	return `${formatMonthDay(start)}–${formatMonthDay(end)}`;
}
