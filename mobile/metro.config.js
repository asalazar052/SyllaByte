const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Drizzle migrations are bundled as .sql; expo-sqlite on web needs its wasm binary.
config.resolver.sourceExts.push('sql');
config.resolver.assetExts.push('wasm');

module.exports = config;
