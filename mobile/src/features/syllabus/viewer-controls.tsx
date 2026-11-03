import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';

export function ViewerControls({
	page,
	pages,
	scale,
	onPage,
	onScale,
}: {
	page: number;
	pages: number;
	scale: number;
	onPage: (page: number) => void;
	onScale: (scale: number) => void;
}) {
	const [selecting, setSelecting] = useState(false);
	return (
		<>
			<View className="min-h-11 flex-row items-center rounded-small border border-sylla-border bg-sylla-surface">
				<Control
					label="Previous page"
					icon="chevron-left"
					disabled={page <= 1}
					onPress={() => onPage(page - 1)}
				/>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Page ${page} of ${pages}. Choose a page`}
					onPress={() => setSelecting(true)}
					className="min-h-11 flex-1 flex-row items-center justify-center gap-1"
				>
					<AppText variant="caption">
						Page {page} of {pages}
					</AppText>
					<AppIcon name="chevron-down" size={13} />
				</Pressable>
				<Control
					label="Next page"
					icon="chevron"
					disabled={page >= pages}
					onPress={() => onPage(page + 1)}
				/>
				<View className="h-5 border-l border-sylla-border" />
				<Control
					label="Zoom out"
					icon="minus"
					disabled={scale <= 1}
					onPress={() => onScale(Math.max(1, scale - 0.25))}
				/>
				<AppText variant="caption" accessibilityLiveRegion="polite">
					{Math.round(scale * 100)}%
				</AppText>
				<Control
					label="Zoom in"
					icon="plus"
					disabled={scale >= 3}
					onPress={() => onScale(Math.min(3, scale + 0.25))}
				/>
			</View>
			<Modal
				visible={selecting}
				transparent
				animationType="fade"
				onRequestClose={() => setSelecting(false)}
			>
				<View className="flex-1 items-center justify-center bg-black/50 p-6">
					<View
						accessibilityViewIsModal
						className="max-h-[70%] w-full max-w-xl gap-3 rounded-2xl bg-sylla-surface p-4"
					>
						<AppText variant="section" accessibilityRole="header">
							Go to page
						</AppText>
						<FlatList
							data={Array.from({ length: pages }, (_, i) => i + 1)}
							keyExtractor={(value) => String(value)}
							renderItem={({ item }) => (
								<Pressable
									accessibilityRole="button"
									accessibilityState={{ selected: page === item }}
									onPress={() => {
										onPage(item);
										setSelecting(false);
									}}
									className={`min-h-12 justify-center rounded-small px-3 ${item === page ? 'bg-sylla-paleBlue' : ''}`}
								>
									<AppText>Page {item}</AppText>
								</Pressable>
							)}
						/>
						<Pressable
							accessibilityRole="button"
							onPress={() => setSelecting(false)}
							className="min-h-11 items-center justify-center"
						>
							<AppText variant="action" className="text-sylla-blue">
								Cancel
							</AppText>
						</Pressable>
					</View>
				</View>
			</Modal>
		</>
	);
}

function Control({
	label,
	icon,
	disabled,
	onPress,
}: {
	label: string;
	icon: 'chevron-left' | 'chevron' | 'minus' | 'plus';
	disabled: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onPress}
			hitSlop={4}
			className="min-h-11 w-9 items-center justify-center"
			style={disabled ? { opacity: 0.35 } : undefined}
		>
			<AppIcon name={icon} size={17} />
		</Pressable>
	);
}
