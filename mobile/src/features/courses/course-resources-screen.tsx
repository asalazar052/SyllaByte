import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { courseQuery } from '@/db/queries';

import { SavedResources } from './saved-resources';

function CourseResourcesScreen({ kind }: { kind: 'dates' | 'materials' }) {
	const { id: routeId } = useLocalSearchParams<{ id: string }>();
	const id = Number.isSafeInteger(Number(routeId)) && Number(routeId) > 0 ? Number(routeId) : 0;
	const { data: course, updatedAt } = useLiveQuery(courseQuery(id), [id]);
	return (
		<Screen>
			<PageHeader
				parent={`${course?.code ?? 'COURSE'} / ${kind.toUpperCase()}`}
				backLabel="Back to course"
				onBack={() => router.dismissTo({ pathname: '/courses/[id]', params: { id } })}
				title={kind === 'dates' ? 'Important dates' : 'Course materials'}
			/>
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
