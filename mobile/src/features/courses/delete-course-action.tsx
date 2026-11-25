import { ConfirmDeleteAction } from '@/components/ui/confirm-delete-action';
import { deleteCourse } from '@/domain/commands';

export function DeleteCourseAction({
	id,
	code,
	onDeleted,
}: {
	id: number;
	code: string;
	onDeleted: () => void;
}) {
	return (
		<ConfirmDeleteAction
			className="mt-3"
			label="Delete course"
			title={`Delete ${code}?`}
			message="This removes the course, its dates, materials, and saved syllabus from this device. This can’t be undone."
			failureMessage="Couldn’t delete this course. Please try again."
			onDelete={() => deleteCourse(id)}
			onDeleted={onDeleted}
		/>
	);
}
