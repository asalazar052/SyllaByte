import { Text, type TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

// Sizes outside Tailwind's type scale (13, 17, 11, 10, 14/21) are kept as arbitrary values to match Figma.
const variants = {
	body: 'text-sm/[21px]',
	title: 'text-3xl',
	section: 'text-[17px]/[22px]',
	heading: 'font-inter-semibold text-base/5',
	label: 'font-inter-semibold text-[13px]/4',
	action: 'font-inter-semibold text-xs',
	caption: 'text-[11px]/[14px]',
	eyebrow: 'font-inter-semibold text-[11px]/[14px]',
	code: 'font-inter-semibold text-[10px]/3',
	micro: 'text-[10px]/3',
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
