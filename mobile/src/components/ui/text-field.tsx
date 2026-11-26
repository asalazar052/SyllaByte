import type { ReactNode } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { SyllaColors } from '@/constants/theme';

import { AppText } from './app-text';

// A small blue label above whatever control it names: a text box, a picker or a selector.
export function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<View className="min-w-0 flex-1 gap-2">
			<AppText variant="micro" className="font-inter-medium text-sylla-blue">
				{label}
			</AppText>
			{children}
		</View>
	);
}

// A text box with its label. Anything passed in is handed to the input, so a field can change its keyboard, make
// itself taller with `className`, and so on. Autocorrect is off unless a field asks for it.
export function TextField({ label, className, ...props }: TextInputProps & { label: string }) {
	return (
		<Field label={label}>
			<TextInput
				accessibilityLabel={label}
				autoCorrect={false}
				placeholderTextColor={SyllaColors.muted}
				{...props}
				className={twMerge(
					'min-h-12 rounded-small border border-sylla-border bg-sylla-surface p-3.5 font-inter text-[13px] text-sylla-navy',
					className,
				)}
			/>
		</Field>
	);
}
