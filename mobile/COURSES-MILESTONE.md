# Courses milestone

Start with `npm start` from `mobile/`. The root route opens `/courses`.

The Courses screen follows Figma frame `3:5167`. The other four tabs, course
details, and upload destination are intentional previews. All course data lives
in `src/data/courses.ts`; there are no backend calls, uploads, or persistence.

Routes are under `src/app/`, reusable primitives under `src/components/ui/`, and
the list/detail implementation under `src/features/courses/`. Course details are
nested in the Courses stack so the tab bar remains visible.

## Manual checks

- Open the app: four courses, 14 credits, three review fields across two courses.
- Search for a course code or title, clear the query, and try a nonmatching query.
- Select the review banner: only MATH 201 and ENG 210 remain. Show all courses
  restores the list. Search and review filters can be combined.
- Open each course: the correct schedule, credits, and review fields appear.
  Back returns to the list with filters preserved.
- Open Upload a syllabus, then return. This milestone does not select a file.
- Visit each tab and return to Courses. Check a narrow viewport and larger text.
- Directly open `/courses/1` and an unknown course ID; both offer a path
  back to Courses.

Run `npm run lint` and `npx tsc --noEmit` for static checks.

## Validation

TypeScript and lint on milestone files pass. Browser interaction checks cover
search, empty results, review filtering, navigation, preserved filters on back,
all tabs, upload, unknown course IDs, and direct links. Visible local assets load
at their Figma dimensions at 320, 402, and 768 px viewport widths. iOS, Android,
and web exports compile; native device behavior still needs a device check.

Full-project lint currently reports one pre-existing `react-hooks/set-state-in-effect`
error in `src/hooks/use-color-scheme.web.ts:11`. The starter hook is unchanged.
