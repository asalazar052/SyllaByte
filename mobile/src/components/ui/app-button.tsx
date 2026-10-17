import { Pressable, StyleSheet } from 'react-native';
import { Radii, SyllaColors } from '@/constants/theme';
import { AppText } from './app-text';
import { AppIcon, type AppIconName } from './app-icon';

export function AppButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: AppIconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {icon && <AppIcon name={icon} size={18} />}
      <AppText variant="label" color={SyllaColors.white} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: SyllaColors.navy,
    borderRadius: Radii.small,
    minHeight: 48,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: { fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.75 },
});
