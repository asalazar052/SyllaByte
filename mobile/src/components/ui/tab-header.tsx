import { Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from './app-icon';
import { AppText } from './app-text';

type HeaderAction = {
	icon: AppIconName;
	label: string;
	onPress?: () => void;
	// For a button that opens something, such as search, whether it is open.
	expanded?: boolean;
};

// The top of a tab's screen: a small label with one icon button at its right, and usually a large title under it.
export function TabHeader({
	eyebrow,
	title,
	action,
}: {
	eyebrow: string;
	title?: string;
	action?: HeaderAction;
}) {
	const row = (
		<View className="min-h-5 flex-row items-center justify-between">
			<AppText
				variant="eyebrow"
				accessibilityRole={title ? undefined : 'header'}
				className="text-sylla-blue"
			>
				{eyebrow}
			</AppText>
			{action && (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={action.label}
					aria-expanded={action.expanded}
					onPress={action.onPress}
					hitSlop={12}
					className="h-5 w-6 items-center justify-center active:opacity-70"
				>
					<AppIcon name={action.icon} size={21} />
				</Pressable>
			)}
		</View>
	);
	if (!title) return row;
	return (
		<View className="gap-4">
			{row}
			<AppText variant="title" accessibilityRole="header">
				{title}
			</AppText>
		</View>
	);
}
