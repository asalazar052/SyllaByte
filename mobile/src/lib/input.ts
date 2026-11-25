export const EMAIL = /^\S+@\S+\.\S+$/;

// Every optional text field can be cleared: an emptied field is stored as null.
export const orNull = (text: string) => text.trim() || null;

// What a search is compared against: lower case, with runs of spaces counted as one.
export function normalizeSearch(text: string) {
	return text.trim().toLowerCase().replace(/\s+/g, ' ');
}
