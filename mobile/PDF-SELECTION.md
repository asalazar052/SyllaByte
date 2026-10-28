# PDF selection

From Courses, tap **Upload a syllabus** to open the system file picker. Select
one PDF to open the upload screen with its filename and size. That screen also
supports choosing a replacement or removing the selection. Opening `/upload`
directly shows a **Choose PDF** button.

The selected asset stays available while navigating during the current app
session. Native files are copied into the app cache so a future upload can read
them. Selection is not saved across app restarts, sent to a server, or processed
into a course yet.

## Simulated extraction

After selecting a PDF, tap **Extract course details**. A six-second simulation
shows **Uploading syllabus → Reading syllabus → Extracting details**, then
displays sample course information, important dates, and materials. Two sample
fields are highlighted as needing review. Every PDF produces the same sample
result; the PDF contents are never read or sent anywhere.

The workflow lives above the route screens, so returning to Courses keeps it
running. A status card reopens the progress or results. If the app is briefly
backgrounded, the next timer tick catches up using elapsed time. Closing the
app completely resets the session.

**Cancel extraction** keeps the PDF selected and lets you retry. Replacement
and removal are disabled during processing. Choosing a replacement after
completion clears the old result; canceling the picker keeps it. Results are a
read-only preview: editing, confirmation, and saving a course are future work.

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

`expo-document-picker` is included in Expo Go. Existing custom development
builds need rebuilding after this dependency is added.
