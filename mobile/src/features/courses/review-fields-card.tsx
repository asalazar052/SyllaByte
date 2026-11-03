import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { TextField } from '@/components/ui/text-field';
import { updateReviewField } from '@/db/mutations';
import { reviewFieldsQuery } from '@/db/queries';

import { EditableRow } from './editable-row';

export function ReviewFieldsCard({
	courseId,
	hasSyllabus,
}: {
	courseId: string;
	hasSyllabus: boolean;
}) {
	const { data: fields } = useLiveQuery(reviewFieldsQuery(courseId), [courseId]);
	if (!fields.length) return null;
	return (
		<AppCard className="border-sylla-peach bg-sylla-peach">
			<View className="flex-row items-center justify-between gap-3">
				<AppText className="flex-1">
					Check {fields.length} {fields.length === 1 ? 'detail' : 'details'}
				</AppText>
				<AppIcon name="scan" size={18} />
			</View>
			<AppText variant="caption" className="text-sylla-brown">
				These sample details need review. Tap a pencil to correct them.
			</AppText>
			<View className="flex-row flex-wrap gap-2">
				{fields.map((field) => (
					<View key={field.id} className="min-w-[140px] flex-1">
						<EditableRow
							compact
							title={`${field.label} · ${field.value}`}
							placeholder={field.label}
							editLabel={`Edit ${field.label}`}
							values={{ value: field.value }}
							onSave={({ value }) => {
								if (!value.trim()) return 'Enter a value for this detail.';
								try {
									updateReviewField(field.id, value);
								} catch {
									return 'Could not save this detail. Please try again.';
								}
							}}
						>
							{(draft, update) => (
								<TextField
									label={field.label}
									value={draft.value}
									onChangeText={(value) => update('value', value)}
								/>
							)}
						</EditableRow>
					</View>
				))}
			</View>
			{hasSyllabus && (
				<Pressable
					accessibilityRole="button"
					onPress={() =>
						router.push({
							pathname: '/courses/[id]/syllabus',
							params: { id: courseId },
						})
					}
					className="min-h-11 justify-center"
				>
					<AppText variant="action" className="text-sylla-brown">
						Compare with syllabus ↗
					</AppText>
				</Pressable>
			)}
		</AppCard>
	);
}
