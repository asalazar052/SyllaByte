import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { settingsQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { defaultReminder, isSameReminder, type ItemReminder } from '@/domain/reminders/resolve';
import { formatLeadTime, formatTime } from '@/lib/format';

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
	const { data: settings } = useQuery(settingsQuery());
	const [custom, setCustom] = useState<ItemReminder | null>(null);
	const defaults = useMemo(() => defaultReminder(settings), [settings]);
	const revert = useCallback(() => setCustom(null), []);
	const value = useMemo<ItemReminderState>(
		() => ({
			reminder: custom ?? defaults,
			modified: custom !== null && !isSameReminder(custom, defaults),
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
