import { View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';

import { processingStages } from './mock-extraction';
import { ReviewForm } from './review-form';
import { useSyllabusPicker } from './syllabus-picker';

export function ExtractionPreview() {
	const { extraction, processing, cancelExtraction } = useSyllabusPicker();
	if (extraction.phase === 'idle') return null;
	if (processing) {
		const current = processingStages.findIndex((stage) => stage.phase === extraction.phase);
		return (
			<AppCard>
				<AppText variant="heading" accessibilityLiveRegion="polite">
					{processingStages[current].label}…
				</AppText>
				<AppText className="text-sylla-muted">{processingStages[current].detail}</AppText>
				{processingStages.map((stage, index) => (
					<View key={stage.phase} className="flex-row items-center gap-3">
						<AppText
							className={index <= current ? 'text-sylla-blue' : 'text-sylla-muted'}
						>
							{index < current ? '✓' : `${index + 1}.`}
						</AppText>
						<AppText variant={index === current ? 'label' : 'body'} className="flex-1">
							{stage.label}
							{index < current
								? ' · Complete'
								: index === current
									? ' · In progress'
									: ' · Waiting'}
						</AppText>
					</View>
				))}
				<AppText variant="caption" className="text-sylla-muted">
					You can return to Courses and check back here when it’s ready.
				</AppText>
				<AppButton label="Cancel extraction" onPress={cancelExtraction} />
			</AppCard>
		);
	}
	return <ReviewForm />;
}
