// Browsers retain course data in SQLite, but selected blob URLs are session-only.
export async function retainSyllabus(_uri: string, _courseId: string): Promise<string | null> {
	return null;
}
export function removeSyllabus(_path: string) {}
export async function openSyllabus(_path: string) {
	throw new Error('Open the mobile app to access a retained syllabus.');
}
