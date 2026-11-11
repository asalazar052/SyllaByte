import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { goBackOr, PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import {
	courseQuery,
	courseSyllabusQuery,
	savedDatesQuery,
	savedMaterialsQuery,
} from '@/db/queries';

import { CourseIcon } from './course-icon';
import { CourseInformation } from './course-information';
import { DeleteCourseAction } from './delete-course-action';
import { SavedResources, SyllabusAttachment } from './saved-resources';

export function CourseDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const courseId = Number.isInteger(Number(id)) ? Number(id) : 0;
	const { data: course, updatedAt } = useLiveQuery(courseQuery(courseId), [courseId]);
	const { data: syllabus } = useLiveQuery(courseSyllabusQuery(courseId), [courseId]);
	const { data: dates } = useLiveQuery(savedDatesQuery(courseId), [courseId]);
	const { data: materials } = useLiveQuery(savedMaterialsQuery(courseId), [courseId]);
	// The dates and materials belong to the course, so they stay when its syllabus file is removed.
	const hasResources = dates.length > 0 || materials.length > 0;
	return (
		<Screen>
			<PageHeader
				parent={course ? `COURSES / ${course.code}` : 'COURSES'}
				backLabel="Back to courses"
				onBack={() => goBackOr('/courses')}
				title={course?.title}
				accessory={
					course && (
						<CourseIcon
							icon={course.icon}
							background={course.iconBackground}
							width={80}
							height={80}
						/>
					)
				}
			/>
			{updatedAt === undefined ? null : !course ? (
				<AppCard>
					<AppText variant="heading">Course not found</AppText>
					<AppText>This course is not part of your mock semester.</AppText>
				</AppCard>
			) : (
				<>
					<CourseInformation course={course} />
					{course.reviewFields.length > 0 && (
						<AppCard
							className="border-sylla-peach bg-sylla-peach"
							rightCornerIcon={<AppIcon name="scan" size={22} />}
						>
							<AppText variant="heading">
								{course.reviewFields.length}{' '}
								{course.reviewFields.length === 1 ? 'detail needs' : 'details need'}{' '}
								a closer look
							</AppText>
							<AppText className="text-sylla-brown">
								These mock fields are flagged for review. Compare them with your
								syllabus before relying on them.
							</AppText>
							{course.reviewFields.map((field) => (
								<View
									key={field.label}
									className="gap-1 rounded-small bg-sylla-surface p-3"
								>
									<AppText variant="label">{field.label}</AppText>
									<AppText>{field.value}</AppText>
								</View>
							))}
						</AppCard>
					)}
					{syllabus && (
						<SyllabusAttachment
							name={syllabus.filename}
							courseId={course.id}
							uploadedAt={syllabus.uploadedAt}
						/>
					)}
					{hasResources && (
						<>
							<AppText variant="section">Important dates</AppText>
							<SavedResources kind="dates" courseId={course.id} />
							<AppText variant="section">Materials</AppText>
							<SavedResources kind="materials" courseId={course.id} />
						</>
					)}
					<DeleteCourseAction
						id={course.id}
						code={course.code}
						onDeleted={() => router.replace('/courses')}
					/>
				</>
			)}
		</Screen>
	);
}
