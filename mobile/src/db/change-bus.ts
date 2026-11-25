import { getTableName, type Table } from 'drizzle-orm';
import { addDatabaseChangeListener } from 'expo-sqlite';

// Tells screens when the tables they show have changed. The database reports one event per changed row, so
// saving a syllabus with a dozen dates would otherwise re-run every open query a dozen times. Events are
// gathered for a moment and each subscriber runs once, if any of the tables it watches changed.
type Subscriber = { tables: ReadonlySet<string>; run: () => void };

// How long to wait after the last change before telling subscribers, and the longest to hold them back.
const QUIET_MS = 30;
const MAX_WAIT_MS = 200;

const subscribers = new Set<Subscriber>();
const changed = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;
let firstChangeAt = 0;
let nativeListener: { remove: () => void } | undefined;

function flush() {
	timer = undefined;
	firstChangeAt = 0;
	const names = new Set(changed);
	changed.clear();
	for (const subscriber of [...subscribers]) {
		for (const name of subscriber.tables) {
			if (names.has(name)) {
				subscriber.run();
				break;
			}
		}
	}
}

function markChanged(names: Iterable<string>) {
	for (const name of names) changed.add(name);
	const now = Date.now();
	if (firstChangeAt === 0) firstChangeAt = now;
	clearTimeout(timer);
	timer = setTimeout(flush, Math.max(0, Math.min(QUIET_MS, firstChangeAt + MAX_WAIT_MS - now)));
}

// Runs `run` after any of the named tables changes. Returns a function that stops it.
export function subscribeToTables(tables: Iterable<string>, run: () => void) {
	const subscriber: Subscriber = { tables: new Set(tables), run };
	subscribers.add(subscriber);
	// Only listens to the database while something is watching it.
	nativeListener ??= addDatabaseChangeListener(({ tableName }) => markChanged([tableName]));
	return () => {
		subscribers.delete(subscriber);
		if (subscribers.size === 0) {
			nativeListener?.remove();
			nativeListener = undefined;
			clearTimeout(timer);
			timer = undefined;
			firstChangeAt = 0;
			changed.clear();
		}
	};
}

// Marks tables as changed by hand. Writes that change other tables as a side effect (a foreign-key cascade
// that deletes a course's dates) call this for those tables, so screens showing them refresh without relying
// on the database to report every cascaded row.
export function invalidateTables(...tables: Table[]) {
	markChanged(tables.map((table) => getTableName(table)));
}
