import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { UploadedFile } from '@/db/queries';
import { deleteFile } from '@/domain/commands';
import { formatBytes, joinParts } from '@/lib/format';
import { plural } from '@/lib/plural';
import { shareSyllabus } from '@/lib/syllabus-storage';

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
	// The viewer shows a course's syllabus, so a file needs both a copy to show and a course to open it under.
	const courseId = file.courseId;
	const canOpen = hasCopy && courseId !== null;

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
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`Open ${file.filename}`}
				accessibilityState={{ disabled: !canOpen }}
				disabled={!canOpen}
				onPress={() =>
					router.push({
						pathname: '/settings/syllabus/[id]',
						params: { id: courseId ?? 0 },
					})
				}
				className="gap-2 active:opacity-70"
			>
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
					{canOpen && <AppIcon name="chevron" size={15} />}
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
							file.pageCount !== null && plural(file.pageCount, 'page'),
							formatBytes(file.bytes),
						)}
					</AppText>
				</View>
			</Pressable>

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

			<ConfirmDialog
				visible={confirming}
				title="Delete this file?"
				message={`This removes ${file.filename} from this device. Your courses, dates and calendar items stay as they are. This can’t be undone.`}
				confirmLabel="Delete file"
				busy={working}
				onCancel={() => {
					if (!working) setConfirming(false);
				}}
				onConfirm={confirmDelete}
			/>
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
