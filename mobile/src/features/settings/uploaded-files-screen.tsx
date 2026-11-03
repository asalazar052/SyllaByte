import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { filesQuery, type UploadedFile } from '@/db/queries';
import { formatBytes, joinParts } from '@/lib/format';

import { SettingsPageHeader } from './settings-page-header';
import { UploadedFileCard } from './uploaded-file-card';

const PROCESSING_PLACEHOLDER = 0.72;

// The files in each semester, in the order they come from the query (a file with no semester is last).
function groupBySemester(files: UploadedFile[]) {
	const groups = new Map<number | null, UploadedFile[]>();
	for (const file of files) {
		const group = groups.get(file.semesterId);
		if (group) group.push(file);
		else groups.set(file.semesterId, [file]);
	}
	return [...groups.values()];
}

export function UploadedFilesScreen() {
	const { data: files, updatedAt } = useLiveQuery(filesQuery());
	const processingId = files.at(-1)?.id;

	return (
		<Screen>
			<View className="gap-5">
				<SettingsPageHeader
					title="Uploaded files."
					description="Save a copy or remove a syllabus from the app."
				/>

				{groupBySemester(files).map((group) => (
					<View key={group[0].semesterId ?? 'none'} className="gap-2.5">
						<View className="min-h-5 flex-row items-center justify-between gap-3">
							<AppText variant="eyebrow" className="text-sylla-blue">
								{(group[0].semester?.name ?? 'No semester').toUpperCase()}
							</AppText>
							<AppText variant="micro" className="text-sylla-muted">
								{joinParts(
									`${group.length} ${group.length === 1 ? 'file' : 'files'}`,
									formatBytes(
										group.reduce((total, file) => total + file.bytes, 0),
									),
								)}
							</AppText>
						</View>
						{group.map((file) => (
							<UploadedFileCard
								key={file.id}
								file={file}
								processing={
									file.id === processingId ? PROCESSING_PLACEHOLDER : undefined
								}
							/>
						))}
					</View>
				))}

				{updatedAt && files.length === 0 && (
					<AppCard>
						<AppText className="font-inter-medium">No files yet</AppText>
						<AppText variant="caption" className="text-sylla-muted">
							Syllabi you upload will show up here.
						</AppText>
					</AppCard>
				)}

				<View className="flex-row items-center gap-3 rounded-2xl bg-sylla-paleBlue p-4">
					<AppIcon name="shieldCheck" size={18} tintColor={SyllaColors.blue} />
					<AppText
						variant="caption"
						className="min-w-0 flex-1 leading-normal text-sylla-blue"
					>
						Deleting removes the original file from the app. Your courses and calendar
						stay unchanged.
					</AppText>
				</View>
			</View>
		</Screen>
	);
}
