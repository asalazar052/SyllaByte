import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { savedDatesQuery, savedMaterialsQuery } from '@/db/queries';
import { openSyllabus } from '@/features/upload/syllabus-storage';

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

export function SyllabusAttachment({ name, path }: { name: string; path: string | null }) {
	const [error, setError] = useState<string | null>(null);
	return (
		<AppCard>
			<AppText variant="heading">Original syllabus</AppText>
			<AppText>{name}</AppText>
			{path ? (
				<Pressable
					accessibilityRole="button"
					onPress={async () => {
						setError(null);
						try {
							await openSyllabus(path);
						} catch (cause) {
							setError(
								cause instanceof Error
									? cause.message
									: 'Unable to open the syllabus.',
							);
						}
					}}
					className="min-h-11 justify-center"
				>
					<AppText variant="action" className="text-sylla-blue">
						Open or share PDF
					</AppText>
				</Pressable>
			) : (
				<AppText variant="caption" className="text-sylla-muted">
					The original PDF is retained when you add a course in the mobile app.
				</AppText>
			)}
			{error && (
				<AppText accessibilityRole="alert" className="text-sylla-brown">
					{error}
				</AppText>
			)}
		</AppCard>
	);
}
