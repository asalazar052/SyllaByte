import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import migrations from '../../drizzle/migrations';
import { db, expoDb } from './client';
import { restoreLegacyUploads } from './legacy-upload-upgrade';
import { seedIfEmpty } from './seed';

// Applies pending migrations, then seeds an empty database.
export function useDatabase() {
	const { success: migrated, error: migrationError } = useMigrations(db, migrations);
	const [seeded, setSeeded] = useState(false);
	const [seedError, setSeedError] = useState<Error>();
	useEffect(() => {
		if (!migrated) return;
		async function initialize() {
			restoreLegacyUploads(expoDb);
			await seedIfEmpty();
		}
		initialize().then(() => setSeeded(true), setSeedError);
	}, [migrated]);
	return { ready: seeded, error: migrationError ?? seedError };
}
