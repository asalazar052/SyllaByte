import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SyllaColors } from '@/constants/theme';

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
  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);
  if (error) throw error;
  if (!loaded) return null;
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
