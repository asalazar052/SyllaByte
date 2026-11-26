import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { toIsoDate } from '@/lib/dates';

// One clock for the whole app. Screens that show "today" or a time-of-day greeting read it from here, so they
// move on at midnight and when the app comes back to the front, instead of showing the day they were first drawn.
// It ticks at the top of each hour (which includes midnight) and whenever the app becomes active.
let now = new Date();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
let appState: { remove: () => void } | undefined;

function tick() {
	now = new Date();
	for (const listener of listeners) listener();
	scheduleTick();
}

function scheduleTick() {
	clearTimeout(timer);
	const nextHour = new Date(now);
	nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
	// A little past the hour, so the timer never fires early and lands on the old hour again.
	timer = setTimeout(tick, nextHour.getTime() - Date.now() + 50);
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	if (listeners.size === 1) {
		now = new Date();
		appState = AppState.addEventListener('change', (state) => {
			if (state === 'active') tick();
		});
		scheduleTick();
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) {
			clearTimeout(timer);
			appState?.remove();
		}
	};
}

function getNow() {
	// With nobody listening the clock isn't ticking, so a stale reading is replaced before it is used.
	if (listeners.size === 0 && Date.now() - now.getTime() > 60_000) now = new Date();
	return now;
}

// The current time, as of the last hour, midnight or return to the app.
export function useNow() {
	return useSyncExternalStore(subscribe, getNow, getNow);
}

// Today as 'YYYY-MM-DD'.
export function useToday() {
	return toIsoDate(useNow());
}
