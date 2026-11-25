import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';

import {
	type AppNotification,
	notificationMeta,
	type NotificationTone,
} from './notification-display';

const tones: Record<NotificationTone, { tile: string; text: string }> = {
	blue: { tile: 'bg-sylla-paleBlue/60', text: 'text-sylla-blue' },
	brown: { tile: 'bg-sylla-peach', text: 'text-sylla-brown' },
	green: { tile: 'bg-sylla-green', text: 'text-sylla-forest' },
};

// An unread notification keeps its border and has a dot after its title; once read, the border goes.
export function NotificationCard({
	notification,
	today,
	onPress,
}: {
	notification: AppNotification;
	today: string;
	onPress: () => void;
}) {
	const { unread } = notification;
	const tone = tones[notification.tone];
	const meta = notificationMeta(notification, today);
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${unread ? 'Unread. ' : ''}${notification.title}. ${notification.body} ${meta}`}
			onPress={onPress}
			className={`flex-row items-start gap-3 rounded-2xl border bg-sylla-surface p-[15px] active:opacity-75 ${unread ? 'border-sylla-border' : 'border-transparent'}`}
		>
			<View className={`size-9 items-center justify-center rounded-small ${tone.tile}`}>
				<AppIcon name={notification.icon} size={18} />
			</View>
			<View className="min-w-0 flex-1 gap-1.5">
				<View className="flex-row items-center gap-[7px]">
					<AppText className="min-w-0 flex-1 font-inter-semibold text-[13px]">
						{notification.title}
					</AppText>
					{unread && <View className="size-1.5 rounded-full bg-sylla-blue" />}
				</View>
				<AppText className="text-[11px] leading-[16.5px] text-sylla-muted">
					{notification.body}
				</AppText>
				<AppText className={`text-[10px] ${tone.text}`}>{meta}</AppText>
			</View>
		</Pressable>
	);
}
