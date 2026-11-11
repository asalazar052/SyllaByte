import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { AppSwitch } from '@/components/ui/app-switch';
import { AppText } from '@/components/ui/app-text';
import { DateField } from '@/components/ui/date-field';
import { goBackOr, PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { TimeField } from '@/components/ui/time-range-field';
import { SyllaColors } from '@/constants/theme';
import { addEvent } from '@/db/mutations';
import { currentSemesterQuery, semesterCoursesQuery } from '@/db/queries';
import { type EventType, eventTypes } from '@/db/schema';
import { requestReminderPermission } from '@/features/reminders/reminders';
import { toIsoDate } from '@/lib/dates';
import { dateToIso, isoToDate } from '@/lib/format';

import { eventTypeInfo } from './calendar-items';
import { ItemField, ItemInput } from './item-fields';
import { describeReminder, useItemReminder } from './item-reminder';

// A due time that gives the whole day, which is what most assignments mean.
const DEFAULT_TIME = 23 * 60 + 59;

export function AddItemScreen() {
	const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
	const { reminder, modified, setReminder, revert } = useItemReminder();
	const { data: semester } = useLiveQuery(currentSemesterQuery());
	const { data: courses } = useLiveQuery(semesterCoursesQuery(semester?.id ?? 0), [semester?.id]);

	const [type, setType] = useState<EventType>('assignment');
	const [title, setTitle] = useState('');
	// undefined until the user chooses, so the course list's first course shows once it has loaded.
	const [chosenCourseId, setChosenCourseId] = useState<number | null | undefined>(undefined);
	const [date, setDate] = useState(() =>
		dateParam && isoToDate(dateParam) ? dateParam : toIsoDate(new Date()),
	);
	const [time, setTime] = useState(DEFAULT_TIME);
	const [notes, setNotes] = useState('');

	// The reminder belongs to this form only, so leaving it behind starts the next item from the defaults.
	useEffect(() => revert, [revert]);

	const courseId = chosenCourseId === undefined ? (courses[0]?.id ?? null) : chosenCourseId;
	const dateValue = isoToDate(date) ?? new Date();

	function add() {
		addEvent({
			courseId,
			type,
			title: title.trim(),
			date,
			startTime: time,
			notes: notes.trim() || null,
			// An item that keeps the default reminder stores none of its own.
			...(modified && {
				reminderEnabled: reminder.enabled,
				reminderDaysAhead: reminder.daysAhead,
				reminderTime: reminder.time,
			}),
		});
		// Asks to send notifications the first time a reminder is set, and schedules it once allowed.
		if (reminder.enabled) void requestReminderPermission();
		// Back to the calendar on the new item's day.
		router.dismissTo({
			pathname: '/calendar',
			params: { date, focus: String(Date.now()) },
		});
	}

	return (
		<Screen>
			<PageHeader
				parent="CALENDAR"
				backLabel="Back to calendar"
				onBack={() => goBackOr('/calendar')}
				title="Add an item."
				description="A deadline, an exam, or a little time to prepare."
			/>

			<View className="gap-4">
				<ItemField label="Type">
					<SelectField
						label="Type"
						options={eventTypes.map((value) => ({
							value,
							label: eventTypeInfo[value].label,
						}))}
						selected={type}
						onSelect={setType}
					/>
				</ItemField>

				<ItemField label="Title">
					<ItemInput
						accessibilityLabel="Title"
						value={title}
						onChangeText={setTitle}
						placeholder="e.g. Midterm practice problems"
						returnKeyType="done"
					/>
				</ItemField>

				<ItemField label="Course">
					<SelectField
						label="Course"
						options={[
							...courses.map((option) => ({
								value: option.id as number | null,
								label: `${option.code} · ${option.title}`,
							})),
							{ value: null, label: 'No course' },
						]}
						selected={courseId}
						onSelect={setChosenCourseId}
					/>
				</ItemField>

				{/* The same date and time pickers the other screens use. */}
				<View className="rounded-small border border-sylla-border bg-sylla-surface px-3.5">
					<DateField
						label="Due date"
						value={dateValue}
						onChange={(picked) => setDate(dateToIso(picked))}
					/>
					<View className="h-px bg-sylla-border" />
					<TimeField label="Time" minutes={time} onChange={setTime} />
				</View>

				<View className="gap-2">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`Reminder, ${describeReminder(reminder)}`}
						onPress={() => router.push('/calendar/reminder')}
						className="flex-row items-center gap-2.5 rounded-2xl border border-sylla-border bg-sylla-surface p-[13px] active:opacity-75"
					>
						<AppIcon name="bell" size={18} tintColor={SyllaColors.blue} />
						<View className="min-w-0 flex-1 gap-1">
							<AppText variant="caption" className="font-inter-medium">
								Remind me
							</AppText>
							<AppText variant="micro" className="text-sylla-muted">
								{describeReminder(reminder)}
							</AppText>
						</View>
						<AppSwitch
							label="Remind me"
							value={reminder.enabled}
							onValueChange={(enabled) => setReminder({ ...reminder, enabled })}
						/>
						<AppIcon name="chevronRight" size={14} tintColor={SyllaColors.muted} />
					</Pressable>
					{modified && (
						<View className="flex-row items-center gap-1">
							<AppText
								variant="micro"
								className="font-inter-semibold text-sylla-brown"
							>
								Reminder modified
							</AppText>
							<AppText variant="micro" className="text-sylla-muted">
								·
							</AppText>
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Revert reminder to default"
								onPress={revert}
								hitSlop={8}
							>
								<AppText
									variant="micro"
									className="font-inter-semibold text-sylla-blue"
								>
									Revert to default
								</AppText>
							</Pressable>
						</View>
					)}
				</View>

				<ItemField label="Notes (optional)">
					<ItemInput
						accessibilityLabel="Notes"
						value={notes}
						onChangeText={setNotes}
						placeholder="Anything worth remembering"
						multiline
						textAlignVertical="top"
						className="h-[84px] text-xs leading-[18px]"
					/>
				</ItemField>
			</View>

			<AppButton label="Add to calendar" disabled={!title.trim()} onPress={add} />
		</Screen>
	);
}
