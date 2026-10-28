import Storage from 'expo-sqlite/kv-store';
import { useState } from 'react';

// Like useState, but the value is saved on the device and read back on the next launch. `parse`
// turns whatever was stored into a valid value, so an old or damaged entry can't break the screen.
export function useStoredState<T>(key: string, fallback: T, parse: (stored: unknown) => T) {
	const [value, setValue] = useState(() => {
		try {
			const stored = Storage.getItemSync(key);
			return stored === null ? fallback : parse(JSON.parse(stored));
		} catch {
			return fallback;
		}
	});

	function update(next: T) {
		setValue(next);
		Storage.setItemSync(key, JSON.stringify(next));
	}

	return [value, update] as const;
}
