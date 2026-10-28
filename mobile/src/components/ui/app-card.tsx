import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Radii, SyllaColors } from '@/constants/theme';

type AppCardProps = ViewProps & {
  rightCornerIcon?: ReactNode;
};

export function AppCard({ style, rightCornerIcon, children, ...props }: AppCardProps) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
      {rightCornerIcon ? <View style={styles.rightCornerIcon}>{rightCornerIcon}</View> : null}
    </View>
  );
}
export const cardStyle = {
  backgroundColor: SyllaColors.surface,
  borderColor: SyllaColors.border,
  borderWidth: 1,
  borderRadius: Radii.card,
};
const styles = StyleSheet.create({
  card: { ...cardStyle, padding: 16, gap: 12 },
  rightCornerIcon: { position: 'absolute', top: 16, right: 16 },
});
