// Joins the parts that have a value with a middot; the database stores each part as its own cell.
export function joinParts(...parts: (string | number | false | null | undefined)[]) {
	return parts
		.filter((part) => part !== null && part !== undefined && part !== false && part !== '')
		.join(' · ');
}

// Single-letter day codes in week order, as stored in a days cell such as 'MWF' or 'TTh'.
export const DAYS = [
	{ code: 'M', name: 'Monday' },
	{ code: 'T', name: 'Tuesday' },
	{ code: 'W', name: 'Wednesday' },
	{ code: 'Th', name: 'Thursday' },
	{ code: 'F', name: 'Friday' },
	{ code: 'Sa', name: 'Saturday' },
	{ code: 'Su', name: 'Sunday' },
] as const;

export type DayCode = (typeof DAYS)[number]['code'];

export function parseDays(value: string) {
	return (value.match(/Th|Sa|Su|[MTWF]/g) ?? []) as DayCode[];
}

export function formatDays(selected: Iterable<DayCode>) {
	const set = new Set(selected);
	return DAYS.filter((day) => set.has(day.code))
		.map((day) => day.code)
		.join('');
}

// Times are stored as wall-clock minutes after midnight, with no time zone: a 9:00 AM class is 9:00 AM
// wherever the device is. The pickers work with Dates, so these convert using the device's local time
// (local Date components on both sides) on a fixed day, which keeps the stored value unchanged.
export function minutesToDate(minutes: number) {
	return new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
}

export function dateToMinutes(date: Date) {
	return date.getHours() * 60 + date.getMinutes();
}

export function formatTime(minutes: number) {
	const hour = Math.floor(minutes / 60);
	const minute = String(minutes % 60).padStart(2, '0');
	return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export type LeadUnit = 'days' | 'weeks';
export const DAYS_PER_UNIT: Record<LeadUnit, number> = { days: 1, weeks: 7 };

// How far ahead of a due date is stored in days; whole weeks read as weeks ('2 weeks'), the rest as days.
export function splitLeadTime(days: number): { amount: number; unit: LeadUnit } {
	return days % DAYS_PER_UNIT.weeks === 0
		? { amount: days / DAYS_PER_UNIT.weeks, unit: 'weeks' }
		: { amount: days, unit: 'days' };
}

// '1 day', '3 days', '2 weeks'
export function formatLeadTime(days: number) {
	const { amount, unit } = splitLeadTime(days);
	return `${amount} ${amount === 1 ? unit.slice(0, -1) : unit}`;
}

// '9:00–9:50 AM', or '11:00 AM–12:00 PM' when the range crosses noon; '' when either end is unset.
export function formatTimeRange(start: number | null, end: number | null) {
	if (start === null || end === null) return '';
	const first = formatTime(start);
	const sharesPeriod = start >= 720 === end >= 720;
	return `${sharesPeriod ? first.slice(0, -3) : first}–${formatTime(end)}`;
}

// '860 KB', '1.2 MB'. File sizes count in thousands, as the iOS and Android file apps do.
export function formatBytes(bytes: number) {
	const units = ['B', 'KB', 'MB', 'GB'];
	let value = bytes;
	let unit = 0;
	while (value >= 1000 && unit < units.length - 1) {
		value /= 1000;
		unit++;
	}
	// Whole bytes and kilobytes need no decimal; larger sizes keep one, without a trailing '.0'.
	return `${unit < 2 ? Math.round(value) : Number(value.toFixed(1))} ${units[unit]}`;
}
