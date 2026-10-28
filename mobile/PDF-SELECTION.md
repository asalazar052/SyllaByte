# PDF selection

From Courses, tap **Upload a syllabus** to open the system file picker. Select
one PDF to open the upload screen with its filename and size. That screen also
supports choosing a replacement or removing the selection. Opening `/upload`
directly shows a **Choose PDF** button.

The selected asset stays available while navigating during the current app
session. Native files are copied into the app cache so a future upload can read
them. Selection is not saved across app restarts, sent to a server, or processed
into a course yet.

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

`expo-document-picker` is included in Expo Go. Existing custom development
builds need rebuilding after this dependency is added.
