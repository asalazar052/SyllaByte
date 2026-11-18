import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
export { ImpactFeedbackStyle };

// A haptic tap under the finger.
export async function tapHaptic(strength: ImpactFeedbackStyle = ImpactFeedbackStyle.Light) {
	try {
		await impactAsync(strength);
	} catch {
		// No haptics here; nothing to do.
	}
}
