import { useState } from 'react';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { goBackOr, PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { SyllaColors } from '@/constants/theme';
import { useSettings } from '@/db/hooks';
import { type Settings } from '@/db/queries';
import { updateSettings } from '@/domain/commands';
import { EMAIL, orNull } from '@/lib/input';

export function EditProfileScreen() {
	const settings = useSettings();
	return (
		<Screen>
			<PageHeader
				parent="SETTINGS"
				backLabel="Back to settings"
				onBack={() => goBackOr('/settings')}
				title="Edit your profile."
				description="A few details to make your semester feel like yours."
			/>
			{settings && <ProfileForm settings={settings} />}
		</Screen>
	);
}

// Starts from the saved profile and writes it back only on Save.
function ProfileForm({ settings }: { settings: Settings }) {
	const [draft, setDraft] = useState({
		fullName: settings.fullName ?? '',
		preferredName: settings.preferredName ?? '',
		institution: settings.institution ?? '',
		email: settings.email ?? '',
	});
	const [error, setError] = useState<string>();

	function update(key: keyof typeof draft, value: string) {
		setDraft((current) => ({ ...current, [key]: value }));
	}

	function save() {
		if (draft.email.trim() && !EMAIL.test(draft.email.trim())) {
			setError('Enter a valid email address.');
			return;
		}
		updateSettings({
			fullName: orNull(draft.fullName),
			preferredName: orNull(draft.preferredName),
			institution: orNull(draft.institution),
			email: orNull(draft.email),
		});
		goBackOr('/settings');
	}

	return (
		<>
			<View className="gap-3.5">
				<AppText variant="eyebrow" className="text-sylla-blue">
					PERSONAL DETAILS
				</AppText>
				<TextField
					label="Full name"
					value={draft.fullName}
					onChangeText={(text) => update('fullName', text)}
					autoCapitalize="words"
				/>
				<TextField
					label="Preferred name"
					value={draft.preferredName}
					onChangeText={(text) => update('preferredName', text)}
					autoCapitalize="words"
				/>
				<AppText variant="micro" className="text-sylla-muted">
					This is how we'll greet you on Home.
				</AppText>
				<TextField
					label="Institution"
					value={draft.institution}
					onChangeText={(text) => update('institution', text)}
				/>
				<TextField
					label="Email address"
					value={draft.email}
					onChangeText={(text) => update('email', text)}
					keyboardType="email-address"
					autoCapitalize="none"
				/>
				{error ? (
					<AppText
						variant="caption"
						className="text-sylla-brown"
						accessibilityLiveRegion="polite"
					>
						{error}
					</AppText>
				) : null}
			</View>
			<AppCard className="flex-row items-center border-sylla-paleBlue bg-sylla-paleBlue">
				<AppIcon name="shieldCheck" size={18} tintColor={SyllaColors.blue} />
				<AppText variant="caption" className="min-w-0 flex-1 text-sylla-blue">
					Your profile is just for you. Updating it won't change your syllabi, courses, or
					calendar.
				</AppText>
			</AppCard>
			{/* Keeps the button at the bottom of a short screen. */}
			<View className="flex-1" />
			<AppButton label="Save changes" onPress={save} />
		</>
	);
}
