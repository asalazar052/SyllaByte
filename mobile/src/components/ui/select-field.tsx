import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { SyllaColors } from '@/constants/theme';

import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { useScreenOverlay } from './screen-overlay';

// A field that shows its value with a chevron and opens a choice when pressed.
export function SelectBox({
	label,
	value,
	placeholder,
	onPress,
	expanded,
	compact = false,
}: {
	label: string;
	value: string;
	// Shown, muted, while there is no value.
	placeholder?: string;
	onPress: () => void;
	expanded: boolean;
	// Matches a TextField's size and background, for forms made of those.
	compact?: boolean;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${label}, ${value || placeholder || 'not set'}`}
			aria-expanded={expanded}
			onPress={onPress}
			className={twMerge(
				boxClassName,
				'flex-row items-center gap-2 active:opacity-75',
				compact && 'min-h-11 bg-sylla-background px-3 py-0',
			)}
		>
			<AppText
				className={twMerge(
					'min-w-0 flex-1',
					compact ? 'text-[14px]' : 'text-[13px]',
					!value && 'text-sylla-muted',
				)}
				numberOfLines={1}
			>
				{value || placeholder}
			</AppText>
			<AppIcon name="chevron-down" size={16} tintColor={SyllaColors.blue} />
		</Pressable>
	);
}

const boxClassName = 'min-h-12 rounded-small border border-sylla-border bg-sylla-surface p-3.5';
const OPTION_HEIGHT = 44;
const SCREEN_MARGIN = 16;
// The list shows this many choices, then scrolls.
const MAX_VISIBLE_OPTIONS = 4;
// The list's border, top and bottom.
const LIST_BORDER = 2;

type Anchor = { x: number; y: number; width: number; height: number };

// The choices, in a list under the box (or over it, when the box is near the bottom), with a backdrop that
// closes it. `anchor` is the box's position in a space `containerHeight` tall.
function SelectList<T extends string | number | null>({
	label,
	options,
	selected,
	onSelect,
	onClose,
	anchor,
	containerHeight,
	backdrop,
}: {
	label: string;
	options: { value: T; label: string }[];
	selected: T | undefined;
	onSelect: (value: T) => void;
	onClose: () => void;
	anchor: Anchor;
	containerHeight: number;
	// Whether to cover the screen with something that closes the list when pressed. Without it, touches
	// outside the list pass through to the page.
	backdrop: boolean;
}) {
	const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
	const below = containerHeight - (anchor.y + anchor.height) - SCREEN_MARGIN;
	// What the list needs to show its choices (up to the most it displays at once).
	const wanted = Math.min(options.length, MAX_VISIBLE_OPTIONS) * OPTION_HEIGHT + LIST_BORDER;
	// Opens upward when the box sits near the bottom of the screen and there is more room above.
	const above = below < wanted && anchor.y > below;
	const space = (above ? anchor.y - SCREEN_MARGIN : below) - 4;
	const listStyle = {
		left: anchor.x,
		width: anchor.width,
		maxHeight: Math.min(wanted, space),
		...(above
			? { bottom: containerHeight - anchor.y + 4 }
			: { top: anchor.y + anchor.height + 4 }),
	};

	const list = (
		<View
			className="absolute overflow-hidden rounded-small border border-sylla-border bg-sylla-surface"
			style={[listStyle, styles.list]}
		>
			<ScrollView
				ref={scrollRef}
				bounces={false}
				showsVerticalScrollIndicator
				// A dark scrollbar shows up against the light list (iOS only).
				indicatorStyle="black"
				persistentScrollbar
				// iOS hides its scrollbar until the list moves, so show it once to say there is more.
				onContentSizeChange={(_, height) => {
					if (height > MAX_VISIBLE_OPTIONS * OPTION_HEIGHT)
						scrollRef.current?.flashScrollIndicators();
				}}
			>
				{options.map((option) => {
					const isSelected = option.value === selected;
					return (
						<Pressable
							key={option.value ?? 'none'}
							accessibilityRole="button"
							accessibilityState={{ selected: isSelected }}
							onPress={() => {
								onSelect(option.value);
								onClose();
							}}
							className={twMerge(
								'justify-center px-3.5 py-2.5 active:opacity-75',
								isSelected && 'bg-sylla-paleBlue',
							)}
							style={{ minHeight: OPTION_HEIGHT }}
						>
							<AppText
								className={twMerge(
									'text-[13px]',
									isSelected && 'font-inter-semibold',
								)}
							>
								{option.label}
							</AppText>
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
	return backdrop ? (
		<Pressable
			accessibilityLabel={`Close ${label.toLowerCase()} choices`}
			onPress={onClose}
			className="flex-1"
		>
			{list}
		</Pressable>
	) : (
		list
	);
}

// A SelectBox that opens its choices in a list over the screen. Tapping outside the list, or choosing
// something, closes it. `null` is a valid choice.
export function SelectField<T extends string | number | null>({
	label,
	options,
	selected,
	onSelect,
	onOpen,
	placeholder,
	compact,
}: {
	label: string;
	options: { value: T; label: string }[];
	// The chosen value, or undefined while nothing is chosen.
	selected: T | undefined;
	onSelect: (value: T) => void;
	onOpen?: () => void;
	placeholder?: string;
	compact?: boolean;
}) {
	const boxRef = useRef<ComponentRef<typeof View>>(null);
	const overlay = useScreenOverlay();
	// Used when the field isn't inside a Screen, so there is nothing to show the list over.
	const [modalAnchor, setModalAnchor] = useState<Anchor | null>(null);
	const [visible, setVisible] = useState(false);
	const { height: windowHeight } = useWindowDimensions();
	const present = overlay?.present;
	const shown = useRef(false);

	// A list left open when the field goes away would have nothing to close it.
	useEffect(
		() => () => {
			if (shown.current) present?.(null);
		},
		[present],
	);

	function close() {
		setVisible(false);
		setModalAnchor(null);
		if (shown.current) {
			shown.current = false;
			present?.(null);
		}
	}

	function openInModal() {
		boxRef.current?.measureInWindow((x, y, width, height) => {
			setModalAnchor({ x, y, width, height });
			setVisible(true);
		});
	}

	function open() {
		onOpen?.();
		const root = overlay?.rootRef.current;
		if (!overlay || !root || !boxRef.current) {
			openInModal();
			return;
		}
		root.measureInWindow((rootX, rootY) => {
			boxRef.current?.measureInWindow((x, y, width, height) => {
				shown.current = true;
				setVisible(true);
				overlay.present(
					<SelectList
						label={label}
						options={options}
						selected={selected}
						onSelect={onSelect}
						onClose={close}
						anchor={{ x: x - rootX, y: y - rootY, width, height }}
						containerHeight={overlay.height}
						backdrop={false}
					/>,
					// The screen takes the list down when the page is touched.
					() => {
						shown.current = false;
						setVisible(false);
					},
				);
			});
		});
	}

	const current = options.find((option) => option.value === selected);

	return (
		<>
			<View ref={boxRef} collapsable={false}>
				<SelectBox
					label={label}
					value={current?.label ?? ''}
					placeholder={placeholder}
					compact={compact}
					expanded={visible}
					onPress={open}
				/>
			</View>
			<Modal
				visible={modalAnchor !== null}
				transparent
				animationType="fade"
				statusBarTranslucent
				onRequestClose={close}
			>
				{modalAnchor && (
					<SelectList
						label={label}
						options={options}
						selected={selected}
						onSelect={onSelect}
						onClose={close}
						anchor={modalAnchor}
						containerHeight={windowHeight}
						backdrop
					/>
				)}
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	list: {
		shadowColor: SyllaColors.navy,
		shadowOpacity: 0.12,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 6,
	},
});
