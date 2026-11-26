import { useState } from 'react';

// The state of a screen's search box: whether it is open and what has been typed. Closing it clears what was
// typed, so a hidden search never keeps filtering the list.
export function useSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	function toggle() {
		if (open) {
			setQuery('');
			setOpen(false);
		} else {
			setOpen(true);
		}
	}

	return { open, query, setQuery, toggle };
}
