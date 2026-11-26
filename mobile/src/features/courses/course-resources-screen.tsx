import { router, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { courseQuery, savedDatesQuery, savedMaterialsQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { MaterialList } from '@/features/materials';

import { ImportantDatesList } from './important-dates-list';

function CourseDates({ courseId }: { courseId: number }) {
	const { data } = useQuery(savedDatesQuery(courseId), [courseId]);
	return <ImportantDatesList dates={data} linkToCalendar />;
}

function CourseMaterials({ courseId }: { courseId: number }) {
	const { data } = useQuery(savedMaterialsQuery(courseId), [courseId]);
	return <MaterialList materials={data} />;
}

function CourseResourcesScreen({ kind }: { kind: 'dates' | 'materials' }) {
	const { id: routeId } = useLocalSearchParams<{ id: string }>();
	const id = Number.isSafeInteger(Number(routeId)) && Number(routeId) > 0 ? Number(routeId) : 0;
	const { data: course, updatedAt } = useQuery(courseQuery(id), [id]);
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
			) : kind === 'dates' ? (
				<CourseDates courseId={id} />
			) : (
				<CourseMaterials courseId={id} />
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
