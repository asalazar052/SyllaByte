import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { savedDatesQuery, savedMaterialsQuery } from '@/db/queries';

export function SavedResources({
	kind,
	courseId,
}: {
	kind: 'dates' | 'materials';
	courseId?: string;
}) {
	const { data: dates } = useLiveQuery(savedDatesQuery(courseId), [courseId]);
	const { data: materials } = useLiveQuery(savedMaterialsQuery(courseId), [courseId]);
	const rows =
		kind === 'dates'
			? dates.map(({ item, course }) => ({
					...item,
					course,
					detail: `${item.date}${item.time ? ` · ${item.time}` : ' · All day'}`,
				}))
			: materials.map(({ item, course }) => ({ ...item, course, detail: item.details }));
	return (
		<View className="gap-3">
			{!rows.length && (
				<AppCard>
					<AppText className="text-sylla-muted">
						{kind === 'dates' ? 'No saved dates yet.' : 'No saved materials yet.'}{' '}
						Review and add a syllabus to see them here.
					</AppText>
				</AppCard>
			)}
			{rows.map((row) => (
				<AppCard key={row.id}>
					<AppText variant="heading">{row.title}</AppText>
					{row.detail && <AppText>{row.detail}</AppText>}
					{!courseId && (
						<Pressable
							accessibilityRole="button"
							onPress={() =>
								router.push({
									pathname: '/courses/[id]',
									params: { id: row.course.id },
								})
							}
							className="min-h-11 justify-center"
						>
							<AppText variant="action" className="text-sylla-blue">
								{row.course.code} · {row.course.title}
							</AppText>
						</Pressable>
					)}
					{row.course.isSample && (
						<AppText variant="caption" className="text-sylla-brown">
							Sample data
						</AppText>
					)}
				</AppCard>
			))}
		</View>
	);
}

export function SyllabusAttachment({
	name,
	courseId,
	uploadedAt,
}: {
	name: string;
	courseId: string;
	uploadedAt: number | null;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`View original syllabus, ${name}`}
			onPress={() =>
				router.push({ pathname: '/courses/[id]/syllabus', params: { id: courseId } })
			}
			className="min-h-11 flex-row items-center gap-3"
		>
			<AppIcon name="document" size={25} />
			<View className="min-w-0 flex-1 gap-1">
				<AppText variant="label" numberOfLines={2}>
					{name}
				</AppText>
				<AppText variant="caption" className="text-sylla-muted">
					{uploadedAt !== null
						? `Uploaded ${new Date(uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · `
						: ''}
					View original
				</AppText>
			</View>
			<AppIcon name="external-link" size={16} />
		</Pressable>
	);
}
