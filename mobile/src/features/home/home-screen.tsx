import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import {
	currentSemesterQuery,
	eventsBetweenQuery,
	semesterCoursesQuery,
	settingsQuery,
	upcomingDatesQuery,
} from '@/db/queries';
import { ImportantDatesList } from '@/features/courses/important-dates-list';
import { addDays, toIsoDate } from '@/lib/dates';

import { SemesterOverview } from './semester-overview';
import { semesterProgress } from './semester-progress';
import { SyllabusProgressCard } from './syllabus-progress-card';

// How many days ahead, counting from today, "Coming up" reaches.
const COMING_UP_DAYS = 30;

function greeting(hour: number) {
	return hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
}

export function HomeScreen() {
	const now = new Date();
	const today = toIsoDate(now);
	const { data: settings } = useLiveQuery(settingsQuery());
	const { data: semester } = useLiveQuery(currentSemesterQuery());
	const { data: courses } = useLiveQuery(semesterCoursesQuery(semester?.id ?? 0), [semester?.id]);
	const progress = semester ? semesterProgress(semester, today) : null;
	const weekEnd = progress?.week?.end ?? today;
	const { data: weekEvents } = useLiveQuery(eventsBetweenQuery(today, weekEnd), [today, weekEnd]);
	const comingUpEnd = addDays(today, COMING_UP_DAYS);
	const { data: upcoming } = useLiveQuery(upcomingDatesQuery(today, comingUpEnd), [
		today,
		comingUpEnd,
	]);

	// A reminder isn't something that is due, so it doesn't count toward the week.
	const dueThisWeek = progress?.week
		? weekEvents.filter((event) => event.type !== 'other').length
		: 0;
	const name = (settings?.preferredName || settings?.fullName)?.trim().split(/\s+/)[0];

	return (
		<Screen>
			<View className="gap-4">
				<View className="min-h-5 flex-row items-center justify-between">
					<AppText variant="eyebrow" className="text-sylla-blue">
						SYLLABYTE / YOUR SEMESTER
					</AppText>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Notifications"
						onPress={() => router.push('/home/notifications')}
						hitSlop={12}
						className="h-5 w-6 items-center justify-center active:opacity-70"
					>
						<AppIcon name="bell" size={21} />
					</Pressable>
				</View>
				<AppText variant="title" accessibilityRole="header">
					{greeting(now.getHours())}
					{name ? `, ${name}.` : '.'}
				</AppText>
			</View>

			{semester && progress && (
				<SemesterOverview
					name={semester.name}
					summary={progress.summary}
					courseCount={courses.length}
					dueThisWeek={dueThisWeek}
				/>
			)}

			<SyllabusProgressCard />

			<View className="gap-3">
				<View className="flex-row items-center justify-between gap-3">
					<AppText variant="section" accessibilityRole="header">
						Coming up
					</AppText>
					<Pressable
						accessibilityRole="link"
						onPress={() => router.navigate('/calendar')}
						hitSlop={12}
						className="active:opacity-70"
					>
						<AppText variant="action" className="text-sylla-blue">
							View calendar →
						</AppText>
					</Pressable>
				</View>
				<ImportantDatesList
					dates={upcoming}
					linkToCalendar
					emptyMessage="Nothing in the next 30 days. Add an item to the calendar or upload a syllabus."
				/>
			</View>
		</Screen>
	);
}
