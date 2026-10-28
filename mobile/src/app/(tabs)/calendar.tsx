import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SavedResources } from '@/features/courses/saved-resources';

export default function Calendar() {
	return (
		<Screen>
			<AppText variant="eyebrow" className="text-sylla-blue">
				SYLLABYTE / CALENDAR
			</AppText>
			<AppText variant="title" accessibilityRole="header">
				Your important dates.
			</AppText>
			<AppText className="text-sylla-muted">
				Dates you accepted while reviewing your syllabi, in date order.
			</AppText>
			<SavedResources kind="dates" />
		</Screen>
	);
}
