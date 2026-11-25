import { Modal, Pressable, View } from 'react-native';

import { AppText } from './app-text';

// The question that comes before something that can't be undone: a title, what will happen, and a choice to
// cancel or go ahead. While `busy` the choice is locked, and `error` shows what went wrong if it failed.
export function ConfirmDialog({
	visible,
	title,
	message,
	confirmLabel,
	busy = false,
	error,
	onCancel,
	onConfirm,
}: {
	visible: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	busy?: boolean;
	error?: string | null;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<View className="flex-1 items-center justify-center bg-black/50 p-6">
				<View
					accessibilityViewIsModal
					className="w-full max-w-xl gap-4 rounded-2xl bg-sylla-surface p-6"
				>
					<AppText variant="section" accessibilityRole="header">
						{title}
					</AppText>
					<AppText>{message}</AppText>
					{error && (
						<AppText accessibilityRole="alert" className="text-red-700">
							{error}
						</AppText>
					)}
					<View className="flex-row flex-wrap justify-end gap-3">
						<Pressable
							accessibilityRole="button"
							disabled={busy}
							onPress={onCancel}
							className="min-h-12 items-center justify-center rounded-small border border-sylla-border px-4"
						>
							<AppText variant="label">Cancel</AppText>
						</Pressable>
						<Pressable
							accessibilityRole="button"
							accessibilityState={{ disabled: busy, busy }}
							disabled={busy}
							onPress={onConfirm}
							className="min-h-12 items-center justify-center rounded-small bg-red-700 px-4"
						>
							<AppText variant="label" className="text-white">
								{busy ? 'Deleting…' : confirmLabel}
							</AppText>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
