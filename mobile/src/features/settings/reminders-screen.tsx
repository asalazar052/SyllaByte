import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppSwitch } from '@/components/ui/app-switch';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { WheelPicker, WheelPickerGroup } from '@/components/ui/wheel-picker';
import { SyllaColors } from '@/constants/theme';
import { updateSettings } from '@/db/mutations';
import { type Settings, settingsQuery } from '@/db/queries';
import { DAYS_PER_UNIT, type LeadUnit, splitLeadTime } from '@/lib/format';

import { SettingsPageHeader } from './settings-page-header';

const UNITS: LeadUnit[] = ['days', 'weeks'];
const MAX_AMOUNT: Record<LeadUnit, number> = { days: 30, weeks: 8 };
const numbers = (count: number) => Array.from({ length: count }, (_, index) => String(index + 1));
const AMOUNTS = { days: numbers(MAX_AMOUNT.days), weeks: numbers(MAX_AMOUNT.weeks) };
const HOURS = numbers(12);
// Every five minutes: '00', '05', ... '55'.
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

type Time = { hour: number; minute: number; pm: boolean };

// A stored time (minutes after midnight) as the wheels show it: 1–12, a multiple of five, and AM or PM.
function toTime(minutes: number): Time {
	const hour24 = Math.floor(minutes / 60);
	return {
		hour: hour24 % 12 || 12,
		minute: (Math.round((minutes % 60) / 5) * 5) % 60,
		pm: hour24 >= 12,
	};
}

function fromTime({ hour, minute, pm }: Time) {
	return ((hour % 12) + (pm ? 12 : 0)) * 60 + minute;
}

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
	const [lead, setLead] = useState(() => splitLeadTime(settings.reminderDaysAhead));
	const [time, setTime] = useState(() => toTime(settings.reminderTime));

	function changeLead(amount: number, unit: LeadUnit) {
		setLead({ amount, unit });
		updateSettings({ reminderDaysAhead: amount * DAYS_PER_UNIT[unit] });
	}

	function changeTime(change: Partial<Time>) {
		const next = { ...time, ...change };
		setTime(next);
		updateSettings({ reminderTime: fromTime(next) });
	}

	// Stored days can exceed what the wheel offers, so the wheel starts at its last number instead.
	const amount = Math.min(lead.amount, MAX_AMOUNT[lead.unit]);

	return (
		<>
			<AppCard className="flex-row items-center">
				<AppIcon name="bell" size={20} tintColor={SyllaColors.blue} />
				<View className="min-w-0 flex-1 gap-1">
					<AppText className="font-inter-medium">Default reminders</AppText>
					<AppText variant="caption" className="text-sylla-muted">
						When enabled, we will automatically schedule reminders at the time below for
						assignments without a custom reminder.
					</AppText>
				</View>
				<AppSwitch
					label="Default reminders"
					value={settings.defaultRemindersEnabled}
					onValueChange={(value) => updateSettings({ defaultRemindersEnabled: value })}
				/>
			</AppCard>

			<AppCard className="gap-3.5">
				<AppText variant="caption" className="font-inter-medium">
					We will remind you
				</AppText>
				<View className="h-px bg-sylla-border" />
				<WheelPickerGroup rows={3}>
					{/* A new key starts the amount over when the unit changes its choices. */}
					<WheelPicker
						key={lead.unit}
						label="Amount"
						items={AMOUNTS[lead.unit]}
						initialIndex={amount - 1}
						onChange={(index) => changeLead(index + 1, lead.unit)}
						rows={3}
					/>
					<WheelPicker
						label="Unit"
						items={amount === 1 ? ['day', 'week'] : UNITS}
						initialIndex={UNITS.indexOf(lead.unit)}
						onChange={(index) =>
							changeLead(Math.min(amount, MAX_AMOUNT[UNITS[index]]), UNITS[index])
						}
						rows={3}
						selectedClassName="text-[21px]"
					/>
				</WheelPickerGroup>
			</AppCard>

			<AppCard className="gap-3.5">
				<AppText variant="caption" className="font-inter-medium">
					ahead of the due date at
				</AppText>
				<View className="h-px bg-sylla-border" />
				<WheelPickerGroup rows={5}>
					<WheelPicker
						label="Hour"
						items={HOURS}
						initialIndex={time.hour - 1}
						onChange={(index) => changeTime({ hour: index + 1 })}
						rows={5}
						loop
					/>
					<WheelPicker
						label="Minute"
						items={MINUTES}
						initialIndex={time.minute / 5}
						onChange={(index) => changeTime({ minute: index * 5 })}
						rows={5}
						loop
					/>
					<WheelPicker
						label="AM or PM"
						items={PERIODS}
						initialIndex={time.pm ? 1 : 0}
						onChange={(index) => changeTime({ pm: index === 1 })}
						rows={5}
						selectedClassName="text-[21px]"
					/>
				</WheelPickerGroup>
			</AppCard>
			<AppText variant="micro" className="text-sylla-muted">
				Uses your device’s time zone
			</AppText>
		</>
	);
}
