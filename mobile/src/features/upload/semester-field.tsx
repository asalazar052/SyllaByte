import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { SelectField } from '@/components/ui/select-field';

const SEASONS = ['Fall', 'Spring', 'Summer'] as const;
type Season = (typeof SEASONS)[number];

// Years offered either side of this year, so a past term can be added and the next few are ready.
const YEARS_BEFORE = 4;
const YEARS_AFTER = 3;

const YEAR_WIDTH = 112;

// A semester is saved as one name, such as 'Fall 2026'. Anything else gives no season and no year.
function parseSemester(value: string): { season: Season | null; year: number | null } {
	const match = /^\s*(fall|spring|summer)\s+(\d{4})\s*$/i.exec(value);
	if (!match) return { season: null, year: null };
	const season = SEASONS.find((name) => name.toLowerCase() === match[1].toLowerCase()) ?? null;
	return { season, year: Number(match[2]) };
}

// The semester as two choices: its season and its year, each picked from a list. `onChange` gets
// the combined name once both are chosen, and an empty string until then.
export function SemesterField({
	value,
	onChange,
}: {
	value: string;
	onChange: (semester: string) => void;
}) {
	const initial = parseSemester(value);
	const [season, setSeason] = useState(initial.season);
	const [year, setYear] = useState(initial.year);

	const thisYear = new Date().getFullYear();
	const years = Array.from(
		{ length: YEARS_BEFORE + YEARS_AFTER + 1 },
		(_, index) => thisYear - YEARS_BEFORE + index,
	);
	// A year from the syllabus that is outside that range is still offered.
	if (year !== null && !years.includes(year)) years.push(year);
	years.sort((a, b) => a - b);

	function change(nextSeason: Season | null, nextYear: number | null) {
		setSeason(nextSeason);
		setYear(nextYear);
		onChange(nextSeason && nextYear ? `${nextSeason} ${nextYear}` : '');
	}

	return (
		<View className="flex-row items-end gap-3">
			<View className="min-w-0 flex-1 gap-1">
				<AppText variant="caption" className="text-sylla-muted">
					Semester *
				</AppText>
				<SelectField
					compact
					label="Semester"
					placeholder="Choose a semester"
					options={SEASONS.map((name) => ({ value: name, label: name }))}
					selected={season ?? undefined}
					onSelect={(next) => change(next, year)}
				/>
			</View>
			<View className="gap-1" style={{ width: YEAR_WIDTH }}>
				<AppText variant="caption" className="text-sylla-muted">
					Year *
				</AppText>
				<SelectField
					compact
					label="Year"
					placeholder="Year"
					options={years.map((option) => ({ value: option, label: String(option) }))}
					selected={year ?? undefined}
					onSelect={(next) => change(season, next)}
				/>
			</View>
		</View>
	);
}
