import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Radii, SyllaColors } from '@/constants/theme';
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
		<View style={styles.time}>
			<AppText variant="label">{label}</AppText>
			{Platform.OS === 'android' ? (
				// The Android picker is a dialog that opens as soon as it renders.
				<>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`${label} time, ${formatTime(minutes)}`}
						onPress={() => setOpen(true)}
						style={styles.button}
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
		<View style={styles.field}>
			<View style={styles.header}>
				<AppText variant="caption" color={SyllaColors.muted}>
					{label}
				</AppText>
				{start !== null && end !== null && (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`Clear ${label.toLowerCase()}`}
						onPress={() => onChange(null, null)}
						hitSlop={8}
					>
						<AppText variant="action" color={SyllaColors.blue}>
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
					style={styles.add}
				>
					<AppText variant="label" color={SyllaColors.blue}>
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
const styles = StyleSheet.create({
	field: { gap: 4 },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	add: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
	time: {
		minHeight: 44,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	button: {
		minHeight: 36,
		paddingHorizontal: 14,
		justifyContent: 'center',
		borderRadius: Radii.small,
		backgroundColor: SyllaColors.paleBlue,
	},
});
