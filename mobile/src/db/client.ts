import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import { prepareLegacyUploadUpgrade } from './legacy-upload-upgrade';
import * as schema from './schema';

export const expoDb = openDatabaseSync('syllabyte.db', { enableChangeListener: true });
// SQLite leaves foreign keys off by default; cascades depend on them.
expoDb.execSync('PRAGMA foreign_keys = ON');
prepareLegacyUploadUpgrade(expoDb);

export const db = drizzle(expoDb, { schema });
