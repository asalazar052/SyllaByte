import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from './app-text';
import { ConfirmDialog } from './confirm-dialog';

// A red button that asks before deleting something. `onDelete` does the deleting and throws if it can't;
// `onDeleted` runs once it is gone, so the screen showing it can close. `label` names the button and the
// final choice ('Delete course'), and `failureMessage` is shown if `onDelete` throws.
export function ConfirmDeleteAction({
	label,
	title,
	message,
	failureMessage,
	onDelete,
	onDeleted,
	className = '',
}: {
	label: string;
	title: string;
	message: string;
	failureMessage: string;
	onDelete: () => void;
	onDeleted: () => void;
	className?: string;
}) {
	const [confirming, setConfirming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);
	const busy = useRef(false);

	function cancel() {
		if (!busy.current) {
			setConfirming(false);
			setError(null);
		}
	}

	function confirm() {
		if (busy.current) return;
		busy.current = true;
		setDeleting(true);
		setError(null);
		try {
			onDelete();
		} catch {
			setError(failureMessage);
			busy.current = false;
			setDeleting(false);
			return;
		}
		setConfirming(false);
		onDeleted();
	}

	return (
		<View className={`${className} border-t border-sylla-border pt-4`}>
			<Pressable
				accessibilityRole="button"
				onPress={() => setConfirming(true)}
				className="min-h-12 items-center justify-center"
			>
				<AppText variant="label" className="text-red-700">
					{label}
				</AppText>
			</Pressable>
			<ConfirmDialog
				visible={confirming}
				title={title}
				message={message}
				confirmLabel={label}
				busy={deleting}
				error={error}
				onCancel={cancel}
				onConfirm={confirm}
			/>
		</View>
	);
}
