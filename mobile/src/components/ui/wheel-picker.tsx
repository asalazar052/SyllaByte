import { type ComponentRef, type ReactNode, useRef, useState } from 'react';
import {
	type AccessibilityActionEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	ScrollView,
	View,
} from 'react-native';

import { AppText } from './app-text';

const ROW_HEIGHT = 42;
// A looping wheel repeats its items so it can scroll past either end, then jumps back to the middle
// copy once it stops or the next touch starts. The copies on each side need to outlast a hard fling.
const LOOP_COPIES = 11;
const MIDDLE_COPY = Math.floor(LOOP_COPIES / 2);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const nearestRow = (offset: number) => Math.round(offset / ROW_HEIGHT);

// Wheels side by side, with a band across the row they all stop on.
export function WheelPickerGroup({ rows, children }: { rows: 3 | 5; children: ReactNode }) {
	return (
		<View className="flex-row gap-2.5 px-[18px]" style={{ height: rows * ROW_HEIGHT }}>
			<View
				pointerEvents="none"
				className="absolute inset-x-0 rounded-small bg-sylla-paleBlue"
				style={{ top: Math.floor(rows / 2) * ROW_HEIGHT, height: ROW_HEIGHT }}
			/>
			{children}
		</View>
	);
}

type WheelPickerProps = {
	label: string;
	items: string[];
	// Where the wheel starts. Later changes come from the wheel itself, so a different list or
	// starting item needs a new `key`.
	initialIndex: number;
	onChange: (index: number) => void;
	// Matches the group's rows: the selected item sits in the middle row.
	rows: 3 | 5;
	// Wraps from the last item back to the first, like hours.
	loop?: boolean;
	// The selected item's text size.
	selectedClassName?: string;
};

export function WheelPicker({
	label,
	items,
	initialIndex,
	onChange,
	rows,
	loop = false,
	selectedClassName = 'text-[25px]',
}: WheelPickerProps) {
	const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
	const positioned = useRef(false);
	const committed = useRef(initialIndex);
	const start = (loop ? MIDDLE_COPY * items.length : 0) + initialIndex;
	// Positions count rows from the top of the repeated list, so one item has a position in each copy.
	const [active, setActive] = useState(start);
	const rowItems = loop ? Array.from({ length: LOOP_COPIES }, () => items).flat() : items;
	const selectedIndex = active % items.length;
	// Blank space above and below lets the first and last items reach the middle row.
	const padding = Math.floor(rows / 2) * ROW_HEIGHT;

	function commit(index: number) {
		if (index === committed.current) return;
		committed.current = index;
		onChange(index);
	}

	// Called once the wheel has stopped on `offset`.
	function settle(offset: number) {
		const position = clamp(nearestRow(offset), 0, rowItems.length - 1);
		const index = position % items.length;
		if (loop) {
			const home = MIDDLE_COPY * items.length + index;
			if (position !== home) {
				scrollRef.current?.scrollTo({ y: home * ROW_HEIGHT, animated: false });
				setActive(home);
			}
		}
		commit(index);
	}

	function step(direction: 1 | -1) {
		const index = loop
			? (selectedIndex + direction + items.length) % items.length
			: clamp(selectedIndex + direction, 0, items.length - 1);
		const position = (loop ? MIDDLE_COPY * items.length : 0) + index;
		scrollRef.current?.scrollTo({ y: position * ROW_HEIGHT, animated: true });
		setActive(position);
		commit(index);
	}

	function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
		// Overscroll past either end gives offsets outside the list.
		setActive(clamp(nearestRow(event.nativeEvent.contentOffset.y), 0, rowItems.length - 1));
	}

	// A drag that ends exactly on a row has no momentum to wait for.
	function onScrollEndDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
		const offset = event.nativeEvent.contentOffset.y;
		if (Math.abs(offset - nearestRow(offset) * ROW_HEIGHT) < 0.5) settle(offset);
	}

	function onAccessibilityAction(event: AccessibilityActionEvent) {
		if (event.nativeEvent.actionName === 'increment') step(1);
		if (event.nativeEvent.actionName === 'decrement') step(-1);
	}

	return (
		<View
			accessible
			accessibilityRole="adjustable"
			accessibilityLabel={label}
			accessibilityValue={{ text: items[selectedIndex] }}
			accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
			onAccessibilityAction={onAccessibilityAction}
			className="min-w-0 flex-1"
		>
			<ScrollView
				ref={scrollRef}
				nestedScrollEnabled
				showsVerticalScrollIndicator={false}
				snapToInterval={ROW_HEIGHT}
				decelerationRate="fast"
				scrollEventThrottle={16}
				// iOS starts at this offset; Android has no such prop, so it scrolls there once its content has a size.
				contentOffset={{ x: 0, y: start * ROW_HEIGHT }}
				onContentSizeChange={() => {
					if (positioned.current) return;
					positioned.current = true;
					scrollRef.current?.scrollTo({ y: start * ROW_HEIGHT, animated: false });
				}}
				onScroll={onScroll}
				onScrollEndDrag={onScrollEndDrag}
				onMomentumScrollEnd={(event) => settle(event.nativeEvent.contentOffset.y)}
				contentContainerStyle={{ paddingVertical: padding }}
				style={{ height: rows * ROW_HEIGHT }}
			>
				{rowItems.map((item, position) => {
					const distance = Math.abs(position - active);
					return (
						<View
							key={position}
							className="items-center justify-center"
							style={{ height: ROW_HEIGHT }}
						>
							<AppText
								className={
									distance === 0
										? `font-inter-semibold ${selectedClassName}`
										: distance === 1
											? 'text-[20px] text-sylla-muted'
											: 'text-[20px] text-sylla-softBlue'
								}
							>
								{item}
							</AppText>
						</View>
					);
				})}
			</ScrollView>
		</View>
	);
}
