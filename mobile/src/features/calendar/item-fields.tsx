import type { ReactNode } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';

const boxClassName = 'min-h-12 rounded-small border border-sylla-border bg-sylla-surface p-3.5';

// A label above whatever field it names.
export function ItemField({ label, children }: { label: string; children: ReactNode }) {
	return (
		<View className="min-w-0 flex-1 gap-2">
			<AppText variant="micro" className="font-inter-medium text-sylla-blue">
				{label}
			</AppText>
			{children}
		</View>
	);
}

export function ItemInput({ className, ...props }: TextInputProps) {
	return (
		<TextInput
			placeholderTextColor={SyllaColors.muted}
			{...props}
			className={twMerge(boxClassName, 'font-inter text-[13px] text-sylla-navy', className)}
		/>
	);
}
