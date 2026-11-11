import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { formatDate } from '@/lib/format';

import { AppText } from './app-text';

// A single labelled date picker. `value` null means no valid date yet, which shows a button instead.
export function DateField({
	label,
	value,
	onChange,
}: {
	label: string;
	value: Date | null;
	onChange: (date: Date) => void;
}) {
	const [open, setOpen] = useState(false);
	const date = value ?? new Date();
	return (
		<View className="min-h-11 flex-row items-center justify-between">
			<AppText variant="label">{label}</AppText>
			{value === null ? (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Set ${label.toLowerCase()}`}
					onPress={() => onChange(new Date())}
					className="min-h-9 justify-center"
				>
					<AppText variant="label" className="text-sylla-blue">
						Set date
					</AppText>
				</Pressable>
			) : Platform.OS === 'android' ? (
				// The Android picker is a dialog that opens as soon as it renders.
				<>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`${label}, ${formatDate(date)}`}
						onPress={() => setOpen(true)}
						className="min-h-9 justify-center rounded-small bg-sylla-paleBlue px-3.5"
					>
						<AppText variant="label">{formatDate(date)}</AppText>
					</Pressable>
					{open && (
						<DateTimePicker
							mode="date"
							value={date}
							onValueChange={(_, picked) => {
								setOpen(false);
								onChange(picked);
							}}
							onDismiss={() => setOpen(false)}
						/>
					)}
				</>
			) : (
				<DateTimePicker
					mode="date"
					display="compact"
					themeVariant="light"
					value={date}
					onValueChange={(_, picked) => onChange(picked)}
				/>
			)}
		</View>
	);
}
