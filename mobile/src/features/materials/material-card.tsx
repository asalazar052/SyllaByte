import { Pressable, View } from 'react-native';

import { cardClassName } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { type Course } from '@/db/queries';
import { courseColor } from '@/lib/colors';

import { BookCover } from './book-cover';

// One saved material, with a cover in the color of its course. `onPress` is left out where the card is
// already on the course's own page, so there is nowhere further to go.
export function MaterialCard({
	title,
	details,
	course,
	onPress,
}: {
	title: string;
	details: string | null;
	course: Pick<Course, 'code' | 'title' | 'accentColor' | 'isSample'>;
	onPress?: () => void;
}) {
	const content = (
		<>
			<BookCover title={course.title} color={courseColor(course)} />
			<View className="min-w-0 flex-1 gap-[5px]">
				<AppText className="font-inter-semibold text-[9px] text-sylla-blue">
					{course.code}
				</AppText>
				<AppText className="font-inter-semibold text-xs" numberOfLines={2}>
					{title}
				</AppText>
				{details && (
					<AppText className="text-[10px] text-sylla-muted" numberOfLines={2}>
						{details}
					</AppText>
				)}
				{course.isSample && (
					<AppText className="text-[10px] text-sylla-brown">Sample data</AppText>
				)}
			</View>
			{onPress && <AppIcon name="chevron" size={15} />}
		</>
	);
	const className = `${cardClassName} flex-row items-center gap-[13px] p-[13px]`;
	return onPress ? (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${title}, ${course.code}`}
			onPress={onPress}
			className={`${className} active:opacity-70`}
		>
			{content}
		</Pressable>
	) : (
		<View accessible accessibilityLabel={`${title}, ${course.code}`} className={className}>
			{content}
		</View>
	);
}
