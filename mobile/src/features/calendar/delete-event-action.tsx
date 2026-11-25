import { ConfirmDeleteAction } from '@/components/ui/confirm-delete-action';
import { deleteEvent } from '@/domain/commands';

// The button that removes an item from the calendar, and the confirmation it asks for first. `onDeleted` runs
// once the item is gone, so the screen showing it can close.
export function DeleteEventAction({
	id,
	title,
	onDeleted,
}: {
	id: number;
	title: string;
	onDeleted: () => void;
}) {
	return (
		<ConfirmDeleteAction
			label="Delete item"
			title={`Delete “${title}”?`}
			message="This removes it from your calendar, along with its reminder. This can’t be undone."
			failureMessage="Couldn’t delete this item. Please try again."
			onDelete={() => deleteEvent(id)}
			onDeleted={onDeleted}
		/>
	);
}
