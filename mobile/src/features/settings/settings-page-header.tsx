import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';

export function backToSettings() {
	if (router.canGoBack()) router.back();
	else router.replace('/settings');
}

// The back link, title and description at the top of a screen opened from Settings.
export function SettingsPageHeader({ title, description }: { title: string; description: string }) {
	return (
		<View className="gap-4">
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Back to settings"
				onPress={backToSettings}
				hitSlop={12}
				className="min-h-5 flex-row items-center gap-1.5 self-start active:opacity-70"
			>
				<AppIcon name="chevronLeft" size={17} tintColor={SyllaColors.blue} />
				<AppText variant="eyebrow" className="text-sylla-blue">
					SETTINGS
				</AppText>
			</Pressable>
			<AppText variant="title" accessibilityRole="header">
				{title}
			</AppText>
			<AppText variant="caption" className="text-sylla-muted">
				{description}
			</AppText>
		</View>
	);
}
