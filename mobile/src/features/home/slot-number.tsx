import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { useOnChange } from '@/hooks/use-on-change';

// Matches the line height of the text-2xl the number is set in.
const DIGIT_HEIGHT = 32;
// The strip reads 0 to 9 and then 0 again. A reel's position counts digits and never wraps, and the strip is
// shown at that position modulo 10, so when it passes a whole turn the second 0 stands in for the first.
const STRIP_DIGITS = 11;
const STRIP = Array.from({ length: STRIP_DIGITS }, (_, index) => index % 10).join('\n');
// How far a tap sends a reel, in whole turns of the reel.
const TURNS_PER_TAP = 2;
// A spin takes this long per digit passed, kept between these.
const MS_PER_DIGIT = 38;
const MIN_MS = 700;
const MAX_MS = 2800;

// `x` modulo 10, always from 0 up to 10, including for the negative positions a reel spins through.
function mod10(x: number) {
	'worklet';
	return ((x % 10) + 10) % 10;
}

// One digit on a reel: a column of digits behind a window one digit tall.
function Reel({
	digit,
	spins,
	delay,
	hold,
}: {
	digit: number;
	spins: number;
	delay: number;
	hold: boolean;
}) {
	const reduceMotion = useReducedMotion();
	const position = useSharedValue(digit);
	const target = useRef(digit);
	const spin = useCallback(() => {
		if (reduceMotion) {
			target.current = digit;
			position.set(digit);
			return;
		}
		const from = position.get();
		const resting = Math.abs(from - target.current) < 0.01;
		// Further on by whole turns, and far enough to end on this digit.
		const next = target.current - TURNS_PER_TAP * 10 - mod10(target.current - digit);
		target.current = next;
		const distance = from - next;
		const duration = Math.min(MAX_MS, Math.max(MIN_MS, distance * MS_PER_DIGIT));
		// A little overshoot, so it lands with a bounce like a reel stopping, kept small over a long spin.
		const overshoot = Math.min(0.6, (0.6 * TURNS_PER_TAP * 10) / distance);
		const animation = withTiming(next, {
			duration,
			easing: Easing.out(Easing.back(overshoot)),
		});
		// The reels set off one after another from rest. One that is already spinning is not held back.
		position.set(resting ? withDelay(delay, animation) : animation);
	}, [digit, delay, reduceMotion, position]);
	useOnChange(spins, spin);
	const follow = useCallback(() => {
		if (!hold) {
			spin();
			return;
		}
		target.current = digit;
		position.set(digit);
	}, [hold, spin, digit, position]);
	useOnChange(digit, follow);
	const stripStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: -mod10(position.get()) * DIGIT_HEIGHT }],
	}));
	return (
		<View style={{ height: DIGIT_HEIGHT, overflow: 'hidden' }}>
			<Animated.View style={[{ height: STRIP_DIGITS * DIGIT_HEIGHT }, stripStyle]}>
				<AppText
					allowFontScaling={false}
					className="font-inter-semibold text-2xl text-white"
					style={{ lineHeight: DIGIT_HEIGHT, fontVariant: ['tabular-nums'] }}
				>
					{STRIP}
				</AppText>
			</Animated.View>
		</View>
	);
}

// A number on slot machine reels. Each time `spins` goes up the reels spin and land on the number again, one
// after another, and spins that come before one has finished add up. They also spin when the number changes.
// While `hold` is set, a change in the number is shown without spinning, such as for a number that is still
// loading. `order` staggers this number's reels behind the ones before it.
export function SlotNumber({
	value,
	spins,
	order = 0,
	hold = false,
}: {
	value: number;
	spins: number;
	order?: number;
	hold?: boolean;
}) {
	const digits = String(Math.max(0, Math.trunc(value))).split('');
	return (
		// The card around it is read as one button, which says the number.
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			className="flex-row"
		>
			{digits.map((digit, index) => (
				// Keyed from the right, so the ones digit is the same reel when the number gains a digit.
				<Reel
					key={digits.length - index}
					digit={Number(digit)}
					spins={spins}
					delay={order * 120 + index * 110}
					hold={hold}
				/>
			))}
		</View>
	);
}
