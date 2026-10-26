import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';
import migrations from '../../drizzle/migrations';
import { db } from './client';
import { seedIfEmpty } from './seed';

// Applies pending migrations, then seeds an empty database.
export function useDatabase() {
  const { success: migrated, error: migrationError } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error>();
  useEffect(() => {
    if (!migrated) return;
    seedIfEmpty().then(() => setSeeded(true), setSeedError);
  }, [migrated]);
  return { ready: seeded, error: migrationError ?? seedError };
}
