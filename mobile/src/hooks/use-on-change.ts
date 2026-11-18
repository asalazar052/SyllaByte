import { useEffect, useRef } from 'react';

// Runs `run` each time `value` changes, but not on the first render. It is for starting an animation in
// response to something that happens (a tap counter going up), rather than for what the screen starts with.
export function useOnChange<T>(value: T, run: () => void) {
	const last = useRef(value);
	useEffect(() => {
		if (Object.is(last.current, value)) return;
		last.current = value;
		run();
	}, [value, run]);
}
