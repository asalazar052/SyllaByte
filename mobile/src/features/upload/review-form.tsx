import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { DaysField } from '@/components/ui/days-field';
import { TextField } from '@/components/ui/text-field';
import { TimeRangeField } from '@/components/ui/time-range-field';

import type { CourseDraft } from './review-draft';
import { useSyllabusPicker } from './syllabus-picker';

function Check({
	label,
	checked,
	onPress,
}: {
	label: string;
	checked: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="checkbox"
			accessibilityLabel={label}
			accessibilityState={{ checked }}
			onPress={onPress}
			className="min-h-11 flex-row items-center gap-3 py-2"
		>
			<AppText className="text-sylla-blue">{checked ? '☑' : '☐'}</AppText>
			<AppText className="flex-1">{label}</AppText>
		</Pressable>
	);
}

export function ReviewForm() {
	const { extraction, updateDraft, saving, save, error, clear } = useSyllabusPicker();
	const draft = extraction.result?.draft;
	if (!draft) return null;
	function update<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
		updateDraft({ ...draft!, [key]: value });
	}
	const text = (
		key: keyof CourseDraft &
			(
				| 'code'
				| 'title'
				| 'semester'
				| 'credits'
				| 'location'
				| 'professorName'
				| 'professorEmail'
				| 'officeLocation'
			),
		label: string,
	) => (
		<TextField
			label={label}
			value={draft[key]}
			onChangeText={(value) => update(key, value)}
			editable={!saving}
		/>
	);
	const dateCount = draft.dates.filter((item) => item.include).length;
	const materialCount = draft.materials.filter((item) => item.include).length;
	return (
		<View className="gap-4">
			<AppText variant="section" accessibilityRole="header">
				Review your course
			</AppText>
			<AppText className="text-sylla-muted">
				These are sample results. Edit the details, then confirm or exclude highlighted
				items before adding the course.
			</AppText>
			<View pointerEvents={saving ? 'none' : 'auto'} className="gap-4">
				<AppCard>
					<AppText variant="heading">Course information</AppText>
					{text('code', 'Course code *')}
					{text('title', 'Course title *')}
					{text('semester', 'Semester *')}
					{text('credits', 'Credits')}
					<DaysField
						label="Class days"
						value={draft.days}
						onChange={(value) => update('days', value)}
					/>
					<TimeRangeField
						label="Class time"
						start={draft.startTime}
						end={draft.endTime}
						onChange={(startTime, endTime) =>
							updateDraft({ ...draft, startTime, endTime })
						}
					/>
					{text('location', 'Class location')}
				</AppCard>
				<AppCard>
					<AppText variant="heading">Professor and office hours</AppText>
					{text('professorName', 'Professor name')}
					{text('professorEmail', 'Professor email')}
					<DaysField
						label="Office days"
						value={draft.officeDays}
						onChange={(value) => update('officeDays', value)}
					/>
					<TimeRangeField
						label="Office hours"
						start={draft.officeStart}
						end={draft.officeEnd}
						onChange={(officeStart, officeEnd) =>
							updateDraft({ ...draft, officeStart, officeEnd })
						}
					/>
					{text('officeLocation', 'Office location')}
				</AppCard>
				<AppCard>
					<AppText variant="heading">Important dates</AppText>
					<AppText variant="caption" className="text-sylla-muted">
						Times use 24-hour HH:MM. Leave the time blank for a date-only event.
					</AppText>
					{draft.dates.map((item) => {
						const change = (values: Partial<typeof item>) =>
							update(
								'dates',
								draft.dates.map((row) =>
									row.id === item.id
										? {
												...row,
												confirmed: row.needsReview ? false : row.confirmed,
												...values,
											}
										: row,
								),
							);
						return (
							<View
								key={item.id}
								className={
									item.needsReview && !item.confirmed && item.include
										? 'gap-2 rounded-small bg-sylla-peach p-3'
										: 'gap-2 border-t border-sylla-border pt-3'
								}
							>
								<Check
									label={`Include ${item.title || 'date'} in Calendar`}
									checked={item.include}
									onPress={() => change({ include: !item.include })}
								/>
								{item.include && (
									<>
										<TextField
											label="Event title"
											value={item.title}
											onChangeText={(title) => change({ title })}
										/>
										<TextField
											label="Date (YYYY-MM-DD)"
											value={item.date}
											onChangeText={(date) => change({ date })}
											autoCapitalize="none"
										/>
										<TextField
											label="Time (HH:MM, optional)"
											value={item.time}
											onChangeText={(time) => change({ time })}
										/>
										{item.needsReview && (
											<>
												<AppText
													variant="caption"
													className="text-sylla-brown"
												>
													Needs review: the sample did not specify a time.
												</AppText>
												<Check
													label="I have reviewed this date and time"
													checked={item.confirmed}
													onPress={() =>
														change({ confirmed: !item.confirmed })
													}
												/>
											</>
										)}
									</>
								)}
							</View>
						);
					})}
				</AppCard>
				<AppCard>
					<AppText variant="heading">Materials</AppText>
					{draft.materials.map((item) => {
						const change = (values: Partial<typeof item>) =>
							update(
								'materials',
								draft.materials.map((row) =>
									row.id === item.id
										? {
												...row,
												confirmed: row.needsReview ? false : row.confirmed,
												...values,
											}
										: row,
								),
							);
						return (
							<View
								key={item.id}
								className={
									item.needsReview && !item.confirmed && item.include
										? 'gap-2 rounded-small bg-sylla-peach p-3'
										: 'gap-2 border-t border-sylla-border pt-3'
								}
							>
								<Check
									label={`Include ${item.title || 'material'}`}
									checked={item.include}
									onPress={() => change({ include: !item.include })}
								/>
								{item.include && (
									<>
										<TextField
											label="Material title"
											value={item.title}
											onChangeText={(title) => change({ title })}
										/>
										<TextField
											label="Details"
											value={item.details}
											onChangeText={(details) => change({ details })}
										/>
										{item.needsReview && (
											<>
												<AppText
													variant="caption"
													className="text-sylla-brown"
												>
													Needs review: check the textbook edition.
												</AppText>
												<Check
													label="I have reviewed this material"
													checked={item.confirmed}
													onPress={() =>
														change({ confirmed: !item.confirmed })
													}
												/>
											</>
										)}
									</>
								)}
							</View>
						);
					})}
				</AppCard>
			</View>
			<AppText>
				{dateCount} dates and {materialCount} materials will be saved with this course.
			</AppText>
			{error && (
				<AppText accessibilityRole="alert" className="text-sylla-brown">
					{error}
				</AppText>
			)}
			<AppButton
				label={saving ? 'Saving course…' : 'Confirm and add course'}
				disabled={saving}
				onPress={async () => {
					if (await save()) {
						clear();
						router.replace('/courses');
					}
				}}
			/>
		</View>
	);
}
