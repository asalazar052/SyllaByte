import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';
import { ImpactFeedbackStyle, tapHaptic } from '@/lib/haptics';

import { semesterQuip } from './quips';

// A small notebook page with a sprout on it, tilted a little.
function Emblem() {
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			className="h-[60px] w-12 gap-[7px] rounded-lg bg-sylla-green p-[9px]"
			style={{ transform: [{ rotate: '7deg' }] }}
		>
			<AppIcon name="sprout" size={26} tintColor={SyllaColors.forest} />
			<View className="h-0.5 w-7 bg-sylla-forest" />
			<View className="h-0.5 w-[19px] bg-sylla-forest" />
		</View>
	);
}

function Metric({ value, label }: { value: number; label: string }) {
	return (
		<View className="min-w-0 flex-1 gap-1">
			<AppText className="font-inter-semibold text-2xl text-white">{value}</AppText>
			<AppText className="text-xs text-sylla-softBlue" style={{ lineHeight: 16 }}>
				{label}
			</AppText>
		</View>
	);
}

// The semester at a glance. Tapping it swaps its line for the next one, with the card swelling and settling back.
export function SemesterOverview({
	name,
	summary,
	courseCount,
	dueThisWeek,
}: {
	name: string;
	// Where the semester stands, such as 'Week 4 of 16  ·  Sep 21–27'.
	summary: string;
	courseCount: number;
	dueThisWeek: number;
}) {
	const [taps, setTaps] = useState(0);
	const reduceMotion = useReducedMotion();
	const scale = useSharedValue(1);
	const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
	const headline = semesterQuip(dueThisWeek, taps);
	const courses = `${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`;

	function next() {
		setTaps((count) => count + 1);
		void tapHaptic(ImpactFeedbackStyle.Soft);
		if (reduceMotion) return;
		scale.set(
			withSequence(
				withTiming(0.97, { duration: 110 }),
				withSpring(1, { damping: 20, stiffness: 250 }),
			),
		);
	}

	return (
		<Animated.View style={animatedStyle}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`${headline}. ${name}. ${summary}. ${courses}, ${dueThisWeek} due this week`}
				accessibilityHint="Shows another line"
				onPress={next}
				className="gap-[18px] rounded-[22px] bg-sylla-navy p-5"
			>
				<View className="flex-row items-center justify-between gap-3">
					<View className="min-w-0 flex-1 gap-2">
						<AppText variant="action" className="font-inter-medium text-sylla-softBlue">
							{name.toUpperCase()}
						</AppText>
						<AppText className="font-inter-semibold text-[25px] text-white">
							{headline}
						</AppText>
						{summary !== '' && (
							<AppText className="text-xs text-sylla-softBlue">{summary}</AppText>
						)}
					</View>
					<Emblem />
				</View>
				<View className="flex-row gap-6 border-t border-white/15 pt-3.5">
					<Metric value={courseCount} label={courseCount === 1 ? 'course' : 'courses'} />
					<Metric value={dueThisWeek} label="due this week" />
				</View>
			</Pressable>
		</Animated.View>
	);
}
