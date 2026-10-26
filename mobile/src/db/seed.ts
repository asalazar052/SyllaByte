import { SyllaColors } from '@/constants/theme';
import { db } from './client';
import { courseReviewFields, courses, officeHours, professors, semesters } from './schema';

// Minutes after midnight.
const at = (hour: number, minute = 0) => hour * 60 + minute;

const seedSemester = {
  name: 'Fall 2026',
  courses: [
    {
      id: 'math-201',
      code: 'MATH 201',
      title: 'Calculus II',
      days: 'MWF',
      startTime: at(9),
      endTime: at(9, 50),
      location: 'Science Hall 204',
      credits: 4,
      icon: 'sigma',
      iconBackground: SyllaColors.paleBlue,
      professor: {
        name: 'Dr. Maya Chen',
        email: 'mchen@northfield.edu',
        officeHours: {
          days: 'TTh',
          startTime: at(14),
          endTime: at(15),
          location: 'Science Hall 218',
        },
      },
      reviewFields: [
        { label: 'Midterm 1', value: 'Sep 28, 2026' },
        { label: 'Final exam', value: 'Dec 14, 2026' },
      ],
    },
    {
      id: 'bio-110',
      code: 'BIO 110',
      title: 'Intro to Biology',
      days: 'TTh',
      startTime: at(13),
      endTime: at(14, 15),
      location: 'Life Sciences 112',
      credits: 4,
      icon: 'sprout',
      iconBackground: SyllaColors.green,
      professor: {
        name: 'Dr. Samuel Okafor',
        email: 'sokafor@northfield.edu',
        officeHours: {
          days: 'MW',
          startTime: at(11),
          endTime: at(12),
          location: 'Life Sciences 230',
        },
      },
      reviewFields: [],
    },
    {
      id: 'eng-210',
      code: 'ENG 210',
      title: 'Literature & Society',
      days: 'MW',
      startTime: at(14),
      endTime: at(15, 15),
      location: 'Humanities 305',
      credits: 3,
      icon: 'feather',
      iconBackground: SyllaColors.purple,
      professor: {
        name: 'Dr. Elena Moretti',
        email: 'emoretti@northfield.edu',
        officeHours: {
          days: 'TTh',
          startTime: at(15, 30),
          endTime: at(16, 30),
          location: 'Humanities 340',
        },
      },
      reviewFields: [{ label: 'Required textbook edition', value: '4th edition — check scan' }],
    },
    {
      id: 'psy-101',
      code: 'PSY 101',
      title: 'Intro to Psychology',
      days: 'TTh',
      startTime: at(10),
      endTime: at(11, 15),
      location: 'Social Sciences 120',
      credits: 3,
      icon: 'brain',
      iconBackground: SyllaColors.peach,
      professor: {
        name: 'Dr. Priya Raman',
        email: 'praman@northfield.edu',
        officeHours: {
          days: 'MF',
          startTime: at(13),
          endTime: at(14),
          location: 'Social Sciences 214',
        },
      },
      reviewFields: [],
    },
  ],
} as const;

// Inserts the mock semester on first launch; does nothing once any semester exists.
export async function seedIfEmpty() {
  db.transaction((tx) => {
    if (tx.select({ id: semesters.id }).from(semesters).limit(1).get()) return;
    const { id: semesterId } = tx
      .insert(semesters)
      .values({ name: seedSemester.name })
      .returning({ id: semesters.id })
      .get();
    for (const { reviewFields, professor, ...course } of seedSemester.courses) {
      const { officeHours: hours, ...professorValues } = professor;
      const { id: professorId } = tx
        .insert(professors)
        .values(professorValues)
        .returning({ id: professors.id })
        .get();
      tx.insert(courses).values({ ...course, semesterId, professorId }).run();
      tx.insert(officeHours).values({ ...hours, professorId, courseId: course.id }).run();
      if (reviewFields.length > 0) {
        tx.insert(courseReviewFields)
          .values(reviewFields.map((field) => ({ ...field, courseId: course.id })))
          .run();
      }
    }
  });
}
