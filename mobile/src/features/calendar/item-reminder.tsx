import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { type Settings, settingsQuery } from '@/db/queries';
import { formatLeadTime, formatTime } from '@/lib/format';

export type ItemReminder = {
	enabled: boolean;
	// Whole days before the due date.
	daysAhead: number;
	// Minutes after midnight.
	time: number;
};

// Used until settings have loaded; these match the defaults the settings table starts with.
const FALLBACK_DEFAULT: ItemReminder = { enabled: true, daysAhead: 3, time: 9 * 60 };

const same = (a: ItemReminder, b: ItemReminder) =>
	a.enabled === b.enabled && a.daysAhead === b.daysAhead && a.time === b.time;

type ItemReminderState = {
	// What the item will use: its own reminder if one was set, otherwise the default from settings.
	reminder: ItemReminder;
	// True when the item's reminder differs from the default.
	modified: boolean;
	setReminder: (reminder: ItemReminder) => void;
	revert: () => void;
};

const ItemReminderContext = createContext<ItemReminderState | null>(null);

// The reminder for the item being added. The add screen and its reminder screen sit side by side in the
// calendar's stack, so this lives above both and is cleared (with `revert`) when the form closes.
export function ItemReminderProvider({ children }: { children: ReactNode }) {
	const { data: settings } = useLiveQuery(settingsQuery());
	const [custom, setCustom] = useState<ItemReminder | null>(null);
	const defaults = useMemo<ItemReminder>(
		() =>
			settings
				? {
						enabled: settings.defaultRemindersEnabled,
						daysAhead: settings.reminderDaysAhead,
						time: settings.reminderTime,
					}
				: FALLBACK_DEFAULT,
		[settings],
	);
	const revert = useCallback(() => setCustom(null), []);
	const value = useMemo<ItemReminderState>(
		() => ({
			reminder: custom ?? defaults,
			modified: custom !== null && !same(custom, defaults),
			setReminder: setCustom,
			revert,
		}),
		[custom, defaults, revert],
	);
	return <ItemReminderContext.Provider value={value}>{children}</ItemReminderContext.Provider>;
}

export function useItemReminder() {
	const state = useContext(ItemReminderContext);
	if (!state) throw new Error('useItemReminder must be used inside ItemReminderProvider');
	return state;
}

// '3 days before · 9:00 AM', or 'Off'.
export function describeReminder({ enabled, daysAhead, time }: ItemReminder) {
	return enabled ? `${formatLeadTime(daysAhead)} before · ${formatTime(time)}` : 'Off';
}

// The reminder an item uses: its own if it has one, otherwise the default from settings.
export function itemReminder(
	event: {
		reminderEnabled: boolean | null;
		reminderDaysAhead: number | null;
		reminderTime: number | null;
	},
	settings: Settings,
): ItemReminder {
	return event.reminderEnabled === null
		? {
				enabled: settings.defaultRemindersEnabled,
				daysAhead: settings.reminderDaysAhead,
				time: settings.reminderTime,
			}
		: {
				enabled: event.reminderEnabled,
				daysAhead: event.reminderDaysAhead ?? settings.reminderDaysAhead,
				time: event.reminderTime ?? settings.reminderTime,
			};
}
