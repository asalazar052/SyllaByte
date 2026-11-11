import {
	type ComponentRef,
	type ReactNode,
	type Ref,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	type GestureResponderEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenOverlayContext } from './screen-overlay';

// How far a finger can move and still count as a tap, in points.
const TAP_SLOP = 10;

// `scrollRef` lets a screen scroll itself, for example back to the top after an action lower down.
// `grabber` adds the thin bar at the top of a screen that slides up over the others, which says it can be
// swiped away.
export function Screen({
	children,
	scrollRef,
	grabber = false,
}: {
	children: ReactNode;
	scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
	grabber?: boolean;
}) {
	const rootRef = useRef<ComponentRef<typeof View>>(null);
	const [height, setHeight] = useState(0);
	const [overlay, setOverlay] = useState<ReactNode>(null);
	const overlayOpen = useRef(false);
	const onOverlayDismiss = useRef<(() => void) | null>(null);
	// How far the page is scrolled, and how far it was when the overlay appeared. The overlay is placed
	// where its anchor was at that moment, so it moves by the difference to stay beside it.
	const scrollY = useSharedValue(0);
	const scrollYAtPresent = useSharedValue(0);
	function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
		scrollY.set(event.nativeEvent.contentOffset.y);
	}
	const overlayStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: scrollYAtPresent.get() - scrollY.get() }],
	}));
	const present = useCallback(
		(content: ReactNode, onDismiss?: () => void) => {
			overlayOpen.current = content != null;
			onOverlayDismiss.current = content != null ? (onDismiss ?? null) : null;
			scrollYAtPresent.set(scrollY.get());
			setOverlay(content);
		},
		[scrollY, scrollYAtPresent],
	);
	const overlayContext = useMemo(() => ({ rootRef, height, present }), [height, present]);

	// A tap on the page, as opposed to a swipe to scroll it, takes the overlay down. The tap carries on and
	// still presses whatever it landed on.
	const touchStart = useRef({ x: 0, y: 0, overlayWasOpen: false });
	function rememberTouch(event: GestureResponderEvent) {
		touchStart.current = {
			x: event.nativeEvent.pageX,
			y: event.nativeEvent.pageY,
			overlayWasOpen: overlayOpen.current,
		};
	}
	function dismissOnTap(event: GestureResponderEvent) {
		// An overlay that this very tap brought up must stay: a dropdown opens as the tap on its box ends, just
		// before the page sees that tap end.
		if (!overlayOpen.current || !touchStart.current.overlayWasOpen) return;
		const moved = Math.hypot(
			event.nativeEvent.pageX - touchStart.current.x,
			event.nativeEvent.pageY - touchStart.current.y,
		);
		if (moved > TAP_SLOP) return;
		const onDismiss = onOverlayDismiss.current;
		present(null);
		onDismiss?.();
	}

	return (
		<SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-sylla-background">
			<ScreenOverlayContext.Provider value={overlayContext}>
				<View
					ref={rootRef}
					collapsable={false}
					onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
					className="flex-1"
				>
					{grabber && (
						<View
							accessibilityElementsHidden
							importantForAccessibility="no-hide-descendants"
							className="items-center pt-2"
						>
							<View className="h-1 w-[64px] rounded-full bg-sylla-muted/50" />
						</View>
					)}
					<ScrollView
						ref={scrollRef}
						onScroll={onScroll}
						scrollEventThrottle={16}
						onTouchStart={rememberTouch}
						onTouchEnd={dismissOnTap}
						keyboardShouldPersistTaps="handled"
						automaticallyAdjustKeyboardInsets
						contentContainerClassName="w-full max-w-xl grow gap-6 self-center px-6 pb-8 pt-3"
					>
						{children}
					</ScrollView>
					{overlay && (
						<View
							pointerEvents="box-none"
							className="absolute inset-0 overflow-hidden"
							style={{ zIndex: 10, elevation: 10 }}
						>
							<Animated.View
								pointerEvents="box-none"
								style={[StyleSheet.absoluteFill, overlayStyle]}
							>
								{overlay}
							</Animated.View>
						</View>
					)}
				</View>
			</ScreenOverlayContext.Provider>
		</SafeAreaView>
	);
}
