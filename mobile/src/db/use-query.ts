import { getTableName, type TableRelationalConfig } from 'drizzle-orm';
import type { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useState } from 'react';

import { subscribeToTables } from './change-bus';

// What a query can be: a select or a relational query (db.query.x.findMany / findFirst), both run on a
// synchronous driver.
type Watchable = Parameters<typeof useLiveQuery>[0];

// The parts of a drizzle query that say which tables it reads. They aren't public, but they are what drizzle's
// own useLiveQuery reads to find a query's table.
type Internals = {
	mode?: string;
	table?: Parameters<typeof getTableName>[0];
	tableConfig?: TableRelationalConfig;
	schema?: Record<string, TableRelationalConfig>;
	config?: unknown;
};
type WithConfig = Record<string, boolean | { with?: WithConfig } | undefined>;
type SelectConfig = { table?: Parameters<typeof getTableName>[0]; joins?: { table: unknown }[] };

// Every table a query reads, including the tables it joins and the ones it pulls in with `with:`. Drizzle's own
// useLiveQuery only watches the first, so a change to a joined table (say, a professor's name) used to be missed.
export function watchedTables(query: Watchable) {
	const names = new Set<string>();
	const { table, tableConfig, schema, config } = query as unknown as Internals;
	if (tableConfig && table) {
		names.add(getTableName(table));
		const addRelations = (from: TableRelationalConfig, withConfig: WithConfig | undefined) => {
			for (const [key, value] of Object.entries(withConfig ?? {})) {
				const target = value ? from.relations[key]?.referencedTable : undefined;
				if (!target) continue;
				const name = getTableName(target);
				names.add(name);
				const next = Object.values(schema ?? {}).find((entry) => entry.dbName === name);
				if (next && typeof value === 'object') addRelations(next, value.with);
			}
		};
		addRelations(
			tableConfig,
			typeof config === 'object' ? (config as { with?: WithConfig }).with : undefined,
		);
	} else {
		const select = config as SelectConfig | undefined;
		if (select?.table) names.add(getTableName(select.table));
		for (const join of select?.joins ?? []) {
			if (join.table && typeof join.table === 'object')
				names.add(getTableName(join.table as NonNullable<SelectConfig['table']>));
		}
	}
	return names;
}

// Runs a query and runs it again whenever any table it reads changes. `deps` lists the values the query is
// built from, as with useEffect. Before the first result, `data` is an empty list (or undefined for a query
// that returns one row).
export function useQuery<T extends Watchable>(query: T, deps: unknown[] = []) {
	const [data, setData] = useState<Awaited<T>>(
		() => ((query as unknown as Internals).mode === 'first' ? undefined : []) as Awaited<T>,
	);
	const [error, setError] = useState<Error>();
	const [updatedAt, setUpdatedAt] = useState<Date>();

	useEffect(() => {
		let active = true;
		const run = () => {
			query.then(
				(result) => {
					if (!active) return;
					setData(result as Awaited<T>);
					setError(undefined);
					setUpdatedAt(new Date());
				},
				(reason: unknown) => {
					if (!active) return;
					const failure = reason instanceof Error ? reason : new Error(String(reason));
					console.warn('A query failed', failure);
					setError(failure);
				},
			);
		};
		run();
		const unsubscribe = subscribeToTables(watchedTables(query), run);
		return () => {
			active = false;
			unsubscribe();
		};
		// The caller lists what the query depends on, as drizzle's useLiveQuery asks.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return { data, error, updatedAt };
}
