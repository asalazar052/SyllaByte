import { router } from 'expo-router';
import { useState } from 'react';
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
			<View
				className={`h-6 w-6 items-center justify-center rounded border ${checked ? 'border-sylla-blue bg-sylla-blue' : 'border-sylla-muted bg-sylla-surface'}`}
			>
				<AppText className="text-white">{checked ? '✓' : ''}</AppText>
			</View>
			<AppText className="flex-1">{label}</AppText>
		</Pressable>
	);
}

export function ReviewForm() {
	const { extraction, updateDraft, saving, save, error, clear } = useSyllabusPicker();
	const [includeDetails, setIncludeDetails] = useState(true);
	const [includeProfessor, setIncludeProfessor] = useState(true);
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
			<View className="rounded-small bg-sylla-paleBlue p-4">
				<AppText>
					Extraction may be inaccurate. Double-check the information before adding your
					course.
				</AppText>
			</View>
			<AppText className="text-sylla-muted">
				These are sample results. Edit the details and choose what to include.
			</AppText>
			<View pointerEvents={saving ? 'none' : 'auto'} className="gap-4">
				<AppCard>
					<AppText variant="heading">Required course information</AppText>
					<AppText variant="caption" className="text-sylla-muted">
						Required to add your course.
					</AppText>
					{text('code', 'Course code *')}
					{text('title', 'Course title *')}
					{text('semester', 'Semester *')}
				</AppCard>
				<AppCard>
					<AppText variant="heading">Course details · Optional</AppText>
					<Check
						label="Include course details"
						checked={includeDetails}
						onPress={() => setIncludeDetails(!includeDetails)}
					/>
					{includeDetails && (
						<>
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
						</>
					)}
				</AppCard>
				<AppCard>
					<AppText variant="heading">Professor and office hours · Optional</AppText>
					<Check
						label="Include professor and office hours"
						checked={includeProfessor}
						onPress={() => setIncludeProfessor(!includeProfessor)}
					/>
					{includeProfessor && (
						<>
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
						</>
					)}
				</AppCard>
				<AppCard>
					<AppText variant="heading">Important dates · Optional</AppText>
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
							<View key={item.id} className="gap-2 border-t border-sylla-border pt-3">
								<Check
									label={`Include ${item.title || 'date'} in Calendar`}
									checked={item.include}
									onPress={() => change({ include: !item.include })}
								/>
								{item.include && (
									<>
										<TextField
											label="Event title (required if included)"
											value={item.title}
											onChangeText={(title) => change({ title })}
										/>
										<TextField
											label="Date (YYYY-MM-DD, required if included)"
											value={item.date}
											onChangeText={(date) => change({ date })}
											autoCapitalize="none"
										/>
										<TextField
											label="Time (HH:MM, optional)"
											value={item.time}
											onChangeText={(time) => change({ time })}
										/>
									</>
								)}
							</View>
						);
					})}
				</AppCard>
				<AppCard>
					<AppText variant="heading">Materials · Optional</AppText>
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
							<View key={item.id} className="gap-2 border-t border-sylla-border pt-3">
								<Check
									label={`Include ${item.title || 'material'}`}
									checked={item.include}
									onPress={() => change({ include: !item.include })}
								/>
								{item.include && (
									<>
										<TextField
											label="Material title (required if included)"
											value={item.title}
											onChangeText={(title) => change({ title })}
										/>
										<TextField
											label="Details"
											value={item.details}
											onChangeText={(details) => change({ details })}
										/>
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
					if (
						await save({
							...draft,
							...(!includeDetails
								? {
										credits: '',
										days: '',
										startTime: null,
										endTime: null,
										location: '',
									}
								: {}),
							...(!includeProfessor
								? {
										professorName: '',
										professorEmail: '',
										officeDays: '',
										officeStart: null,
										officeEnd: null,
										officeLocation: '',
									}
								: {}),
						})
					) {
						clear();
						router.replace('/courses');
					}
				}}
			/>
		</View>
	);
}
