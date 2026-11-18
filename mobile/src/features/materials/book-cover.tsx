import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

// The most letters that fit on a line of the cover at its type size.
const LINE_LENGTH = 6;

// Splits a course name into the two lines printed on a book cover. A one-word
// name is cut in half ('CALCULUS' is 'CALC' over 'ULUS'), a longer one breaks after its first word ('WORLD
// LIT.' is 'WORLD' over 'LIT.'), and a first word too long for a line is cut in half like a one-word name.
// A line that is still too wide for the cover is shortened with an ellipsis where it is drawn.
export function coverLines(title: string): [string, string] {
	const [first = '', ...rest] = title.trim().toUpperCase().split(/\s+/);
	const remainder = rest.join(' ');
	if (first.length <= LINE_LENGTH && remainder) return [first, remainder];
	const cut = Math.floor(first.length / 2);
	return [first.slice(0, cut), [first.slice(cut), remainder].filter(Boolean).join(' ')];
}

// A textbook's cover, in the color of the course it is for.
export function BookCover({ title, color }: { title: string; color: string }) {
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			className="h-[68px] w-[47px] justify-between rounded-[3px] pb-[7px] pl-[7px] pr-[5px] pt-[9px]"
			style={{ backgroundColor: color }}
		>
			<View>
				{coverLines(title).map((line, index) => (
					<AppText
						key={index}
						numberOfLines={1}
						className="font-inter-semibold text-[9px] text-sylla-white"
						style={{ lineHeight: 10 }}
					>
						{line}
					</AppText>
				))}
			</View>
			<View className="h-[2px] w-[21px] bg-white" />
		</View>
	);
}
