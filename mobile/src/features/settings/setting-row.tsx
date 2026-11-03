import { Children, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cardClassName } from '@/components/ui/app-card';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppSwitch } from '@/components/ui/app-switch';
import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
	return (
		<View className="gap-2.5">
			<AppText variant="eyebrow" className="text-sylla-blue">
				{title}
			</AppText>
			<View className={`${cardClassName} overflow-hidden`}>
				{Children.toArray(children).map((row, index) => (
					<View key={index}>
						{index > 0 && <View className="h-px bg-sylla-border" />}
						{row}
					</View>
				))}
			</View>
		</View>
	);
}

type SettingRowProps = {
	icon: AppIconName;
	title: string;
	description: string;
	// Text shown before the chevron, such as "On".
	value?: string;
	toggle?: { value: boolean; onValueChange: (value: boolean) => void };
	// A chevron marks a row that opens its own screen, so it is the only kind that is pressable.
	chevron?: boolean;
	onPress?: () => void;
};

export function SettingRow({
	icon,
	title,
	description,
	value,
	toggle,
	chevron,
	onPress,
}: SettingRowProps) {
	const content = (
		<>
			<AppIcon name={icon} size={18} tintColor={SyllaColors.blue} />
			<View className="min-w-0 flex-1 gap-1">
				<AppText className="font-inter-medium">{title}</AppText>
				<AppText variant="caption" className="text-sylla-muted">
					{description}
				</AppText>
			</View>
			{toggle && <AppSwitch label={title} {...toggle} />}
			{value ? (
				<AppText variant="caption" className="text-sylla-blue">
					{value}
				</AppText>
			) : null}
			{chevron && <AppIcon name="chevronRight" size={14} tintColor={SyllaColors.muted} />}
		</>
	);
	const className = 'min-h-14 flex-row items-center gap-3 px-3.5 py-3';

	return chevron ? (
		<Pressable
			accessibilityRole="button"
			// An accessible row groups its children, which would hide a switch inside it from screen readers.
			accessible={!toggle}
			onPress={onPress}
			className={`${className} active:opacity-70`}
		>
			{content}
		</Pressable>
	) : (
		<View className={className}>{content}</View>
	);
}
