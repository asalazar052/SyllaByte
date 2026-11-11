// The web build has no scheduled notifications. The phone builds use reminders.native.ts.
export function configureReminders() {}
export async function requestReminderPermission() {
	return false;
}
export async function syncReminders() {}
export function useReminderTaps() {}
