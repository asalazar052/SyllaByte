import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { courseQuery } from '@/db/queries';

import { SavedResources } from './saved-resources';

function CourseResourcesScreen({ kind }: { kind: 'dates' | 'materials' }) {
	const { id: routeId } = useLocalSearchParams<{ id: string }>();
	const id = Number.isSafeInteger(Number(routeId)) && Number(routeId) > 0 ? Number(routeId) : 0;
	const { data: course, updatedAt } = useLiveQuery(courseQuery(id), [id]);
	return (
		<Screen>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Back to course"
				onPress={() => router.dismissTo({ pathname: '/courses/[id]', params: { id } })}
				className="min-h-11 flex-row items-center gap-2"
			>
				<AppIcon name="arrow-left" size={17} />
				<AppText variant="eyebrow" className="text-sylla-blue">
					{course?.code ?? 'COURSE'} / {kind.toUpperCase()}
				</AppText>
			</Pressable>
			<AppText variant="title" accessibilityRole="header">
				{kind === 'dates' ? 'Important dates' : 'Course materials'}
			</AppText>
			{updatedAt === undefined ? null : !course ? (
				<AppText>This course could not be found.</AppText>
			) : (
				<SavedResources kind={kind} courseId={id} />
			)}
		</Screen>
	);
}
export function CourseMaterialsScreen() {
	return <CourseResourcesScreen kind="materials" />;
}
export function CourseDatesScreen() {
	return <CourseResourcesScreen kind="dates" />;
}
