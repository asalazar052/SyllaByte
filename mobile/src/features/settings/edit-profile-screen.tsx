import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { SyllaColors } from '@/constants/theme';
import { updateSettings } from '@/db/mutations';
import { type Settings, settingsQuery } from '@/db/queries';
import { EMAIL, orNull } from '@/lib/input';

import { backToSettings, SettingsPageHeader } from './settings-page-header';

const labelClassName = 'font-inter-medium text-sylla-blue';
const inputClassName = 'min-h-12 bg-sylla-surface p-3.5 text-[13px]';

export function EditProfileScreen() {
	const { data: settings } = useLiveQuery(settingsQuery());
	return (
		<Screen>
			<SettingsPageHeader
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
		backToSettings();
	}

	return (
		<>
			<View className="gap-3.5">
				<AppText variant="eyebrow" className="text-sylla-blue">
					PERSONAL DETAILS
				</AppText>
				<TextField
					label="Full name"
					labelClassName={labelClassName}
					className={inputClassName}
					value={draft.fullName}
					onChangeText={(text) => update('fullName', text)}
					autoCapitalize="words"
				/>
				<TextField
					label="Preferred name"
					labelClassName={labelClassName}
					className={inputClassName}
					value={draft.preferredName}
					onChangeText={(text) => update('preferredName', text)}
					autoCapitalize="words"
				/>
				<AppText variant="micro" className="text-sylla-muted">
					This is how we’ll greet you on Home.
				</AppText>
				<TextField
					label="Institution"
					labelClassName={labelClassName}
					className={inputClassName}
					value={draft.institution}
					onChangeText={(text) => update('institution', text)}
				/>
				<TextField
					label="Email address"
					labelClassName={labelClassName}
					className={inputClassName}
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
					Your profile is just for you. Updating it won’t change your syllabi, courses, or
					calendar.
				</AppText>
			</AppCard>
			{/* Keeps the button at the bottom of a short screen. */}
			<View className="flex-1" />
			<AppButton label="Save changes" onPress={save} />
		</>
	);
}
