import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

type AppCardProps = ViewProps & {
	rightCornerIcon?: ReactNode;
};

export const cardClassName = 'rounded-2xl border border-sylla-border bg-sylla-surface';

export function AppCard({ className, rightCornerIcon, children, ...props }: AppCardProps) {
	return (
		<View {...props} className={twMerge(cardClassName, 'gap-3 p-4', className)}>
			{children}
			{rightCornerIcon ? (
				<View className="absolute right-4 top-4">{rightCornerIcon}</View>
			) : null}
		</View>
	);
}
