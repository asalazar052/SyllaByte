import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { SyllaColors } from '@/constants/theme';

const DURATION = 200;
// The knob slides the track's width (w-9) less its own width (w-4) and the track's padding (p-1 on each side).
const KNOB_TRAVEL = 12;

export function AppSwitch({
	value,
	onValueChange,
	label,
}: {
	value: boolean;
	onValueChange: (value: boolean) => void;
	label: string;
}) {
	const progress = useSharedValue(value ? 1 : 0);
	useEffect(() => {
		progress.set(withTiming(value ? 1 : 0, { duration: DURATION }));
	}, [value, progress]);

	const trackStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			progress.get(),
			[0, 1],
			[SyllaColors.muted, SyllaColors.blue],
		),
	}));
	const knobStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: progress.get() * KNOB_TRAVEL }],
	}));

	return (
		<Pressable
			accessibilityRole="switch"
			accessibilityLabel={label}
			aria-checked={value}
			onPress={() => onValueChange(!value)}
			hitSlop={8}
		>
			<View className="h-6 w-9 overflow-hidden rounded-full p-1">
				<Animated.View style={[StyleSheet.absoluteFill, trackStyle]} />
				<Animated.View style={knobStyle}>
					<View className="h-4 w-4 rounded-full bg-sylla-white" />
				</Animated.View>
			</View>
		</Pressable>
	);
}
