# PDF selection

From Courses, tap **Upload a syllabus** to open the system file picker. Select
one PDF to open the upload screen with its filename and size. That screen also
supports choosing a replacement or removing the selection. Opening `/upload`
directly shows a **Choose PDF** button.

The selected asset stays available while navigating during the current app
session. Unsaved selections and drafts reset when the app restarts. No PDF is
sent to a server or processed for its contents.

## Simulated extraction

After selecting a PDF, tap **Extract course details**. A six-second simulation
shows **Uploading syllabus → Reading syllabus → Extracting details**, then
displays sample course information, important dates, and materials. Two sample
fields are highlighted as needing review. Every PDF produces the same sample
result; no information is extracted from the actual PDF.

The workflow lives above the route screens, so returning to Courses keeps it
running. A status card reopens the progress or results. If the app is briefly
backgrounded, the next timer tick catches up using elapsed time. Closing the
app completely resets the session.

**Cancel extraction** keeps the PDF selected and lets you retry. Replacement
and removal are disabled during processing. Choosing a replacement after
completion clears the old result; canceling the picker keeps it.

## Review and save

Edit the course, professor, schedule, office hours, dates, and materials in the
review form. Each date or material can be excluded. Highlighted items require
confirmation if included; editing a highlighted item requires confirming it
again. Missing event times can remain blank to save a date-only event.

**Confirm and add course** validates required fields, email, credits, time
ranges, real calendar dates, and optional event times. The course, professor,
office hours, included dates, and included materials save in one SQLite
transaction. A duplicate course code within the same semester is rejected.
Failures preserve the draft for correction or retry.

**Confirm and add course** returns directly to Courses after a successful save.
Validation or save failures stay on the review form. Saved courses remain after
restarting the app. Accepted dates appear in Calendar,
accepted resources in Materials, and both appear in the course details. Courses
offers semester selection when more than one semester exists. Imported mock
courses and resources are marked as sample data.

On iOS and Android, saving copies the PDF into app document storage; **Open or
share PDF** in the saved course opens the system sharing sheet. Web saves the
course data but does not retain the PDF across sessions. Failed database saves
attempt to remove the copied PDF. No backend, OCR, extraction service, external
calendar sync, or notification scheduling is involved.

## Device checks

- Tap **Upload a syllabus**: the file picker opens directly and filters for PDFs.
- Select a PDF: its filename and size appear on the upload screen.
- Cancel selection: stay on Courses without showing an error.
- Choose a different PDF: replace the displayed file. Canceling keeps the old file.
- Remove the PDF: return to the empty selection state; choose another PDF.
- Return to Courses and select another file: show the new selection.
- Open `/upload` without a selection: **Choose PDF** opens the picker.
- Try an empty PDF or a non-PDF (if the provider allows it): show an error and
  preserve the previous selection.
- On web, cancel and retry: the picker can be opened again.
- Extract details: watch all three stages, then verify the three result groups.
- Return to Courses during processing: reopen from **View progress**; when
  complete, reopen from **View extracted details**.
- Cancel midway and wait longer than six seconds: results must not appear.
  Restart extraction and verify it begins at the first stage.
- Try rapidly tapping **Extract course details**: it should start only once.
- After completion, replace or remove the PDF: old results must disappear.
- Relaunch the app: the selected file and simulated results reset.
- Edit a course title and schedule, confirm the highlighted date, exclude the
  textbook, and save: verify the edited course, three dates, and one resource.
- Attempt saving without resolving highlighted items: remain on the form with
  an error. Invalid dates, email, credits, or time ranges should also block save.
- Save the same course code/semester again: show a duplicate error and retain
  the draft. Change the code and retry successfully.
- Return to Courses during review and reopen it: edits should remain.
- View the saved course and check Calendar and Materials. Relaunch: saved data
  must still exist and the transient processing card must be gone.
- On a physical mobile device, reopen or share the original PDF after relaunch.
- At the bottom of a course, tap **Delete course**. Cancel the confirmation:
  the course and its data must remain. Confirm deletion: return to Courses,
  with its dates and materials removed from their tabs as well.
- Delete an imported course: its retained PDF should be removed. Deleting the
  last course in a semester should leave an empty semester after relaunch,
  without restoring the sample courses.

The Expo modules used here are included in Expo Go. Existing custom development
builds need rebuilding after native dependencies are added.
