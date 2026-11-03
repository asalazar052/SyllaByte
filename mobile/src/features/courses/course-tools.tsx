import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { savedDatesQuery, savedMaterialsQuery } from '@/db/queries';

export function CourseTools({ courseId }: { courseId: string }) {
	const { data: materials } = useLiveQuery(savedMaterialsQuery(courseId), [courseId]);
	const { data: dates } = useLiveQuery(savedDatesQuery(courseId), [courseId]);
	return (
		<View className="gap-3">
			<AppCard className="gap-4 border-sylla-navy bg-sylla-navy">
				<View className="flex-row items-center gap-3">
					<AppIcon name="calculator" size={21} tintColor="#FFFFFF" />
					<AppText variant="heading" className="flex-1 text-white">
						Grade calculator
					</AppText>
					<AppText variant="caption" className="text-white/70">
						Coming soon
					</AppText>
				</View>
				<View className="flex-row items-center justify-between gap-3">
					<AppText variant="title" className="text-white">
						—
					</AppText>
					<AppText variant="caption" className="text-right text-white/70">
						No grades added yet
					</AppText>
				</View>
			</AppCard>
			<Pressable
				accessibilityRole="button"
				onPress={() =>
					router.push({ pathname: '/courses/[id]/materials', params: { id: courseId } })
				}
			>
				<AppCard className="min-h-16 flex-row items-center gap-4">
					<AppIcon name="materials" size={20} />
					<View className="flex-1 gap-1">
						<AppText variant="label">Course materials</AppText>
						<AppText variant="caption" className="text-sylla-muted">
							{materials.length} saved{' '}
							{materials.length === 1 ? 'resource' : 'resources'}
						</AppText>
					</View>
					<AppIcon name="chevron" size={17} />
				</AppCard>
			</Pressable>
			{dates.length > 0 && (
				<Pressable
					accessibilityRole="button"
					onPress={() =>
						router.push({ pathname: '/courses/[id]/dates', params: { id: courseId } })
					}
				>
					<AppCard className="min-h-16 flex-row items-center gap-4">
						<AppIcon name="calendar" size={20} />
						<View className="flex-1 gap-1">
							<AppText variant="label">Important dates</AppText>
							<AppText variant="caption" className="text-sylla-muted">
								{dates.length} saved {dates.length === 1 ? 'date' : 'dates'}
							</AppText>
						</View>
						<AppIcon name="chevron" size={17} />
					</AppCard>
				</Pressable>
			)}
		</View>
	);
}
