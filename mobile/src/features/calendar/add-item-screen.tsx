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
import { Field, TextField } from '@/components/ui/text-field';
import { TimeField } from '@/components/ui/time-range-field';
import { SyllaColors } from '@/constants/theme';
import { useCurrentSemesterCourses } from '@/db/hooks';
import { createEvent } from '@/domain/commands';
import { type EventType, eventTypeOptions } from '@/domain/event-types';
import { toIsoDate } from '@/lib/dates';
import { isoToDate } from '@/lib/format';

import { describeReminder, useItemReminder } from './item-reminder';

// A due time that gives the whole day, which is what most assignments mean.
const DEFAULT_TIME = 23 * 60 + 59;

export function AddItemScreen() {
	const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
	const { reminder, modified, setReminder, revert } = useItemReminder();
	const { courses } = useCurrentSemesterCourses();

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
		createEvent({
			courseId,
			type,
			title: title.trim(),
			date,
			startTime: time,
			notes: notes.trim() || null,
			reminder,
		});
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
				<Field label="Type">
					<SelectField
						label="Type"
						options={eventTypeOptions}
						selected={type}
						onSelect={setType}
					/>
				</Field>

				<TextField
					label="Title"
					value={title}
					onChangeText={setTitle}
					placeholder="e.g. Midterm practice problems"
					returnKeyType="done"
					autoCorrect
				/>

				<Field label="Course">
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
				</Field>

				{/* The same date and time pickers the other screens use. */}
				<View className="rounded-small border border-sylla-border bg-sylla-surface px-3.5">
					<DateField
						label="Due date"
						value={dateValue}
						onChange={(picked) => setDate(toIsoDate(picked))}
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

				<TextField
					label="Notes (optional)"
					accessibilityLabel="Notes"
					value={notes}
					onChangeText={setNotes}
					placeholder="Anything worth remembering"
					multiline
					textAlignVertical="top"
					autoCorrect
					className="h-[84px] text-xs leading-[18px]"
				/>
			</View>

			<AppButton label="Add to calendar" disabled={!title.trim()} onPress={add} />
		</Screen>
	);
}
