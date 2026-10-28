import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { AppCard } from '@/components/ui/app-card';
import { Screen } from '@/components/ui/screen';
import { courseQuery } from '@/db/queries';
import { CourseInformation } from './course-information';
import { SyllaColors } from '@/constants/theme';
import { AppIcon } from '@/components/ui/app-icon';

export function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: course, updatedAt } = useLiveQuery(courseQuery(id), [id]);
  function back() {
    if (router.canGoBack()) router.back();
    else router.replace('/courses');
  }
  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={back} style={styles.back}>
        <AppText variant="action" color={SyllaColors.blue}>
          ← Back to courses
        </AppText>
      </Pressable>
      {updatedAt === undefined ? null : !course ? (
        <AppCard>
          <AppText variant="heading">Course not found</AppText>
          <AppText>This course is not part of your mock semester.</AppText>
        </AppCard>
      ) : (
        <>
          <AppText variant="eyebrow" color={SyllaColors.blue}>
            COURSES / {course.code}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {course.title}
          </AppText>
          <CourseInformation course={course} />
          {course.reviewFields.length > 0 && (
            <AppCard style={styles.review} rightCornerIcon={<AppIcon name="scan" size={22} />}>
              <AppText variant="heading">
                {course.reviewFields.length}{' '}
                {course.reviewFields.length === 1 ? 'detail needs' : 'details need'} a closer look
              </AppText>
              <AppText color={SyllaColors.brown}>
                These mock fields are flagged for review. Compare them with your syllabus before
                relying on them.
              </AppText>
              {course.reviewFields.map((field) => (
                <View key={field.label} style={styles.field}>
                  <AppText variant="label">{field.label}</AppText>
                  <AppText>{field.value}</AppText>
                </View>
              ))}
            </AppCard>
          )}
          <AppText variant="caption" color={SyllaColors.muted}>
            Course details preview · Editing, confirmation, and syllabus viewing will arrive with
            the review milestone.
          </AppText>
        </>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  review: { backgroundColor: SyllaColors.peach, borderColor: SyllaColors.peach },
  field: { padding: 12, borderRadius: 10, backgroundColor: SyllaColors.surface, gap: 4 },
});
