import {
	type ComponentRef,
	createContext,
	type ReactNode,
	type RefObject,
	useContext,
} from 'react';
import type { View } from 'react-native';

export type ScreenOverlay = {
	// The view the overlay is laid out over. Positions inside the overlay are measured from it.
	rootRef: RefObject<ComponentRef<typeof View> | null>;
	// How tall that view is.
	height: number;
	// Shows something over the whole screen, or clears it when given null. `onDismiss` is called if the
	// screen takes it down itself, which it does when the page underneath is touched.
	present: (content: ReactNode, onDismiss?: () => void) => void;
};

// A `Screen` provides this, so a dropdown can show its list over the screen in the screen's own coordinates.
export const ScreenOverlayContext = createContext<ScreenOverlay | null>(null);

export const useScreenOverlay = () => useContext(ScreenOverlayContext);
