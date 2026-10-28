import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

const expoDb = openDatabaseSync('syllabyte.db', { enableChangeListener: true });
// SQLite leaves foreign keys off by default; cascades depend on them.
expoDb.execSync('PRAGMA foreign_keys = ON');

export const db = drizzle(expoDb, { schema });
