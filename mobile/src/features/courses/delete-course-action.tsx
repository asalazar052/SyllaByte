import { useRef, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { deleteCourse } from '@/db/delete-course';

export function DeleteCourseAction({
	id,
	code,
	onDeleted,
}: {
	id: string;
	code: string;
	onDeleted: () => void;
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
			deleteCourse(id);
		} catch {
			setError('Couldn’t delete this course. Please try again.');
			busy.current = false;
			setDeleting(false);
			return;
		}
		setConfirming(false);
		onDeleted();
	}

	return (
		<View className="mt-3 border-t border-sylla-border pt-4">
			<Pressable
				accessibilityRole="button"
				onPress={() => setConfirming(true)}
				className="min-h-12 items-center justify-center"
			>
				<AppText variant="label" className="text-red-700">
					Delete course
				</AppText>
			</Pressable>
			<Modal visible={confirming} transparent animationType="fade" onRequestClose={cancel}>
				<View className="flex-1 items-center justify-center bg-black/50 p-6">
					<View
						accessibilityViewIsModal
						className="w-full max-w-xl gap-4 rounded-2xl bg-sylla-surface p-6"
					>
						<AppText variant="section" accessibilityRole="header">
							Delete {code}?
						</AppText>
						<AppText>
							This removes the course, its dates, materials, and saved syllabus from
							this device. This can’t be undone.
						</AppText>
						{error && (
							<AppText accessibilityRole="alert" className="text-red-700">
								{error}
							</AppText>
						)}
						<View className="flex-row flex-wrap justify-end gap-3">
							<Pressable
								accessibilityRole="button"
								disabled={deleting}
								onPress={cancel}
								className="min-h-12 items-center justify-center rounded-small border border-sylla-border px-4"
							>
								<AppText variant="label">Cancel</AppText>
							</Pressable>
							<Pressable
								accessibilityRole="button"
								accessibilityState={{ disabled: deleting, busy: deleting }}
								disabled={deleting}
								onPress={confirm}
								className="min-h-12 items-center justify-center rounded-small bg-red-700 px-4"
							>
								<AppText variant="label" className="text-white">
									{deleting ? 'Deleting…' : 'Delete course'}
								</AppText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
