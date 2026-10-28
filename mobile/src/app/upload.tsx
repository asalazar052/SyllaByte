import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { useSyllabusPicker } from '@/features/upload/syllabus-picker';

export default function Upload() {
	const insets = useSafeAreaInsets();
	const { file, error, picking, pick, clear } = useSyllabusPicker();
	return (
		<Screen>
			<AppText variant="eyebrow" className="text-sylla-blue">
				SYLLABYTE / UPLOAD
			</AppText>
			<AppText variant="title" accessibilityRole="header">
				A clearer semester starts here.
			</AppText>
			<AppCard>
				<AppIcon name="scan" size={22} />
				<AppText variant="heading">{file ? 'PDF selected' : 'Upload a syllabus'}</AppText>
				<AppText className="text-sylla-muted">
					Choose a PDF syllabus from your files to get started.
				</AppText>
				{file && (
					<View className="gap-2" accessibilityLiveRegion="polite">
						<AppText variant="label">{file.name}</AppText>
						<AppText variant="caption" className="text-sylla-muted">
							PDF{file.size !== undefined ? ` · ${formatFileSize(file.size)}` : ''}
						</AppText>
						<Pressable
							accessibilityRole="button"
							onPress={clear}
							disabled={picking}
							className="min-h-11 justify-center self-start"
						>
							<AppText variant="action" className="text-sylla-blue">
								Remove PDF
							</AppText>
						</Pressable>
					</View>
				)}
				<AppButton
					label={
						picking ? 'Opening files…' : file ? 'Choose a different PDF' : 'Choose PDF'
					}
					disabled={picking}
					onPress={() => {
						void pick();
					}}
				/>
				{error && (
					<AppText accessibilityRole="alert" className="text-sylla-brown">
						{error}
					</AppText>
				)}
				<AppText variant="caption" className="text-sylla-brown">
					{file ? 'Your PDF is selected for this session. ' : ''}
					Uploading and extracting course details are coming next.
				</AppText>
			</AppCard>
			<AppButton
				label="Back to courses"
				onPress={() => {
					if (router.canGoBack()) router.back();
					else router.replace('/courses');
				}}
			/>
			<View style={{ height: insets.bottom }} />
		</Screen>
	);
}

function formatFileSize(bytes: number) {
	return bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
