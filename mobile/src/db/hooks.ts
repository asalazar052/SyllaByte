import { currentSemesterQuery, semesterCoursesQuery, settingsQuery } from './queries';
import { useQuery } from './use-query';

// The settings, or undefined until they have loaded.
export function useSettings() {
	return useQuery(settingsQuery()).data;
}

// The semester the app treats as current, or undefined until it has loaded (or if there is none).
export function useCurrentSemester() {
	return useQuery(currentSemesterQuery()).data;
}

// The courses of a semester, each with the details flagged for review.
export function useSemesterCourses(semesterId: number | undefined) {
	return useQuery(semesterCoursesQuery(semesterId ?? 0), [semesterId]).data;
}

// The current semester and its courses.
export function useCurrentSemesterCourses() {
	const semester = useCurrentSemester();
	const courses = useSemesterCourses(semester?.id);
	return { semester, courses };
}
