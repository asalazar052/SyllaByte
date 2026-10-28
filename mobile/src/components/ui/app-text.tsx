import { Text, type TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

const variants = {
	body: 'text-sm',
	title: 'text-3xl',
	section: 'text-lg',
	heading: 'font-inter-semibold text-base leading-4',
	label: 'font-inter-semibold text-sm',
	action: 'font-inter-semibold text-xs',
	caption: 'text-xs',
	eyebrow: 'font-inter-semibold text-xs',
	code: 'font-inter-semibold text-xs',
	micro: 'text-xs',
};

type Props = TextProps & { variant?: keyof typeof variants };

// A className overrides the variant's matching utilities, e.g. className="text-sylla-blue" changes the color.
export function AppText({ variant = 'body', className, ...props }: Props) {
	return (
		<Text
			{...props}
			className={twMerge('font-inter text-sylla-navy', variants[variant], className)}
		/>
	);
}
