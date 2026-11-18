import { useEffect, useRef, useState } from 'react';

const DELETE_MS = 25;
const DELETE_CHARS = 2;
// A beat between the last letter going and the first one coming.
const PAUSE_MS = 140;
const TYPE_MS = 38;

type Typed = { text: string; visible: number };

export type Typewriter = Typed & {
	// True while a line is being deleted or typed, which is until `target` is all showing.
	typing: boolean;
};

// Types `target` out. When it changes, the old text is deleted a couple of letters at a time and the new text is
// typed in.  A change part way through carries on from whatever is on screen. `startBlank` starts with nothing showing,
// so the first line is typed in, and `paused` holds everything where it is until it goes false.
export function useTypewriter(
	target: string,
	animate: boolean,
	{ startBlank = false, paused = false }: { startBlank?: boolean; paused?: boolean } = {},
): Typewriter {
	const [shown, setShown] = useState<Typed>({
		text: target,
		visible: startBlank ? 0 : target.length,
	});
	const latest = useRef(shown);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;

		function show(next: Typed) {
			if (next.text === latest.current.text && next.visible === latest.current.visible)
				return;
			latest.current = next;
			setShown(next);
		}

		function step() {
			if (paused) return;
			const { text, visible } = latest.current;
			if (!animate) {
				show({ text: target, visible: target.length });
				return;
			}
			if (text !== target) {
				if (visible > 0) {
					const left = Math.max(0, visible - DELETE_CHARS);
					show({ text, visible: left });
					timer = setTimeout(step, left === 0 ? PAUSE_MS : DELETE_MS);
				} else {
					show({ text: target, visible: 0 });
					timer = setTimeout(step, TYPE_MS);
				}
			} else if (visible < text.length) {
				show({ text, visible: visible + 1 });
				timer = setTimeout(step, TYPE_MS);
			}
		}

		timer = setTimeout(step, 0);
		return () => clearTimeout(timer);
	}, [target, animate, paused]);

	return { ...shown, typing: shown.text !== target || shown.visible < shown.text.length };
}
