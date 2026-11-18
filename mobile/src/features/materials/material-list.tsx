import { router } from 'expo-router';
import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { type SavedMaterial } from '@/db/queries';

import { MaterialCard } from './material-card';

// A list of saved materials, shared by the Materials tab and a course's own screens.
// `linkToCourse` makes each card open its course: right on the tab, pointless on the course's own page.
export function MaterialList({
	materials,
	linkToCourse = false,
	emptyTitle,
	emptyMessage = 'No saved materials yet. Review and add a syllabus to see them here.',
}: {
	materials: SavedMaterial[];
	linkToCourse?: boolean;
	emptyTitle?: string;
	emptyMessage?: string;
}) {
	return (
		<View className="gap-2.5">
			{materials.map(({ item, course }) => (
				<MaterialCard
					key={item.id}
					title={item.title}
					details={item.details}
					course={course}
					onPress={
						linkToCourse
							? () =>
									router.push({
										pathname: '/courses/[id]',
										params: { id: course.id },
									})
							: undefined
					}
				/>
			))}
			{materials.length === 0 && (
				<AppCard>
					{emptyTitle && <AppText variant="heading">{emptyTitle}</AppText>}
					<AppText className="text-sylla-muted">{emptyMessage}</AppText>
				</AppCard>
			)}
		</View>
	);
}
