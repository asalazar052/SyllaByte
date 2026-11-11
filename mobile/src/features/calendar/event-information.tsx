import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppSwitch } from '@/components/ui/app-switch';
import { AppText } from '@/components/ui/app-text';
import { DateField } from '@/components/ui/date-field';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { TimeField } from '@/components/ui/time-range-field';
import { updateEvent } from '@/db/mutations';
import {
	type CalendarEventDetail,
	currentSemesterQuery,
	semesterCoursesQuery,
	type Settings,
} from '@/db/queries';
import { type EventType, eventTypes } from '@/db/schema';
import { EditableRow } from '@/features/courses/editable-row';
import { requestReminderPermission } from '@/features/reminders/reminders';
import { ReminderWheels } from '@/features/settings/reminder-wheels';
import { formatLongDate } from '@/lib/dates';
import { dateToIso, isoToDate, joinParts } from '@/lib/format';
import { orNull } from '@/lib/input';

import { eventTypeInfo, formatItemTime } from './calendar-items';
import { ItemField } from './item-fields';
import { describeReminder, type ItemReminder, itemReminder } from './item-reminder';

const DEFAULT_START = 9 * 60;
const DEFAULT_LENGTH = 60;

// An optional start time, and an optional end time once there is a start. A due time has only a start.
function EventTimeFields({
	start,
	end,
	onChange,
}: {
	start: number | null;
	end: number | null;
	onChange: (start: number | null, end: number | null) => void;
}) {
	if (start === null) {
		return (
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Add time"
				onPress={() => onChange(DEFAULT_START, null)}
				className="min-h-11 self-start justify-center"
			>
				<AppText variant="label" className="text-sylla-blue">
					Add time
				</AppText>
			</Pressable>
		);
	}
	return (
		<View>
			<View className="flex-row items-center justify-between">
				<View className="flex-1">
					<TimeField
						label={end === null ? 'Time' : 'Starts'}
						minutes={start}
						onChange={(minutes) => onChange(minutes, end)}
					/>
				</View>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Clear start time"
					// With an end time, that becomes the only time the item has.
					onPress={() => onChange(end, null)}
					hitSlop={8}
					className="pl-3"
				>
					<AppText variant="action" className="text-sylla-blue">
						Clear
					</AppText>
				</Pressable>
			</View>
			{end === null ? (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Add end time"
					onPress={() => onChange(start, Math.min(start + DEFAULT_LENGTH, 24 * 60 - 1))}
					className="min-h-11 self-start justify-center"
				>
					<AppText variant="label" className="text-sylla-blue">
						Add end time
					</AppText>
				</Pressable>
			) : (
				<View className="flex-row items-center justify-between">
					<View className="flex-1">
						<TimeField
							label="Ends"
							minutes={end}
							onChange={(minutes) => onChange(start, minutes)}
						/>
					</View>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Clear end time"
						onPress={() => onChange(start, null)}
						hitSlop={8}
						className="pl-3"
					>
						<AppText variant="action" className="text-sylla-blue">
							Clear
						</AppText>
					</Pressable>
				</View>
			)}
		</View>
	);
}

