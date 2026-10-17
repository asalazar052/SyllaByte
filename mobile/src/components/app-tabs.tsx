import { usePathname } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
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
      accessibilityRole="tab"
      aria-selected={focused}
      style={({ pressed }) => [styles.tab, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.indicator, focused && styles.selected]}>
        <AppIcon name={icon} size={19} tintColor={focused ? SyllaColors.blue : SyllaColors.muted} />
      </View>
      <AppText variant="micro" color={focused ? SyllaColors.navy : SyllaColors.muted}>
        {children}
      </AppText>
    </Pressable>
  );
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs style={styles.root}>
      <View style={styles.content}>
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
  content: { flex: 1, minHeight: 0, overflow: 'hidden' },
  slot: { flex: 1, minHeight: 0 },
  list: {
    flexShrink: 0,
    flexDirection: 'row',
    backgroundColor: SyllaColors.surface,
    borderTopColor: SyllaColors.border,
    borderTopWidth: 1,
    paddingTop: 9,
    gap: 3,
  },
  tab: { flex: 1, minHeight: 45, alignItems: 'center', gap: 4 },
  indicator: {
    width: 48,
    height: 29,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: SyllaColors.paleBlue },
});
