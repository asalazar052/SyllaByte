import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SavedResources } from '@/features/courses/saved-resources';

export default function Materials() {
	return (
		<Screen>
			<AppText variant="eyebrow" className="text-sylla-blue">
				SYLLABYTE / MATERIALS
			</AppText>
			<AppText variant="title" accessibilityRole="header">
				Your course materials.
			</AppText>
			<AppText className="text-sylla-muted">
				Textbooks and resources you accepted while reviewing your syllabi.
			</AppText>
			<SavedResources kind="materials" />
		</Screen>
	);
}