// Each detail of an item, editable in place the way a course's information is.
export function EventInformation({
	event,
	settings,
}: {
	event: CalendarEventDetail;
	settings: Settings;
}) {
	const { data: semester } = useLiveQuery(currentSemesterQuery());
	const { data: semesterCourses } = useLiveQuery(semesterCoursesQuery(semester?.id ?? 0), [
		semester?.id,
	]);
	// An item from an earlier semester keeps its own course in the list.
	const courses =
		event.course && !semesterCourses.some((course) => course.id === event.course?.id)
			? [...semesterCourses, event.course]
			: semesterCourses;
	const reminder = itemReminder(event, settings);
	const defaults: ItemReminder = {
		enabled: settings.defaultRemindersEnabled,
		daysAhead: settings.reminderDaysAhead,
		time: settings.reminderTime,
	};
	const custom = event.reminderEnabled !== null;
	const date = isoToDate(event.date);

	return (
		<AppCard>
			<AppText variant="heading">Details</AppText>
			<EditableRow
				icon="fileText"
				title={event.title}
				subtitle={eventTypeInfo[event.type].label}
				placeholder="Add a title"
				editLabel="Edit title and type"
				values={{ title: event.title, type: event.type as EventType }}
				onSave={({ title, type }) => {
					if (!title.trim()) return 'Enter a title.';
					updateEvent(event.id, { title: title.trim(), type });
				}}
			>
				{(draft, update) => (
					<>
						<TextField
							label="Title"
							value={draft.title}
							onChangeText={(text) => update('title', text)}
						/>
						<ItemField label="Type">
							<SelectField
								label="Type"
								options={eventTypes.map((value) => ({
									value,
									label: eventTypeInfo[value].label,
								}))}
								selected={draft.type}
								onSelect={(value) => update('type', value)}
							/>
						</ItemField>
					</>
				)}
			</EditableRow>
			<EditableRow
				icon="courses"
				title={event.course ? `${event.course.code} · ${event.course.title}` : undefined}
				placeholder="Add a course"
				editLabel="Edit course"
				values={{ courseId: event.courseId }}
				onSave={({ courseId }) => updateEvent(event.id, { courseId })}
			>
				{(draft, update) => (
					<ItemField label="Course">
						<SelectField
							label="Course"
							options={[
								...courses.map((course) => ({
									value: course.id as number | null,
									label: `${course.code} · ${course.title}`,
								})),
								{ value: null, label: 'No course' },
							]}
							selected={draft.courseId}
							onSelect={(courseId) => update('courseId', courseId)}
						/>
					</ItemField>
				)}
			</EditableRow>
			<EditableRow
				icon="calendar"
				title={`${formatLongDate(event.date)}, ${event.date.slice(0, 4)}`}
				subtitle={joinParts(formatItemTime(event), event.location) || undefined}
				placeholder="Add a date"
				editLabel="Edit date, time and location"
				values={{
					date: event.date,
					startTime: event.startTime,
					endTime: event.endTime,
					location: event.location ?? '',
				}}
				onSave={({ date: newDate, startTime, endTime, location }) => {
					if (startTime !== null && endTime !== null && endTime <= startTime)
						return 'The end time must be after the start time.';
					updateEvent(event.id, {
						date: newDate,
						startTime,
						endTime,
						location: orNull(location),
					});
				}}
			>
				{(draft, update) => (
					<>
						<DateField
							label="Date"
							value={isoToDate(draft.date) ?? date}
							onChange={(picked) => update('date', dateToIso(picked))}
						/>
						<EventTimeFields
							start={draft.startTime}
							end={draft.endTime}
							onChange={(start, end) => {
								update('startTime', start);
								update('endTime', end);
							}}
						/>
						<TextField
							label="Location"
							value={draft.location}
							onChangeText={(text) => update('location', text)}
						/>
					</>
				)}
			</EditableRow>
			<EditableRow
				icon="bell"
				title={describeReminder(reminder)}
				subtitle={custom ? 'Reminder modified' : 'Default reminder'}
				subtitleClassName={custom ? 'font-inter-semibold text-sylla-brown' : undefined}
				placeholder="Add a reminder"
				editLabel="Edit reminder"
				accessory={
					custom ? (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Revert reminder to default"
							onPress={() =>
								updateEvent(event.id, {
									reminderEnabled: null,
									reminderDaysAhead: null,
									reminderTime: null,
								})
							}
							hitSlop={12}
							className="h-7 w-7 items-center justify-center"
						>
							<AppIcon name="undo" size={18} />
						</Pressable>
					) : undefined
				}
				values={reminder}
				onSave={(next) => {
					const isDefault =
						next.enabled === defaults.enabled &&
						next.daysAhead === defaults.daysAhead &&
						next.time === defaults.time;
					if (next.enabled) void requestReminderPermission();
					updateEvent(
						event.id,
						isDefault
							? { reminderEnabled: null, reminderDaysAhead: null, reminderTime: null }
							: {
									reminderEnabled: next.enabled,
									reminderDaysAhead: next.daysAhead,
									reminderTime: next.time,
								},
					);
				}}
			>
				{(draft, update) => (
					<>
						<View className="min-h-11 flex-row items-center justify-between">
							<AppText variant="label">Remind me</AppText>
							<AppSwitch
								label="Remind me"
								value={draft.enabled}
								onValueChange={(enabled) => update('enabled', enabled)}
							/>
						</View>
						{draft.enabled && (
							<ReminderWheels
								daysAhead={draft.daysAhead}
								time={draft.time}
								onDaysAheadChange={(daysAhead) => update('daysAhead', daysAhead)}
								onTimeChange={(time) => update('time', time)}
							/>
						)}
					</>
				)}
			</EditableRow>
			<EditableRow
				icon="document"
				title={event.notes ? 'Notes' : undefined}
				subtitle={event.notes ?? undefined}
				placeholder="Add notes"
				editLabel="Edit notes"
				values={{ notes: event.notes ?? '' }}
				onSave={({ notes }) => updateEvent(event.id, { notes: orNull(notes) })}
			>
				{(draft, update) => (
					<TextField
						label="Notes"
						value={draft.notes}
						onChangeText={(text) => update('notes', text)}
						multiline
						textAlignVertical="top"
						className="min-h-20 py-2.5"
					/>
				)}
			</EditableRow>
		</AppCard>
	);
}
