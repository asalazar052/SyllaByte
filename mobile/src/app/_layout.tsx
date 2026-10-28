import '@/global.css';

import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SyllaColors } from '@/constants/theme';
import { useDatabase } from '@/db/use-database';

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { anchor: '(tabs)' };
void SplashScreen.preventAutoHideAsync();
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
			<StatusBar style="dark" />
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: SyllaColors.background },
				}}
			>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="upload" options={{ presentation: 'modal' }} />
			</Stack>
		</ThemeProvider>
	);
}
