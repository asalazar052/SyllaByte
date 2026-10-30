import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import {
	type CourseCredits,
	courseCreditsQuery,
	type Semester,
	semestersQuery,
} from '@/db/queries';
import { formatDateRange } from '@/lib/dates';
import { joinParts } from '@/lib/format';

import { SettingRow, SettingsGroup } from './setting-row';

// Placeholders until accounts and saved preferences exist.
const profile = { name: 'Student Name', email: 'student@school.edu' };
const remindersSummary = '3 days before · 9:00 AM';
const calendarSync = { account: 'Outlook Calendar', status: 'On' };

function initials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join('');
}

// 'Aug 31–Dec 18 · 4 courses · 14 credits'
function semesterSummary(semester: Semester, courses: CourseCredits[]) {
	const semesterCourses = courses.filter((course) => course.semesterId === semester.id);
	const credits = semesterCourses.reduce((total, course) => total + (course.credits ?? 0), 0);
	return joinParts(
		formatDateRange(semester.startDate, semester.endDate),
		`${semesterCourses.length} ${semesterCourses.length === 1 ? 'course' : 'courses'}`,
		`${credits} credits`,
	);
}

// Edit, Help, Sign out and the rows with a chevron have no handler yet; each gets one when its feature lands.
export function SettingsScreen() {
	const { data: semesters } = useLiveQuery(semestersQuery());
	const { data: courses } = useLiveQuery(courseCreditsQuery());
	const [reviewBeforeAdding, setReviewBeforeAdding] = useState(true);
	const [remindersOn, setRemindersOn] = useState(true);

	return (
		<Screen>
			<View className="min-h-5 flex-row items-center justify-between">
				<AppText variant="eyebrow" accessibilityRole="header" className="text-sylla-blue">
					SYLLABYTE / SETTINGS
				</AppText>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Help"
					hitSlop={12}
					className="h-5 w-6 items-center justify-center active:opacity-70"
				>
					<AppIcon name="circleHelp" size={21} />
				</Pressable>
			</View>

			<View className="flex-row items-center gap-3">
				<View className="h-14 w-14 items-center justify-center rounded-full bg-sylla-paleBlue">
					<AppText variant="section" className="font-inter-semibold text-sylla-blue">
						{initials(profile.name)}
					</AppText>
				</View>
				<View className="min-w-0 flex-1 gap-1">
					<AppText variant="section" className="font-inter-semibold">
						{profile.name}
					</AppText>
					<AppText variant="caption" className="text-sylla-muted">
						{profile.email}
					</AppText>
				</View>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Edit profile"
					hitSlop={12}
					className="active:opacity-70"
				>
					<AppText variant="action" className="text-sylla-blue">
						Edit
					</AppText>
				</Pressable>
			</View>

			{semesters.length > 0 && (
				<SettingsGroup title="YOUR SEMESTERS">
					{semesters.map((semester) => (
						<SettingRow
							key={semester.id}
							icon="graduationCap"
							title={semester.name}
							description={semesterSummary(semester, courses)}
							chevron
						/>
					))}
				</SettingsGroup>
			)}

			<SettingsGroup title="SYLLABUS & OCR">
				<SettingRow
					icon="scan"
					title="Review before adding"
					description="Confirm uncertain dates and details"
					toggle={{ value: reviewBeforeAdding, onValueChange: setReviewBeforeAdding }}
				/>
				<SettingRow
					icon="shieldCheck"
					title="Your data"
					description="Manage files, export or delete data"
					chevron
				/>
			</SettingsGroup>

			<SettingsGroup title="STAY ORGANIZED">
				<SettingRow
					icon="bell"
					title="Default reminders"
					description={remindersSummary}
					toggle={{ value: remindersOn, onValueChange: setRemindersOn }}
					chevron
				/>
				<SettingRow
					icon="calendarCheck"
					title="Calendar sync"
					description={calendarSync.account}
					value={calendarSync.status}
					chevron
				/>
			</SettingsGroup>

			<View className="flex-row items-start justify-between gap-3">
				<AppText variant="micro" className="min-w-0 flex-1 text-sylla-muted">
					SyllaByte {Constants.expoConfig?.version} · A little less to carry.
				</AppText>
				<Pressable accessibilityRole="button" hitSlop={12} className="active:opacity-70">
					<AppText variant="caption" className="font-inter-medium text-sylla-blue">
						Sign out
					</AppText>
				</Pressable>
			</View>
		</Screen>
	);
}
