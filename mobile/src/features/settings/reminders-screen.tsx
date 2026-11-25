import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppSwitch } from '@/components/ui/app-switch';
import { AppText } from '@/components/ui/app-text';
import { goBackOr, PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { type Settings, settingsQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { updateSettings } from '@/domain/commands';
import { ReminderWheels } from '@/features/reminders/reminder-wheels';

export function RemindersScreen() {
	const { data: settings } = useQuery(settingsQuery());
	return (
		<Screen>
			<View className="gap-2.5">
				<PageHeader
					parent="SETTINGS"
					backLabel="Back to settings"
					onBack={() => goBackOr('/settings')}
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
					onValueChange={(value) => updateSettings({ defaultRemindersEnabled: value })}
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
