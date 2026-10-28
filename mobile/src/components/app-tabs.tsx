import { usePathname } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentRef, Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SyllaColors } from '@/constants/theme';

import { AppIcon, type AppIconName } from './ui/app-icon';
import { AppText } from './ui/app-text';

function TabButton({
	icon,
	children,
	isFocused,
	...props
}: Omit<TabTriggerSlotProps, 'ref'> & { icon: AppIconName; ref?: Ref<ComponentRef<typeof View>> }) {
	const pathname = usePathname();
	// A course detail still belongs to the Courses tab.
	const focused = pathname
		? pathname === `/${icon}` || pathname.startsWith(`/${icon}/`)
		: isFocused;
	return (
		<Pressable
			{...props}
			// TabTrigger injects a row layout as `style`, which would win over the className below.
			style={undefined}
			accessibilityRole="tab"
			aria-selected={focused}
			className="min-h-11 flex-1 items-center gap-1 active:opacity-60"
		>
			<View
				className={`h-7 w-12 items-center justify-center rounded-full ${focused ? 'bg-sylla-paleBlue' : ''}`}
			>
				<AppIcon
					name={icon}
					size={19}
					tintColor={focused ? SyllaColors.blue : SyllaColors.muted}
				/>
			</View>
			<AppText variant="micro" className={focused ? undefined : 'text-sylla-muted'}>
				{children}
			</AppText>
		</Pressable>
	);
}

export default function AppTabs() {
	const insets = useSafeAreaInsets();
	return (
		// Tabs, TabSlot and TabList keep `style` on purpose: expo-router/ui finds the tab list and triggers by
		// comparing element types, and NativeWind's className support swaps in a wrapper type, so no tabs are found.
		// Insets are runtime values, and NativeWind's safe-area utilities don't exist on web.
		<Tabs style={styles.root}>
			<View className="min-h-0 flex-1 overflow-hidden">
				<TabSlot style={styles.slot} />
			</View>
			<TabList
				style={[
					styles.list,
					{
						paddingBottom: Math.max(insets.bottom, 12),
						paddingLeft: Math.max(insets.left, 14),
						paddingRight: Math.max(insets.right, 14),
					},
				]}
			>
				<TabTrigger name="home" href="/home" asChild>
					<TabButton icon="home">Home</TabButton>
				</TabTrigger>
				<TabTrigger name="calendar" href="/calendar" asChild>
					<TabButton icon="calendar">Calendar</TabButton>
				</TabTrigger>
				<TabTrigger name="courses" href="/courses" asChild>
					<TabButton icon="courses">Courses</TabButton>
				</TabTrigger>
				<TabTrigger name="materials" href="/materials" asChild>
					<TabButton icon="materials">Materials</TabButton>
				</TabTrigger>
				<TabTrigger name="settings" href="/settings" asChild>
					<TabButton icon="settings">Settings</TabButton>
				</TabTrigger>
			</TabList>
		</Tabs>
	);
}
const styles = StyleSheet.create({
	root: { flex: 1, minHeight: 0, backgroundColor: SyllaColors.background },
	slot: { flex: 1, minHeight: 0 },
	list: {
		flexShrink: 0,
		flexDirection: 'row',
		backgroundColor: SyllaColors.surface,
		borderTopColor: SyllaColors.border,
		borderTopWidth: 1,
		paddingTop: 10,
		gap: 4,
	},
});
