const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Drizzle migrations are bundled as .sql; expo-sqlite on web needs its wasm binary.
config.resolver.sourceExts.push('sql');
config.resolver.assetExts.push('wasm');

// babel-plugin-inline-import bakes each .sql file into drizzle/migrations.js, whose own text never
// changes when a migration is edited or regenerated. Keying the transform cache on the migration
// contents stops Metro from serving a stale copy after a restart.
const migrationsDir = path.join(__dirname, 'drizzle');
const migrationsHash = crypto.createHash('sha1');
if (fs.existsSync(migrationsDir)) {
	for (const file of fs
		.readdirSync(migrationsDir)
		.filter((name) => name.endsWith('.sql'))
		.sort()) {
		migrationsHash.update(file).update(fs.readFileSync(path.join(migrationsDir, file)));
	}
}
config.cacheVersion = migrationsHash.digest('hex');

// NativeWind defaults to 14px per rem on native; 16 matches Tailwind's docs and the web build.
module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
