import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';

export function SyllabusAttachment({
	name,
	courseId,
	uploadedAt,
}: {
	name: string;
	courseId: number;
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
