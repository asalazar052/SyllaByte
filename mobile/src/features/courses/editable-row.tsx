import { type ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';

type Props<T> = {
	icon?: AppIconName;
	compact?: boolean;
	title?: string;
	subtitle?: string;
	// Overrides the subtitle's text style, such as its color.
	subtitleClassName?: string;
	// Shown in place of the title and subtitle when there is nothing to display.
	placeholder: string;
	editLabel: string;
	// Shown beside the edit button while the row isn't being edited, such as a button to undo a change.
	accessory?: ReactNode;
	// Saved values, copied into a draft when editing starts.
	values: T;
	// Returns an error message to keep the editor open, or nothing once saved.
	onSave: (draft: T) => string | void;
	// Renders the editor's fields for the current draft.
	children: (draft: T, update: <K extends keyof T>(key: K, value: T[K]) => void) => ReactNode;
};

export function EditableRow<T>({
	icon,
	compact = false,
	title,
	subtitle,
	subtitleClassName,
	placeholder,
	editLabel,
	accessory,
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
			<View
				className={
					compact
						? 'min-h-11 flex-row items-center gap-2 rounded-small bg-sylla-surface px-2'
						: 'min-h-9 flex-row items-center gap-3'
				}
			>
				{icon && <AppIcon name={icon} size={19} />}
				<View className="flex-1 gap-1">
					{primary ? (
						<AppText
							variant={compact ? 'caption' : 'label'}
							className={compact ? undefined : 'leading-4'}
						>
							{primary}
						</AppText>
					) : (
						<AppText variant="label" className="text-sylla-muted">
							{placeholder}
						</AppText>
					)}
					{secondary ? (
						<AppText
							variant="caption"
							className={twMerge(
								'leading-[14px] text-sylla-muted',
								subtitleClassName,
							)}
						>
							{secondary}
						</AppText>
					) : null}
				</View>
				{accessory}
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={editLabel}
					onPress={startEditing}
					hitSlop={12}
					className="h-7 w-7 items-center justify-center"
				>
					<AppIcon name="pencil" size={16} />
				</Pressable>
			</View>
		);
	}

	return (
		<View className="gap-2.5">
			{children(draft, update)}
			{error ? (
				<AppText
					variant="caption"
					className="text-sylla-brown"
					accessibilityLiveRegion="polite"
				>
					{error}
				</AppText>
			) : null}
			<View className="flex-row justify-end gap-2">
				<Pressable
					accessibilityRole="button"
					onPress={() => setEditing(false)}
					className="min-h-11 justify-center px-2"
				>
					<AppText variant="action" className="text-sylla-muted">
						Cancel
					</AppText>
				</Pressable>
				<Pressable
					accessibilityRole="button"
					onPress={save}
					className="min-h-11 justify-center px-2"
				>
					<AppText variant="action" className="text-sylla-blue">
						Save
					</AppText>
				</Pressable>
			</View>
		</View>
	);
}
