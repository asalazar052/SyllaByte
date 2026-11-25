import { AppCard } from './app-card';
import { AppText } from './app-text';

// What a list shows when it has nothing in it: an optional heading and a line saying what will appear here.
export function EmptyCard({ title, message }: { title?: string; message: string }) {
	return (
		<AppCard>
			{title && <AppText variant="heading">{title}</AppText>}
			<AppText className="text-sylla-muted">{message}</AppText>
		</AppCard>
	);
}
