import type { AppIconName } from '@/components/ui/app-icon';
import { SyllaColors } from '@/constants/theme';

export type Course = {
  id: string;
  code: string;
  title: string;
  schedule: string;
  credits: number;
  icon: AppIconName;
  iconBackground: string;
  reviewFields: { label: string; value: string }[];
};
export const semester = { name: 'Fall 2026' } as const;
export const courses: Course[] = [
  {
    id: 'math-201',
    code: 'MATH 201',
    title: 'Calculus II',
    schedule: 'MWF · 9:00–9:50 AM',
    credits: 4,
    icon: 'sigma',
    iconBackground: SyllaColors.paleBlue,
    reviewFields: [
      { label: 'Midterm 1', value: 'Sep 28, 2026' },
      { label: 'Final exam', value: 'Dec 14, 2026' },
    ],
  },
  {
    id: 'bio-110',
    code: 'BIO 110',
    title: 'Intro to Biology',
    schedule: 'TTh · 1:00–2:15 PM',
    credits: 4,
    icon: 'sprout',
    iconBackground: SyllaColors.green,
    reviewFields: [],
  },
  {
    id: 'eng-210',
    code: 'ENG 210',
    title: 'Literature & Society',
    schedule: 'MW · 2:00–3:15 PM',
    credits: 3,
    icon: 'feather',
    iconBackground: SyllaColors.purple,
    reviewFields: [{ label: 'Required textbook edition', value: '4th edition — check scan' }],
  },
  {
    id: 'psy-101',
    code: 'PSY 101',
    title: 'Intro to Psychology',
    schedule: 'TTh · 10:00–11:15 AM',
    credits: 3,
    icon: 'brain',
    iconBackground: SyllaColors.peach,
    reviewFields: [],
  },
];
export function filterCourses(query: string, reviewOnly: boolean) {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
  return courses.filter(
    (course) =>
      (!reviewOnly || course.reviewFields.length > 0) &&
      `${course.code} ${course.title}`.toLowerCase().includes(normalized),
  );
}
