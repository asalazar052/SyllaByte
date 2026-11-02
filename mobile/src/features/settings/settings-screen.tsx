import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { updateSettings } from '@/db/mutations';
import {
	type CourseCredits,
	courseCreditsQuery,
	type Semester,
	semestersQuery,
	settingsQuery,
} from '@/db/queries';
import { formatDateRange } from '@/lib/dates';
import { formatLeadTime, formatTime, joinParts } from '@/lib/format';

import { SettingRow, SettingsGroup } from './setting-row';

// A placeholder until calendar sync exists.
const calendarSync = { account: 'No account linked', status: 'Off' };

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

// Help, Sign out and the Calendar sync row have no handler yet; each gets one when its feature lands.
export function SettingsScreen() {
	const { data: settings } = useLiveQuery(settingsQuery());
	const { data: semesters } = useLiveQuery(semestersQuery());
	const { data: courses } = useLiveQuery(courseCreditsQuery());
	if (!settings) return null;

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
					{settings.fullName ? (
						<AppText variant="section" className="font-inter-semibold text-sylla-blue">
							{initials(settings.fullName)}
						</AppText>
					) : (
						<AppIcon name="user" size={22} tintColor={SyllaColors.blue} />
					)}
				</View>
				<View className="min-w-0 flex-1 gap-1">
					<AppText
						variant="section"
						className={settings.fullName ? 'font-inter-semibold' : 'text-sylla-muted'}
					>
						{settings.fullName ?? 'Add your name'}
					</AppText>
					<AppText variant="caption" className="text-sylla-muted">
						{settings.email ?? 'Add your email'}
					</AppText>
				</View>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Edit profile"
					onPress={() => router.push('/settings/edit-profile')}
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
							onPress={() => router.push('/courses')}
						/>
					))}
				</SettingsGroup>
			)}

			<SettingsGroup title="SYLLABUS & OCR">
				<SettingRow
					icon="scan"
					title="Review before adding"
					description="Confirm uncertain dates and details"
					toggle={{
						value: settings.reviewBeforeAdding,
						onValueChange: (value) => updateSettings({ reviewBeforeAdding: value }),
					}}
				/>
				<SettingRow
					icon="shieldCheck"
					title="Your data"
					description="Manage files, export or delete data"
					chevron
					onPress={() => router.push('/settings/uploaded-files')}
				/>
			</SettingsGroup>

			<SettingsGroup title="STAY ORGANIZED">
				<SettingRow
					icon="bell"
					title="Default reminders"
					description={joinParts(
						`${formatLeadTime(settings.reminderDaysAhead)} before`,
						formatTime(settings.reminderTime),
					)}
					toggle={{
						value: settings.defaultRemindersEnabled,
						onValueChange: (value) =>
							updateSettings({ defaultRemindersEnabled: value }),
					}}
					chevron
					onPress={() => router.push('/settings/reminders')}
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
