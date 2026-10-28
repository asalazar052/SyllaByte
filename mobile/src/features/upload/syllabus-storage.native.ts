import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function retainSyllabus(uri: string, courseId: string): Promise<string | null> {
	const directory = new Directory(Paths.document, 'syllabi');
	directory.create({ idempotent: true, intermediates: true });
	const name = `${courseId}.pdf`;
	const destination = new File(directory, name);
	try {
		await new File(uri).copy(destination);
	} catch (error) {
		try {
			if (destination.exists) destination.delete();
		} catch {
			/* Keep the copy error. */
		}
		throw error;
	}
	return name;
}
export function removeSyllabus(path: string) {
	const file = new File(Paths.document, 'syllabi', path);
	if (file.exists) file.delete();
}
export async function openSyllabus(path: string) {
	const file = new File(Paths.document, 'syllabi', path);
	if (!file.exists) throw new Error('The saved syllabus could not be found.');
	if (!(await Sharing.isAvailableAsync()))
		throw new Error('No PDF sharing options are available on this device.');
	await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}
