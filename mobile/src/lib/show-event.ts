import { router } from 'expo-router';

// Takes the user to the calendar on the event's day, then opens the event's details over it. Without an
// event, such as one that has since been deleted, it just opens the calendar.
export function showEventOnCalendar(event?: { id: number; date: string }) {
	if (!event) {
		router.navigate('/calendar');
		return;
	}
	// `focus` changes on every visit, so going to the same day twice still counts.
	router.navigate({
		pathname: '/calendar',
		params: { date: event.date, focus: String(Date.now()) },
	});
	router.push({ pathname: '/event/[id]', params: { id: event.id } });
}
