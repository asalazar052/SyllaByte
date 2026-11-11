import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppSwitch } from '@/components/ui/app-switch';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { updateSettings } from '@/db/mutations';
import { type Settings, settingsQuery } from '@/db/queries';
import { requestReminderPermission } from '@/features/reminders/reminders';

import { ReminderWheels } from './reminder-wheels';
import { SettingsPageHeader } from './settings-page-header';

export function RemindersScreen() {
	const { data: settings } = useLiveQuery(settingsQuery());
	return (
		<Screen>
			<View className="gap-2.5">
				<SettingsPageHeader
					title="A timely heads-up."
					description="Choose when your default reminders arrive."
				/>
				{settings && <ReminderOptions settings={settings} />}
			</View>
		</Screen>
	);
}

// The wheels start at the saved reminder and write each change straight back. They never show a later
// saved value, so only the toggle follows the live settings.
function ReminderOptions({ settings }: { settings: Settings }) {
	return (
		<>
			<AppCard className="flex-row items-center">
				<AppIcon name="bell" size={20} tintColor={SyllaColors.blue} />
				<View className="min-w-0 flex-1 gap-1">
					<AppText className="font-inter-medium">Default reminders</AppText>
					<AppText variant="caption" className="text-sylla-muted">
						When enabled, we will automatically schedule reminders at the time below for
						events without a custom reminder.
					</AppText>
				</View>
				<AppSwitch
					label="Default reminders"
					value={settings.defaultRemindersEnabled}
					onValueChange={(value) => {
						updateSettings({ defaultRemindersEnabled: value });
						// Asks to send notifications the first time reminders are turned on.
						if (value) void requestReminderPermission();
					}}
				/>
			</AppCard>
			<ReminderWheels
				daysAhead={settings.reminderDaysAhead}
				time={settings.reminderTime}
				onDaysAheadChange={(days) => updateSettings({ reminderDaysAhead: days })}
				onTimeChange={(minutes) => updateSettings({ reminderTime: minutes })}
			/>
		</>
	);
}
