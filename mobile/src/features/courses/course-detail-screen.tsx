import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { courseQuery } from '@/db/queries';

import { CourseInformation } from './course-information';

export function CourseDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: course, updatedAt } = useLiveQuery(courseQuery(id), [id]);
	function back() {
		if (router.canGoBack()) router.back();
		else router.replace('/courses');
	}
	return (
		<Screen>
			<Pressable
				accessibilityRole="button"
				onPress={back}
				className="min-h-11 justify-center self-start"
			>
				<AppText variant="action" className="text-sylla-blue">
					← Back to courses
				</AppText>
			</Pressable>
			{updatedAt === undefined ? null : !course ? (
				<AppCard>
					<AppText variant="heading">Course not found</AppText>
					<AppText>This course is not part of your mock semester.</AppText>
				</AppCard>
			) : (
				<>
					<AppText variant="eyebrow" className="text-sylla-blue">
						COURSES / {course.code}
					</AppText>
					<AppText variant="title" accessibilityRole="header">
						{course.title}
					</AppText>
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
					<AppText variant="caption" className="text-sylla-muted">
						Course details preview · Editing, confirmation, and syllabus viewing will
						arrive with the review milestone.
					</AppText>
				</>
			)}
		</Screen>
	);
}
