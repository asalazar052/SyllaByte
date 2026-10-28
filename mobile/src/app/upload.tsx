import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';

export default function Upload() {
	const insets = useSafeAreaInsets();
	return (
		<Screen>
			<AppText variant="eyebrow" color={SyllaColors.blue}>
				SYLLABYTE / UPLOAD
			</AppText>
			<AppText variant="title" accessibilityRole="header">
				A clearer semester starts here.
			</AppText>
			<AppCard>
				<AppIcon name="scan" size={22} />
				<AppText variant="heading">Upload a syllabus</AppText>
				<AppText color={SyllaColors.muted}>
					Next, you’ll choose a syllabus, watch it process, and check extracted course
					details and dates.
				</AppText>
				<AppText variant="caption" color={SyllaColors.brown}>
					Mock upload preview · File selection and processing are coming in the next
					milestone. No file is uploaded here.
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
