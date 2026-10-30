import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import type { UploadedFile } from '@/db/queries';
import { formatBytes, joinParts } from '@/lib/format';

type UploadedFileCardProps = {
	file: UploadedFile;
	// 0 to 1, for a file that is still being read. Omitted once it is done.
	processing?: number;
};

export function UploadedFileCard({ file, processing }: UploadedFileCardProps) {
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
					className="h-8 w-[100px] flex-row items-center justify-center gap-2 active:opacity-70"
				>
					<AppIcon name="trash" size={14} />
					<AppText variant="action" className="font-inter-medium text-sylla-danger">
						Delete
					</AppText>
				</Pressable>
			</View>

			{processing !== undefined && <ProcessingProgress value={processing} />}
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
