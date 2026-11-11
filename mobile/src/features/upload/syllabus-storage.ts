// Browsers retain course data in SQLite, but selected blob URLs are session-only.
export type RetainedSyllabus = {
	path: string | null;
	bytes: number | null;
	checksum: string | null;
};
export async function retainSyllabus(_uri: string, _courseId: string): Promise<RetainedSyllabus> {
	return { path: null, bytes: null, checksum: null };
}
export function removeSyllabus(_path: string) {}
export async function resolveSyllabus(_path: string): Promise<{ uri: string }> {
	throw new Error('Open the mobile app to view your saved syllabus.');
}
export async function shareSyllabus(_path: string, _filename?: string) {
	throw new Error('Open the mobile app to access a retained syllabus.');
}
