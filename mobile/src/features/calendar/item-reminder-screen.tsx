import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppSwitch } from '@/components/ui/app-switch';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { ReminderWheels } from '@/features/settings/reminder-wheels';

import { CalendarPageHeader } from './calendar-page-header';
import { useItemReminder } from './item-reminder';

export function ItemReminderScreen() {
	const { reminder, setReminder } = useItemReminder();
	return (
		<Screen>
			<View className="gap-2.5">
				<CalendarPageHeader
					parent="CALENDAR / REMINDER"
					backLabel="Back to the item"
					title="Need reminding?"
					description="Let us know when we should give you a nudge."
				/>
				<AppCard className="flex-row items-center gap-3 p-[15px]">
					<AppIcon name="bell" size={18} tintColor={SyllaColors.blue} />
					<AppText variant="caption" className="min-w-0 flex-1 font-inter-medium">
						Enable reminder
					</AppText>
					<AppSwitch
						label="Enable reminder"
						value={reminder.enabled}
						onValueChange={(enabled) => setReminder({ ...reminder, enabled })}
					/>
				</AppCard>
				{/* Wheels read their starting point once, so the rest of the reminder is carried along as it was. */}
				<View
					pointerEvents={reminder.enabled ? 'auto' : 'none'}
					style={{ opacity: reminder.enabled ? 1 : 0.5 }}
					className="gap-2.5"
				>
					<ReminderWheels
						daysAhead={reminder.daysAhead}
						time={reminder.time}
						onDaysAheadChange={(daysAhead) => setReminder({ ...reminder, daysAhead })}
						onTimeChange={(time) => setReminder({ ...reminder, time })}
					/>
				</View>
			</View>
		</Screen>
	);
}
