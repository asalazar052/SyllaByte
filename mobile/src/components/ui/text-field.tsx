import { TextInput, type TextInputProps, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { AppText } from './app-text';

export function TextField({
	label,
	labelClassName,
	className,
	...props
}: TextInputProps & { label: string; labelClassName?: string }) {
	return (
		<View className="gap-1">
			<AppText variant="caption" className={twMerge('text-sylla-muted', labelClassName)}>
				{label}
			</AppText>
			<TextInput
				accessibilityLabel={label}
				autoCorrect={false}
				{...props}
				className={twMerge(
					'min-h-11 rounded-small border border-sylla-border bg-sylla-background px-3 font-inter text-[14px] text-sylla-navy',
					className,
				)}
			/>
		</View>
	);
}
