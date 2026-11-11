import { Stack } from 'expo-router';

import { SyllaColors } from '@/constants/theme';
import { ItemReminderProvider } from '@/features/calendar/item-reminder';
export const unstable_settings = { anchor: 'index' };
export default function CalendarLayout() {
	return (
		// The add screen and its reminder screen are one form, so they share the reminder being edited.
		<ItemReminderProvider>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: SyllaColors.background },
				}}
			/>
		</ItemReminderProvider>
	);
}
