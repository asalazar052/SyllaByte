import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { cardClassName } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { type Course } from '@/db/queries';
import { formatTimeRange, joinParts } from '@/lib/format';

import { CourseIcon } from './course-icon';

export function CourseCard({ course }: { course: Course }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${course.code}, ${course.title}${course.reviewFields.length ? ', needs review' : ''}`}
			onPress={() => router.push({ pathname: '/courses/[id]', params: { id: course.id } })}
			className={`${cardClassName} min-h-20 flex-row items-center gap-3 p-3.5 active:opacity-70`}
		>
			<CourseIcon icon={course.icon} background={course.iconBackground} />
			<View className="flex-1 gap-1.5">
				<View className="flex-row flex-wrap items-center gap-2">
					<AppText variant="code" className="text-sylla-blue">
						{course.code}
					</AppText>
					{course.reviewFields.length > 0 && (
						<AppText variant="code" className="text-sylla-brown">
							• Review
						</AppText>
					)}
				</View>
				<AppText variant="heading">{course.title}</AppText>
				<AppText variant="micro" className="text-sylla-muted">
					{joinParts(
						course.days,
						formatTimeRange(course.startTime, course.endTime),
						course.credits !== null && `${course.credits} credits`,
					)}
				</AppText>
			</View>
			<AppIcon name="chevron" size={15} />
		</Pressable>
	);
}
