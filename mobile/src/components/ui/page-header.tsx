import { type Href, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { SyllaColors } from '@/constants/theme';

import { AppIcon } from './app-icon';
import { AppText } from './app-text';

// Goes back one screen. When the screen was opened directly, with nothing behind it, goes to `fallback`.
export function goBackOr(fallback: Href) {
	if (router.canGoBack()) router.back();
	else router.replace(fallback);
}

// The back link, title and description at the top of a screen opened from another one.
export function PageHeader({
	parent,
	backLabel,
	onBack,
	title,
	description,
	accessory,
}: {
	// The breadcrumb beside the chevron, which is also the back link, such as 'CALENDAR' or 'COURSES / CS 101'.
	parent: string;
	// What a screen reader announces for the back link.
	backLabel: string;
	onBack: () => void;
	// Left out while the screen is still loading what it would be titled with.
	title?: string;
	description?: string;
	// Shown beside the title, such as a course's icon.
	accessory?: ReactNode;
}) {
	return (
		<View className="gap-4">
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={backLabel}
				onPress={onBack}
				hitSlop={12}
				className="min-h-5 flex-row items-center gap-1.5 self-start active:opacity-70"
			>
				<AppIcon name="chevronLeft" size={17} tintColor={SyllaColors.blue} />
				<AppText variant="eyebrow" className="text-sylla-blue">
					{parent}
				</AppText>
			</Pressable>
			{(title || accessory) && (
				<View className="flex-row items-center justify-between gap-4">
					<AppText variant="title" accessibilityRole="header" className="min-w-0 flex-1">
						{title}
					</AppText>
					{accessory}
				</View>
			)}
			{description && (
				<AppText variant="caption" className="text-sylla-muted">
					{description}
				</AppText>
			)}
		</View>
	);
}
