import '@/global.css';

import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SyllaColors } from '@/constants/theme';
import { useDatabase } from '@/db/use-database';
import { configurePorts } from '@/domain/ports';
import { ReminderSync } from '@/features/reminders/reminder-sync';
import { requestReminderPermission } from '@/features/reminders/reminders';
import { SyllabusPickerProvider } from '@/features/upload/syllabus-picker';
import { showEventOnCalendar } from '@/lib/show-event';

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { anchor: '(tabs)' };
void SplashScreen.preventAutoHideAsync();
// The domain asks for notification permission by name; this is how the phone does it.
configurePorts({ requestNotificationPermission: requestReminderPermission });
const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: SyllaColors.background,
		card: SyllaColors.surface,
		text: SyllaColors.navy,
		primary: SyllaColors.blue,
		border: SyllaColors.border,
	},
};

export default function RootLayout() {
	const [loaded, error] = useFonts({
		'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
		'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
		'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
	});
	const { ready: dbReady, error: dbError } = useDatabase();
	const ready = loaded && dbReady;
	useEffect(() => {
		if (ready || error || dbError) void SplashScreen.hideAsync();
	}, [ready, error, dbError]);
	if (error) throw error;
	if (dbError) throw dbError;
	if (!ready) return null;
	return (
		<ThemeProvider value={theme}>
			<SyllabusPickerProvider>
				<StatusBar style="dark" />
				<ReminderSync onOpenEvent={showEventOnCalendar} />
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { backgroundColor: SyllaColors.background },
					}}
				>
					<Stack.Screen name="(tabs)" />
					<Stack.Screen name="upload" options={{ presentation: 'modal' }} />
					<Stack.Screen name="event/[id]" options={{ presentation: 'modal' }} />
				</Stack>
			</SyllabusPickerProvider>
		</ThemeProvider>
	);
}
