import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { type SavedDate, type UpcomingDate } from '@/db/queries';
import { toIsoDate } from '@/lib/dates';
import { showEventOnCalendar } from '@/lib/show-event';

import { ImportantDateCard } from './important-date-card';

// A list of dated items, such as a course's exams and quizzes. `linkToCalendar` makes each card open its
// event on the calendar, on the day it falls. `emptyMessage` is shown when there are none.
export function ImportantDatesList({
	dates,
	linkToCalendar = false,
	emptyMessage = 'No exams or quizzes saved yet. Review and add a syllabus to see them here.',
}: {
	dates: (SavedDate | UpcomingDate)[];
	linkToCalendar?: boolean;
	emptyMessage?: string;
}) {
	const today = toIsoDate(new Date());
	return (
		<View className="gap-2.5">
			{dates.length === 0 && (
				<AppCard>
					<AppText className="text-sylla-muted">{emptyMessage}</AppText>
				</AppCard>
			)}
			{dates.map((date) => (
				<ImportantDateCard
					key={date.item.id}
					date={date}
					today={today}
					onPress={linkToCalendar ? () => showEventOnCalendar(date.item) : undefined}
				/>
			))}
		</View>
	);
}
