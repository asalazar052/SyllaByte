import { Pressable, StyleSheet, View } from 'react-native';
import { Radii, SyllaColors } from '@/constants/theme';
import { DAYS, formatDays, parseDays, type DayCode } from '@/lib/format';
import { AppText } from './app-text';

// Toggle chips for all seven days; value is the stored code string, e.g. 'MWF'.
export function DaysField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = new Set(parseDays(value));
  function toggle(code: DayCode) {
    if (selected.has(code)) selected.delete(code);
    else selected.add(code);
    onChange(formatDays(selected));
  }
  return (
    <View style={styles.field}>
      <AppText variant="caption" color={SyllaColors.muted}>
        {label}
      </AppText>
      <View style={styles.row}>
        {DAYS.map(({ code, name }) => {
          const on = selected.has(code);
          return (
            <Pressable
              key={code}
              accessibilityRole="checkbox"
              accessibilityLabel={name}
              accessibilityState={{ checked: on }}
              onPress={() => toggle(code)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <AppText variant="action" color={on ? SyllaColors.white : SyllaColors.navy}>
                {code}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  field: { gap: 4 },
  row: { flexDirection: 'row', gap: 6 },
  chip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SyllaColors.border,
    borderRadius: Radii.small,
    backgroundColor: SyllaColors.background,
  },
  chipOn: { backgroundColor: SyllaColors.navy, borderColor: SyllaColors.navy },
});
