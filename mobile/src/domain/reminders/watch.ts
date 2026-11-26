import { onTablesChanged } from '@/db/change-bus';
import { events, settings } from '@/db/schema';

// Runs `run` whenever something a reminder depends on changes: the items, or the reminder settings. Returns a
// function that stops it.
export function onRemindersChanged(run: () => void) {
	return onTablesChanged([events, settings], run);
}
