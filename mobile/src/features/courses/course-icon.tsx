import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { type Course } from '@/db/queries';

// `width` and `height` are set as styles rather than as `w-${width}` classes. A class is only generated
// when its full name is written somewhere in the source, so a size built from a number works only for
// the sizes that happen to appear elsewhere (`w-12` does, in the tab bar), and 13 isn't in the scale at all.
export function CourseIcon({
	icon,
	background,
	width = 48,
	height = 48,
}: {
	icon: Course['icon'];
	background: Course['iconBackground'];
	width?: number;
	height?: number;
}) {
	return (
		<View
			className="items-center justify-center rounded-small"
			style={{ width: width, height: height, backgroundColor: background }}
		>
			<AppIcon name={icon} size={Math.min(width, height) / 2} />
		</View>
	);
}
