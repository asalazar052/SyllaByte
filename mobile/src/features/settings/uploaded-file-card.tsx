import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { deleteFile } from '@/db/delete-file';
import type { UploadedFile } from '@/db/queries';
import { shareSyllabus } from '@/features/upload/syllabus-storage';
import { formatBytes, joinParts } from '@/lib/format';

type UploadedFileCardProps = {
	file: UploadedFile;
	// 0 to 1, for a file that is still being read. Omitted once it is done.
	processing?: number;
};

export function UploadedFileCard({ file, processing }: UploadedFileCardProps) {
	const [confirming, setConfirming] = useState(false);
	const [working, setWorking] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// Sample files that ship with the app, and files from the web build, have no copy on the device.
	const hasCopy = file.storagePath !== null;

	async function exportFile() {
		if (!file.storagePath || working) return;
		setWorking(true);
		setError(null);
		try {
			await shareSyllabus(file.storagePath, file.filename);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : 'Couldn’t export this file.');
		} finally {
			setWorking(false);
		}
	}

	function confirmDelete() {
		if (working) return;
		setWorking(true);
		setError(null);
		try {
			deleteFile(file.id);
			// The card goes away with its row, so there is nothing more to reset.
		} catch {
			setError('Couldn’t delete this file. Please try again.');
			setConfirming(false);
			setWorking(false);
		}
	}

	return (
		<AppCard className="gap-2 p-3">
			<View className="flex-row items-center gap-3">
				<View className="h-9 w-9 items-center justify-center rounded-small bg-sylla-paleBlue">
					<AppIcon name="fileText" size={19} />
				</View>
				<View className="min-w-0 flex-1 gap-1">
					<AppText variant="code" className="text-sylla-blue">
						{file.course?.code ?? 'NO COURSE'}
					</AppText>
					<AppText variant="label">
						{file.course?.title ?? 'Not linked to a course'}
					</AppText>
				</View>
			</View>

			<View className="flex-row items-center justify-between gap-3">
				<AppText
					variant="micro"
					numberOfLines={1}
					ellipsizeMode="middle"
					className="min-w-0 shrink text-sylla-muted"
				>
					{file.filename}
				</AppText>
				<AppText variant="micro" className="shrink-0 text-sylla-muted">
					{joinParts(
						file.pageCount !== null &&
							`${file.pageCount} ${file.pageCount === 1 ? 'page' : 'pages'}`,
						formatBytes(file.bytes),
					)}
				</AppText>
			</View>

			<View className="flex-row gap-2.5">
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Export ${file.filename}`}
					accessibilityState={{ disabled: !hasCopy || working, busy: working }}
					disabled={!hasCopy || working}
					onPress={() => void exportFile()}
					style={!hasCopy ? { opacity: 0.5 } : undefined}
					className="h-8 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-sylla-paleBlue active:opacity-70"
				>
					<AppIcon name="share" size={14} />
					<AppText variant="action" className="text-sylla-blue">
						Export
					</AppText>
				</Pressable>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Delete ${file.filename}`}
					disabled={working}
					onPress={() => setConfirming(true)}
					className="h-8 w-[100px] flex-row items-center justify-center gap-2 active:opacity-70"
				>
					<AppIcon name="trash" size={14} />
					<AppText variant="action" className="font-inter-medium text-sylla-danger">
						Delete
					</AppText>
				</Pressable>
			</View>

			{error && (
				<AppText variant="caption" accessibilityRole="alert" className="text-sylla-danger">
					{error}
				</AppText>
			)}
			{processing !== undefined && <ProcessingProgress value={processing} />}

			<Modal
				visible={confirming}
				transparent
				animationType="fade"
				onRequestClose={() => {
					if (!working) setConfirming(false);
				}}
			>
				<View className="flex-1 items-center justify-center bg-black/50 p-6">
					<View
						accessibilityViewIsModal
						className="w-full max-w-xl gap-4 rounded-2xl bg-sylla-surface p-6"
					>
						<AppText variant="section" accessibilityRole="header">
							Delete this file?
						</AppText>
						<AppText>
							This removes {file.filename} from this device. Your courses, dates and
							calendar items stay as they are. This can’t be undone.
						</AppText>
						<View className="flex-row flex-wrap justify-end gap-3">
							<Pressable
								accessibilityRole="button"
								disabled={working}
								onPress={() => setConfirming(false)}
								className="min-h-12 items-center justify-center rounded-small border border-sylla-border px-4"
							>
								<AppText variant="label">Cancel</AppText>
							</Pressable>
							<Pressable
								accessibilityRole="button"
								accessibilityState={{ disabled: working, busy: working }}
								disabled={working}
								onPress={confirmDelete}
								className="min-h-12 items-center justify-center rounded-small bg-red-700 px-4"
							>
								<AppText variant="label" className="text-white">
									{working ? 'Deleting…' : 'Delete file'}
								</AppText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</AppCard>
	);
}

function ProcessingProgress({ value }: { value: number }) {
	const percent = Math.round(value * 100);
	return (
		<>
			<View
				accessibilityRole="progressbar"
				accessibilityLabel="Processing"
				accessibilityValue={{ min: 0, max: 100, now: percent }}
				className="h-[5px] overflow-hidden rounded-full bg-sylla-paleBlue"
			>
				<View
					className="h-full rounded-full bg-sylla-blue"
					style={{ width: `${percent}%` }}
				/>
			</View>
			<AppText variant="caption" className="text-sylla-muted">
				Processing · {percent}%
			</AppText>
		</>
	);
}
