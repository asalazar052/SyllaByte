// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = defineConfig([
	expoConfig,
	prettierConfig,
	{
		plugins: { 'simple-import-sort': simpleImportSort },
		rules: {
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
		},
	},
	// Where code may import from. The layers, lowest first: lib, then db, then domain, then components and hooks,
	// then features, then app (the routes). Each rule below keeps a layer from reaching up or sideways, and
	// the message says what to do instead. A type-only import is always fine, because it can't cause a
	// dependency at run time.
	{
		// Features talk to each other through the other feature's index, not its internals.
		files: ['src/features/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/features/*/*'],
							message:
								"Import another feature through its index ('@/features/<name>'), and add what you need to that index. Inside a feature, use a relative import.",
							allowTypeImports: true,
						},
						{
							group: ['@/db/client', '@/db/schema'],
							message:
								'Read data through @/db/queries, @/db/hooks or @/db/use-query, and change it through @/domain/commands.',
							allowTypeImports: true,
						},
					],
				},
			],
		},
	},
	{
		// Shared UI, hooks and routes also leave the database to queries and commands.
		files: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/db/client', '@/db/schema'],
							message:
								'Read data through @/db/queries, @/db/hooks or @/db/use-query, and change it through @/domain/commands.',
							allowTypeImports: true,
						},
					],
				},
			],
		},
	},
	{
		// lib is plain helpers with nothing app-specific in it.
		files: ['src/lib/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'@/db',
								'@/db/*',
								'@/domain',
								'@/domain/**',
								'@/features/**',
								'@/components/**',
								'@/hooks/**',
								'@/app/**',
							],
							message:
								'lib is below the rest of the app. Move this code up to where it is used, or move what it needs down into lib.',
							allowTypeImports: true,
						},
					],
				},
			],
		},
	},
	{
		// The domain is rules and commands: no screens, hooks, React or device APIs. Device behavior it needs comes
		// in through domain/ports.ts.
		files: ['src/domain/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'react',
							message: 'The domain has no UI. Put this in a hook or component.',
						},
						{
							name: 'react-native',
							message: 'The domain has no UI. Put this in a hook or component.',
						},
						{
							name: 'expo-router',
							message: 'The domain has no navigation. Do it from the screen.',
						},
					],
					patterns: [
						{
							group: ['@/features/**', '@/components/**', '@/hooks/**', '@/app/**'],
							message:
								'The domain is below screens and components. Pass what it needs in, or use domain/ports.ts for the device.',
							allowTypeImports: true,
						},
						{
							group: [
								'expo-notifications',
								'expo-haptics',
								'expo-sharing',
								'expo-file-system',
							],
							message: 'Reach the device through domain/ports.ts.',
						},
					],
				},
			],
		},
	},
	{
		// The database layer never calls up into screens, or into the commands that sit above it.
		files: ['src/db/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'@/features/**',
								'@/components/**',
								'@/hooks/**',
								'@/app/**',
								'@/domain/commands',
								'@/domain/commands/**',
							],
							message:
								'The database layer is below screens and commands. Commands call the database, not the other way round.',
							allowTypeImports: true,
						},
					],
				},
			],
		},
	},
	{
		ignores: ['dist/*'],
	},
]);
