import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';

type Props<T> = {
  icon?: AppIconName;
  title?: string;
  subtitle?: string;
  // Shown in place of the title and subtitle when there is nothing to display.
  placeholder: string;
  editLabel: string;
  // Saved values, copied into a draft when editing starts.
  values: T;
  // Returns an error message to keep the editor open, or nothing once saved.
  onSave: (draft: T) => string | void;
  // Renders the editor's fields for the current draft.
  children: (draft: T, update: <K extends keyof T>(key: K, value: T[K]) => void) => ReactNode;
};

export function EditableRow<T>({
  icon,
  title,
  subtitle,
  placeholder,
  editLabel,
  values,
  onSave,
  children,
}: Props<T>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(values);
  const [error, setError] = useState<string>();

  function startEditing() {
    setDraft(values);
    setError(undefined);
    setEditing(true);
  }

  function update<K extends keyof T>(key: K, value: T[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const message = onSave(draft);
    if (message) setError(message);
    else setEditing(false);
  }

  if (!editing) {
    const [primary, secondary] = [title, subtitle].filter(Boolean);
    return (
      <View style={styles.row}>
        {icon && <AppIcon name={icon} size={19} />}
        <View style={styles.copy}>
          {primary ? (
            <AppText variant="label">{primary}</AppText>
          ) : (
            <AppText variant="label" color={SyllaColors.muted}>
              {placeholder}
            </AppText>
          )}
          {secondary ? (
            <AppText variant="caption" color={SyllaColors.muted}>
              {secondary}
            </AppText>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={startEditing}
          hitSlop={12}
          style={styles.pencil}
        >
          <AppIcon name="pencil" size={16} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.editor}>
      {children(draft, update)}
      {error ? (
        <AppText variant="caption" color={SyllaColors.brown} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => setEditing(false)} style={styles.action}>
          <AppText variant="action" color={SyllaColors.muted}>
            Cancel
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={save} style={styles.action}>
          <AppText variant="action" color={SyllaColors.blue}>
            Save
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  copy: { flex: 1, gap: 3 },
  pencil: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  editor: { gap: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  action: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
});
