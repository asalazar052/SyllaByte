import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
import { plural } from '@/lib/plural';

import { semesterQuip } from './quips';
import { SlotNumber } from './slot-number';
import { useTypewriter } from './use-typewriter';

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

// The card plays an intro once, which lasts until the app is closed. It first shows without its line, which is
// typed out a moment later. When that is done the numbers roll in, to show that they spin. After that the numbers
// only spin when tapped (or when they change).
const INTRO_DELAY_MS = 500;
// The beat between the line finishing and the numbers rolling.
const INTRO_SPIN_DELAY_MS = 250;
let introPlayed = false;

function Metric({
	value,
	label,
	spins,
	order,
	hold,
}: {
	value: number;
	label: string;
	spins: number;
	order: number;
	hold: boolean;
}) {
	return (
		<View className="min-w-0 flex-1 gap-1">
			<SlotNumber value={value} spins={spins} order={order} hold={hold} />
			<AppText className="text-xs text-sylla-softBlue" style={{ lineHeight: 16 }}>
				{label}
			</AppText>
		</View>
	);
}

// The semester at a glance, in two parts that each do something different when tapped. The top (name, line and
// emblem) deletes the old line and types the next one out, and is ignored until it has finished. The stats spin
// their numbers like slot machine reels. Either one dips the card and gives a tap.
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
	// How many times each part has been tapped.
	const [lineTaps, setLineTaps] = useState(0);
	const [statTaps, setStatTaps] = useState(0);
	const reduceMotion = useReducedMotion();
	const scale = useSharedValue(1);
	const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
	// Whether this card plays the intro, and whether it is still waiting to. Decided when it first appears.
	const [intro] = useState(() => !introPlayed && !reduceMotion);
	const [introWaiting, setIntroWaiting] = useState(intro);
	// Whether the numbers have had their intro spin. Without an intro there is none to wait for.
	const [introSpun, setIntroSpun] = useState(!intro);
	const headline = semesterQuip(dueThisWeek, lineTaps);
	// The intro and a tap on the top type the line out. When the data loads or the week turns over, it swaps at once.
	const typed = useTypewriter(headline, !reduceMotion && (intro || lineTaps > 0), {
		startBlank: intro,
		paused: introWaiting,
	});
	const courses = plural(courseCount, 'course');

	// After a beat, the intro starts and the line types out.
	useEffect(() => {
		if (!intro) {
			introPlayed = true;
			return;
		}
		const timer = setTimeout(() => {
			introPlayed = true;
			setIntroWaiting(false);
		}, INTRO_DELAY_MS);
		return () => clearTimeout(timer);
	}, [intro]);

	// Once the line has finished typing, and after another beat, the reels spin. That counts as one tap on the stats.
	useEffect(() => {
		if (introSpun || introWaiting || typed.typing) return;
		const timer = setTimeout(() => {
			setIntroSpun(true);
			setStatTaps((count) => count + 1);
		}, INTRO_SPIN_DELAY_MS);
		return () => clearTimeout(timer);
	}, [introSpun, introWaiting, typed.typing]);

	// The card sinks a little under a finger. If the press turns into a tap, dip() takes over from there.
	function pressIn() {
		if (reduceMotion) return;
		scale.set(withTiming(0.985, { duration: 80 }));
	}

	function pressOut() {
		if (reduceMotion) return;
		scale.set(withSpring(1, { damping: 20, stiffness: 250 }));
	}

	function dip() {
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
			<View className="overflow-hidden rounded-[22px] bg-sylla-navy">
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`${headline}. ${name}. ${summary}`}
					accessibilityHint="Shows another line"
					disabled={typed.typing}
					onPressIn={pressIn}
					onPressOut={pressOut}
					onPress={() => {
						setLineTaps((count) => count + 1);
						dip();
					}}
					className="flex-row items-center justify-between gap-3 px-5 pb-[9px] pt-5 active:bg-white/5"
				>
					<View className="min-w-0 flex-1 gap-2">
						<AppText variant="action" className="font-inter-medium text-sylla-softBlue">
							{name.toUpperCase()}
						</AppText>
						<AppText className="font-inter-semibold text-[25px] text-white">
							{typed.text.slice(0, typed.visible)}
							<Text style={{ color: 'transparent' }}>
								{typed.text.slice(typed.visible)}
							</Text>
						</AppText>
						{summary !== '' && (
							<AppText className="text-xs text-sylla-softBlue">{summary}</AppText>
						)}
					</View>
					<Emblem />
				</Pressable>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`${courses}, ${dueThisWeek} due this week`}
					accessibilityHint="Spins the numbers"
					onPressIn={pressIn}
					onPressOut={pressOut}
					onPress={() => {
						setStatTaps((count) => count + 1);
						dip();
					}}
					className="px-5 pb-5 pt-[9px] active:bg-white/5"
				>
					<View className="flex-row gap-6 border-t border-white/15 pt-3.5">
						<Metric
							value={courseCount}
							label={courseCount === 1 ? 'course' : 'courses'}
							spins={statTaps}
							order={0}
							hold={!introSpun}
						/>
						<Metric
							value={dueThisWeek}
							label="due this week"
							spins={statTaps}
							order={1}
							hold={!introSpun}
						/>
					</View>
				</Pressable>
			</View>
		</Animated.View>
	);
}
