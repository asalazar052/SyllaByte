// Short lines for the semester card, in three sizes of week. One is picked each time the app starts and kept
// until it closes, so the card doesn't change as the screen redraws or as the user moves between tabs. Each
// tap on the card moves on to the next line in the list.
const clearWeek = [
	'A clear week ahead.',
	'Room to breathe this week.',
	'Nothing due. Enjoy it.',
	'A quiet stretch ahead.',
	'Time to get ahead.',
	'Nothing on the horizon.',
	'Take the week off.',
	'Breathing room, all week.',
	'A free week. Use it well.',
	'Your calendar is clear.',
	'Smooth sailing ahead.',
	'Nothing but open space.',
	'A good week to rest.',
];

const lightWeek = [
	'A little more ahead.',
	'A few things to tick off.',
	'Light work this week.',
	'Plenty of time for it all.',
	'Easy does it.',
	'A gentle week ahead.',
	'Just a few things due.',
	'Nothing to stress about.',
	'A manageable week.',
	'Plenty of room to breathe.',
	'A steady, easy week.',
	'Only a little to do.',
	'Lots of time, not much due.',
	'A comfortable week ahead.',
];

const busyWeek = [
	'A full week ahead.',
	'One step at a time.',
	"You've got this week.",
	'Steady wins the semester.',
	'Small steps add up.',
	'Keep the momentum going.',
	"A big week. You're ready.",
	'Lots to tackle. Start small.',
	'Pace yourself. You can do this.',
	'A packed week. Take it daily.',
	'Plenty due. Plan it out.',
	'Busy week. Pick one thing.',
	"You've handled busy before.",
	'Deadlines ahead. Stay steady.',
	'Break it down, day by day.',
	'A heavy week. Rest too.',
];

// A week with more than this many things due is busy.
const BUSY_OVER = 3;

// Where each list starts, drawn once when the app loads.
const draw = Math.random();

// `dueThisWeek` is how many things are left in the semester's current week: none is clear, up to
// BUSY_OVER is light, and more than that is busy. `taps` is how many times the card has been tapped, which
// steps through the list and wraps around, so a tap never repeats the line it just showed.
export function semesterQuip(dueThisWeek: number, taps = 0) {
	const quips = dueThisWeek === 0 ? clearWeek : dueThisWeek > BUSY_OVER ? busyWeek : lightWeek;
	return quips[(Math.floor(draw * quips.length) + taps) % quips.length];
}
