export const EMAIL = /^\S+@\S+\.\S+$/;

// Every optional text field can be cleared: an emptied field is stored as null.
export const orNull = (text: string) => text.trim() || null;
