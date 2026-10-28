import { Pressable } from 'react-native';

import { AppIcon, type AppIconName } from './app-icon';
import { AppText } from './app-text';

export function AppButton({
	label,
	onPress,
	icon,
}: {
	label: string;
	onPress: () => void;
	icon?: AppIconName;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className="min-h-12 flex-row items-center justify-center gap-2.5 rounded-small bg-sylla-navy p-3.5 active:opacity-75"
		>
			{icon && <AppIcon name={icon} size={18} />}
			<AppText variant="label" className="text-sm text-white">
				{label}
			</AppText>
		</Pressable>
	);
}
