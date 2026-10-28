import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { DaysField } from '@/components/ui/days-field';
import { TextField } from '@/components/ui/text-field';
import { TimeRangeField } from '@/components/ui/time-range-field';
import { saveOfficeHours, updateCourse, updateProfessor } from '@/db/mutations';
import { type CourseDetail, officeHoursQuery, professorQuery } from '@/db/queries';
import { formatTimeRange, joinParts } from '@/lib/format';

import { EditableRow } from './editable-row';

const EMAIL = /^\S+@\S+\.\S+$/;
const TIME_ORDER = 'The end time must be after the start time.';

// Every field can be cleared: an emptied field is stored as null.
const orNull = (text: string) => text.trim() || null;

export function CourseInformation({ course }: { course: CourseDetail }) {
	const { data } = useLiveQuery(professorQuery(course.professorId ?? 0), [course.professorId]);
	const professor = data[0];
	const { data: hoursData } = useLiveQuery(officeHoursQuery(professor?.id ?? 0, course.id), [
		professor?.id,
		course.id,
	]);
	const hours = hoursData[0];

	return (
		<AppCard>
			<AppText variant="heading">Course information</AppText>
			<EditableRow
				icon="calendar"
				title={joinParts(course.days, formatTimeRange(course.startTime, course.endTime))}
				subtitle={course.location ?? undefined}
				placeholder="Add schedule and location"
				editLabel="Edit schedule and location"
				values={{
					days: course.days ?? '',
					startTime: course.startTime,
					endTime: course.endTime,
					location: course.location ?? '',
				}}
				onSave={({ days, startTime, endTime, location }) => {
					if (startTime !== null && endTime !== null && endTime <= startTime)
						return TIME_ORDER;
					updateCourse(course.id, {
						days: days || null,
						startTime,
						endTime,
						location: orNull(location),
					});
				}}
			>
				{(draft, update) => (
					<>
						<DaysField
							label="Days"
							value={draft.days}
							onChange={(days) => update('days', days)}
						/>
						<TimeRangeField
							label="Time"
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
			{professor && (
				<>
					<EditableRow
						icon="user"
						title={professor.name ?? undefined}
						subtitle={professor.email ?? undefined}
						placeholder="Add professor details"
						editLabel="Edit professor name and email"
						values={{ name: professor.name ?? '', email: professor.email ?? '' }}
						onSave={({ name, email }) => {
							if (email.trim() && !EMAIL.test(email.trim()))
								return 'Enter a valid email address.';
							updateProfessor(professor.id, {
								name: orNull(name),
								email: orNull(email),
							});
						}}
					>
						{(draft, update) => (
							<>
								<TextField
									label="Professor"
									value={draft.name}
									onChangeText={(text) => update('name', text)}
								/>
								<TextField
									label="Email"
									value={draft.email}
									onChangeText={(text) => update('email', text)}
									keyboardType="email-address"
									autoCapitalize="none"
								/>
							</>
						)}
					</EditableRow>
					<EditableRow
						icon="clock"
						title={hours ? joinParts('Office hours', hours.days) : undefined}
						subtitle={
							hours
								? joinParts(
										formatTimeRange(hours.startTime, hours.endTime),
										hours.location,
									)
								: undefined
						}
						placeholder="Add office hours"
						editLabel={hours ? 'Edit office hours' : 'Add office hours'}
						values={{
							days: hours?.days ?? '',
							startTime: hours?.startTime ?? null,
							endTime: hours?.endTime ?? null,
							location: hours?.location ?? '',
						}}
						onSave={({ days, startTime, endTime, location }) => {
							if (startTime !== null && endTime !== null && endTime <= startTime)
								return TIME_ORDER;
							saveOfficeHours(professor.id, course.id, {
								days: days || null,
								startTime,
								endTime,
								location: orNull(location),
							});
						}}
					>
						{(draft, update) => (
							<>
								<DaysField
									label="Office hours days"
									value={draft.days}
									onChange={(days) => update('days', days)}
								/>
								<TimeRangeField
									label="Office hours time"
									start={draft.startTime}
									end={draft.endTime}
									onChange={(start, end) => {
										update('startTime', start);
										update('endTime', end);
									}}
								/>
								<TextField
									label="Office hours location"
									value={draft.location}
									onChangeText={(text) => update('location', text)}
								/>
							</>
						)}
					</EditableRow>
				</>
			)}
			<EditableRow
				title={course.credits ? `${course.credits} credits` : undefined}
				placeholder="Add credits"
				editLabel="Edit credits"
				values={{ credits: course.credits === null ? '' : String(course.credits) }}
				onSave={({ credits }) => {
					if (
						credits.trim() &&
						(!/^\d+$/.test(credits.trim()) || Number(credits) === 0)
					) {
						return 'Credits must be a whole number above 0.';
					}
					updateCourse(course.id, { credits: credits.trim() ? Number(credits) : null });
				}}
			>
				{(draft, update) => (
					<TextField
						label="Credits"
						value={draft.credits}
						onChangeText={(text) => update('credits', text)}
						keyboardType="number-pad"
					/>
				)}
			</EditableRow>
		</AppCard>
	);
}
