import { router } from 'expo-router';

import { SyllaColors } from '@/constants/theme';

import { AppButton } from './ui/app-button';
import { AppCard } from './ui/app-card';
import { AppIcon, type AppIconName } from './ui/app-icon';
import { AppText } from './ui/app-text';
import { Screen } from './ui/screen';

export function PlaceholderScreen({
	title,
	description,
	icon,
}: {
	title: string;
	description: string;
	icon: AppIconName;
}) {
	return (
		<Screen>
			<AppText variant="eyebrow" className="text-sylla-blue">
				SYLLABYTE / {title.toUpperCase()}
			</AppText>
			<AppText variant="title" accessibilityRole="header">
				{title}
			</AppText>
			<AppCard>
				<AppIcon name={icon} size={23} tintColor={SyllaColors.blue} />
				<AppText variant="heading">A little more ahead.</AppText>
				<AppText className="text-sylla-muted">{description}</AppText>
				<AppText variant="caption" className="text-sylla-muted">
					Coming in a later milestone. Your mock courses are ready to explore.
				</AppText>
			</AppCard>
			<AppButton label="Explore your courses" onPress={() => router.navigate('/courses')} />
		</Screen>
	);
}
