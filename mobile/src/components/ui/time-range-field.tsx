import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { dateToMinutes, formatTime, minutesToDate } from '@/lib/format';

import { AppText } from './app-text';

function TimeField({
	label,
	minutes,
	onChange,
}: {
	label: string;
	minutes: number;
	onChange: (minutes: number) => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<View className="min-h-11 flex-row items-center justify-between">
			<AppText variant="label">{label}</AppText>
			{Platform.OS === 'android' ? (
				// The Android picker is a dialog that opens as soon as it renders.
				<>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`${label} time, ${formatTime(minutes)}`}
						onPress={() => setOpen(true)}
						className="min-h-9 justify-center rounded-small bg-sylla-paleBlue px-3.5"
					>
						<AppText variant="label">{formatTime(minutes)}</AppText>
					</Pressable>
					{open && (
						<DateTimePicker
							mode="time"
							value={minutesToDate(minutes)}
							onValueChange={(_, date) => {
								setOpen(false);
								onChange(dateToMinutes(date));
							}}
							onDismiss={() => setOpen(false)}
						/>
					)}
				</>
			) : (
				<DateTimePicker
					mode="time"
					display="compact"
					value={minutesToDate(minutes)}
					onValueChange={(_, date) => onChange(dateToMinutes(date))}
				/>
			)}
		</View>
	);
}

const DEFAULT_START = 9 * 60;
const DEFAULT_END = 10 * 60;

// start and end are set together or both null (no time); null shows an add button instead of pickers.
export function TimeRangeField({
	label,
	start,
	end,
	onChange,
}: {
	label: string;
	start: number | null;
	end: number | null;
	onChange: (start: number | null, end: number | null) => void;
}) {
	return (
		<View className="gap-1">
			<View className="flex-row items-center justify-between">
				<AppText variant="caption" className="text-sylla-muted">
					{label}
				</AppText>
				{start !== null && end !== null && (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`Clear ${label.toLowerCase()}`}
						onPress={() => onChange(null, null)}
						hitSlop={8}
					>
						<AppText variant="action" className="text-sylla-blue">
							Clear
						</AppText>
					</Pressable>
				)}
			</View>
			{start === null || end === null ? (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Add ${label.toLowerCase()}`}
					onPress={() => onChange(DEFAULT_START, DEFAULT_END)}
					className="min-h-11 self-start justify-center"
				>
					<AppText variant="label" className="text-sylla-blue">
						Add time
					</AppText>
				</Pressable>
			) : (
				<>
					<TimeField
						label="Starts"
						minutes={start}
						onChange={(minutes) => onChange(minutes, end)}
					/>
					<TimeField
						label="Ends"
						minutes={end}
						onChange={(minutes) => onChange(start, minutes)}
					/>
				</>
			)}
		</View>
	);
}
