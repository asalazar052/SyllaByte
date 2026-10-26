import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { type Course } from '@/data/courses';
import { Radii, SyllaColors } from '@/constants/theme';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { cardStyle } from '@/components/ui/app-card';

export function CourseCard({ course }: { course: Course }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${course.code}, ${course.title}${course.reviewFields.length ? ', needs review' : ''}`}
      onPress={() => router.push({ pathname: '/courses/[id]', params: { id: course.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: course.iconBackground }]}>
        <AppIcon name={course.icon} />
      </View>
      <View style={styles.copy}>
        <View style={styles.identifier}>
          <AppText variant="code" color={SyllaColors.blue}>
            {course.code}
          </AppText>
          {course.reviewFields.length > 0 && (
            <AppText variant="code" color={SyllaColors.brown} style={styles.review}>
              • Review
            </AppText>
          )}
        </View>
        <AppText variant="heading">{course.title}</AppText>
        <AppText variant="micro" color={SyllaColors.muted}>
          {course.schedule} · {course.credits} credits
        </AppText>
      </View>
      <AppIcon name="chevron" size={15} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    padding: 14,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 43,
    height: 47,
    borderRadius: Radii.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copy: { flex: 1, gap: 5 },
  identifier: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  review: { fontSize: 9 },
  pressed: { opacity: 0.7 },
});
