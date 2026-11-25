// What the domain needs from the device, said in the domain's own terms. The app supplies the how once at
// startup (see configurePorts), so the rules here never import a native module and can be tested or reused
// without one.
type Ports = {
	// Asks to send notifications if that hasn't been decided yet. Resolves to whether they are allowed.
	requestNotificationPermission: () => Promise<boolean>;
};

export const ports: Ports = {
	requestNotificationPermission: async () => false,
};

export function configurePorts(overrides: Partial<Ports>) {
	Object.assign(ports, overrides);
}
