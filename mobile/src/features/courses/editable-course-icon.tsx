import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { SyllaColors } from '@/constants/theme';
import { type Course } from '@/db/queries';

import { CourseIcon } from './course-icon';

const ICON_SIZE = 80;
const BADGE_SIZE = 28;

// A course's icon with a pencil in the bottom right corner. Pressing either opens the screen where the icon
// and its color are chosen. The badge sits inside the pressable's own bounds, since a touch outside a view's
// bounds doesn't reach it on Android.
export function EditableCourseIcon({
	courseId,
	icon,
	background,
}: {
	courseId: number;
	icon: Course['icon'];
	background: Course['iconBackground'];
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel="Edit course icon and color"
			onPress={() => router.push(`/courses/${courseId}/appearance`)}
			hitSlop={8}
			className="active:opacity-75"
			style={{ width: ICON_SIZE + BADGE_SIZE / 4, height: ICON_SIZE + BADGE_SIZE / 4 }}
		>
			<CourseIcon icon={icon} background={background} width={ICON_SIZE} height={ICON_SIZE} />
			<View
				className="absolute bottom-0 right-0 items-center justify-center rounded-full border border-sylla-border bg-sylla-surface"
				style={{ width: BADGE_SIZE, height: BADGE_SIZE }}
			>
				<AppIcon name="pencil" size={14} tintColor={SyllaColors.navy} />
			</View>
		</Pressable>
	);
}
