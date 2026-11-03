import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { courseQuery } from '@/db/queries';

import { CourseInformation } from './course-information';
import { CourseTools } from './course-tools';
import { DeleteCourseAction } from './delete-course-action';
import { ReviewFieldsCard } from './review-fields-card';
import { SyllabusAttachment } from './saved-resources';

export function CourseDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: course, updatedAt } = useLiveQuery(courseQuery(id), [id]);
	const [menuOpen, setMenuOpen] = useState(false);
	function back() {
		router.dismissTo('/courses');
	}
	return (
		<Screen>
			<View className="gap-4">
				<View className="flex-row items-center justify-between">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Back to courses"
						onPress={back}
						hitSlop={10}
						className="min-h-6 flex-row items-center gap-2"
					>
						<AppIcon name="arrow-left" size={17} />
						<AppText variant="eyebrow" className="text-sylla-blue">
							COURSES{course ? ` / ${course.code}` : ''}
						</AppText>
					</Pressable>
					{course && (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Course options"
							onPress={() => setMenuOpen(true)}
							hitSlop={10}
							className="h-6 w-6 items-center justify-center"
						>
							<AppIcon name="ellipsis" size={21} />
						</Pressable>
					)}
				</View>
				{course && (
					<AppText variant="title" accessibilityRole="header">
						{course.title}
					</AppText>
				)}
			</View>
			{updatedAt === undefined ? null : !course ? (
				<AppCard>
					<AppText variant="heading">Course not found</AppText>
					<AppText>This course could not be found.</AppText>
				</AppCard>
			) : (
				<>
					<CourseInformation course={course} />
					<ReviewFieldsCard courseId={course.id} hasSyllabus={!!course.syllabusPath} />
					<CourseTools courseId={course.id} />
					{course.syllabusName && (
						<SyllabusAttachment
							name={course.syllabusName}
							courseId={course.id}
							uploadedAt={course.syllabusUploadedAt}
						/>
					)}
					{course.isSample && (
						<AppText variant="caption" className="text-sylla-brown">
							Demo course · Created from sample extraction data.
						</AppText>
					)}
					<DeleteCourseAction
						id={course.id}
						code={course.code}
						onDeleted={() => router.replace('/courses')}
					/>
					<Modal
						visible={menuOpen}
						transparent
						animationType="fade"
						onRequestClose={() => setMenuOpen(false)}
					>
						<View className="flex-1 items-center justify-center bg-black/50 p-6">
							<View
								accessibilityViewIsModal
								className="w-full max-w-xl gap-2 rounded-2xl bg-sylla-surface p-4"
							>
								<AppText variant="section">Course options</AppText>
								{course.syllabusName && (
									<Pressable
										accessibilityRole="button"
										className="min-h-12 justify-center"
										onPress={() => {
											setMenuOpen(false);
											router.push({
												pathname: '/courses/[id]/syllabus',
												params: { id },
											});
										}}
									>
										<AppText>View original syllabus</AppText>
									</Pressable>
								)}
								<Pressable
									accessibilityRole="button"
									className="min-h-12 justify-center"
									onPress={() => {
										setMenuOpen(false);
										router.push({
											pathname: '/courses/[id]/materials',
											params: { id },
										});
									}}
								>
									<AppText>Course materials</AppText>
								</Pressable>
								<Pressable
									accessibilityRole="button"
									className="min-h-12 justify-center"
									onPress={() => {
										setMenuOpen(false);
										router.push({
											pathname: '/courses/[id]/dates',
											params: { id },
										});
									}}
								>
									<AppText>Important dates</AppText>
								</Pressable>
								<Pressable
									accessibilityRole="button"
									className="min-h-12 items-center justify-center"
									onPress={() => setMenuOpen(false)}
								>
									<AppText variant="action" className="text-sylla-blue">
										Close
									</AppText>
								</Pressable>
							</View>
						</View>
					</Modal>
				</>
			)}
		</Screen>
	);
}
