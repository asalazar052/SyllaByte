import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { TabHeader } from '@/components/ui/tab-header';
import { useCurrentSemesterCourses, useSettings } from '@/db/hooks';
import { upcomingDatesQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { eventTypeInfo } from '@/domain/event-types';
import { ImportantDatesList } from '@/features/courses/important-dates-list';
import { useNow } from '@/hooks/use-now';
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
	const now = useNow();
	const today = toIsoDate(now);
	const settings = useSettings();
	const { semester, courses } = useCurrentSemesterCourses();
	const progress = semester ? semesterProgress(semester, today) : null;
	const weekEnd = progress?.week?.end;
	const comingUpEnd = addDays(today, COMING_UP_DAYS);
	const { data: upcoming } = useQuery(upcomingDatesQuery(today, comingUpEnd), [
		today,
		comingUpEnd,
	]);

	// The week is part of the 30 days "Coming up" already loads, so it needs no query of its own.
	const dueThisWeek = weekEnd
		? upcoming.filter(({ item }) => item.date <= weekEnd && eventTypeInfo[item.type].deadline)
				.length
		: 0;
	const name = (settings?.preferredName || settings?.fullName)?.trim().split(/\s+/)[0];

	return (
		<Screen>
			<TabHeader
				eyebrow="SYLLABYTE / YOUR SEMESTER"
				title={`${greeting(now.getHours())}${name ? `, ${name}.` : '.'}`}
				action={{
					icon: 'bell',
					label: 'Notifications',
					onPress: () => router.push('/home/notifications'),
				}}
			/>

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
