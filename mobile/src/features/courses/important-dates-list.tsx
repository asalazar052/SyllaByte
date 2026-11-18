import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { type SavedDate } from '@/db/queries';
import { toIsoDate } from '@/lib/dates';
import { showEventOnCalendar } from '@/lib/show-event';

import { ImportantDateCard } from './important-date-card';

// A list of exams and quizzes. `linkToCalendar` makes each card open its event on the calendar, on the
// day it falls.
export function ImportantDatesList({
	dates,
	linkToCalendar = false,
}: {
	dates: SavedDate[];
	linkToCalendar?: boolean;
}) {
	const today = toIsoDate(new Date());
	return (
		<View className="gap-2.5">
			{dates.length === 0 && (
				<AppCard>
					<AppText className="text-sylla-muted">
						No exams or quizzes saved yet. Review and add a syllabus to see them here.
					</AppText>
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
