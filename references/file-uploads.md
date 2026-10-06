# File Uploads & Drag-and-Drop UX

Defaults only: when the project's `DESIGN.md` or existing upload primitives decide something differently, they win (`design-md.md`).

File handling in web browsers touches multiple fragile browser APIs (`DataTransfer`, `<input type="file">`, `Blob`, `URL.createObjectURL`, `FileReader`, `XMLHttpRequest` / `fetch` with `AbortController`). Every rule here is a strict law of the book: deterministic, falsifiable, and auditable against concrete code signals.

## Contents
1. Global dropzone safety & window containment (UPL-01)
2. File input re-selection lifecycle (UPL-02)
3. Object URL preview memory leaks (UPL-03)
4. Upfront constraints & format signifiers (UPL-04)
5. Multi-file batch recovery & per-item status (UPL-05)
6. Upload progress, byte metrics & cancellation (UPL-06)
7. Audit checklist

---

## 1. Global dropzone safety & window containment (UPL-01)

### The Law
In any view featuring a drag-and-drop file upload zone, `window` or `document` MUST listen for `dragover` and `drop` events and invoke `e.preventDefault()`.

When a user drags a file from their desktop and accidentally misses the designated drop target (or drops outside the dropzone), default browser behavior is to navigate the current tab to `file://...` or open the raw file directly. This instantly destroys the current form, unloads the single-page application, and permanently loses all user work.

### Code signal & violation
```tsx
// VIOLATION: Drop events only handled on local div; dropping outside navigates the tab away
<div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
  Drop files here
</div>

// PASS: Window-level drop containment in the mounting effect or component
useEffect(() => {
  const preventGlobalDrop = (e: DragEvent) => {
    e.preventDefault();
  };
  window.addEventListener('dragover', preventGlobalDrop);
  window.addEventListener('drop', preventGlobalDrop);
  return () => {
    window.removeEventListener('dragover', preventGlobalDrop);
    window.removeEventListener('drop', preventGlobalDrop);
  };
}, []);
```

---

## 2. File input re-selection lifecycle (UPL-02)

### The Law
After a file is chosen, staged, uploaded, or rejected, the underlying `<input type="file">` element MUST immediately clear its value (`e.target.value = ''`).

If `input.value` is not reset, selecting the exact same file again (e.g. after the user corrected a validation error, deleted the uploaded file from the staging list, or re-exported a document with the same filename) will NOT fire the browser's `onChange` event, leaving the user with an unresponsive, broken button.

### Code signal & violation
```tsx
// VIOLATION: e.target.value is not cleared; re-selecting same file fails silently
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) onSelect(file);
};

// PASS: Reset value so re-selection always fires onChange
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) onSelect(file);
  e.target.value = ''; // Guaranteed re-selection trigger
};
```

---

## 3. Object URL preview memory leaks (UPL-03)

### The Law
Any client-side file preview generated using `URL.createObjectURL(file)` MUST be explicitly revoked via `URL.revokeObjectURL(url)` when:
1. The previewed file is replaced or removed.
2. The component displaying the preview unmounts.

Failing to revoke object URLs causes memory leaks that degrade performance during prolonged sessions with high-resolution images or PDF documents.

### Code signal & violation
```tsx
// VIOLATION: URL created in render or effect without revocation on unmount/change
const [previewUrl, setPreviewUrl] = useState('');
useEffect(() => {
  if (file) setPreviewUrl(URL.createObjectURL(file));
}, [file]);

// PASS: Object URL cleaned up in effect destructor
useEffect(() => {
  if (!file) {
    setPreviewUrl(null);
    return;
  }
  const url = URL.createObjectURL(file);
  setPreviewUrl(url);
  return () => {
    URL.revokeObjectURL(url);
  };
}, [file]);
```

---

## 4. Upfront constraints & format signifiers (UPL-04)

### The Law
A dropzone, upload card, or file picker MUST visibly display accepted file formats (file extensions and MIME types) and maximum file size limits directly in its resting state UI (e.g. *"PDF, DOCX, PNG up to 25 MB"*).

Hiding size and format restrictions until a server 413 Payload Too Large error or client rejection occurs forces users into blind trial-and-error.

---

## 5. Multi-file batch recovery & per-item status (UPL-05)

### The Law
When supporting multi-file uploads:
1. The UI MUST display per-file progress status (queued, uploading, complete, failed).
2. If one file in a batch fails (e.g. size exceeded or network timeout), the application MUST NOT abort the entire batch or fail silently.
3. The failed item MUST be isolated in the staging list with a clear error badge, an individual retry button, and a remove button.

---

## 6. Upload progress, byte metrics & cancellation (UPL-06)

### The Law
File uploads that can exceed 1 MB:
- MUST NOT display a bare indeterminate spinner.
- MUST display a determinate progress bar with percentage or transmitted byte metrics (`14.2 MB / 25.0 MB (56%)`).
- MUST provide an explicit Cancel / Abort button tied to an `AbortController` signal, allowing users to stop slow or mistaken uploads.

---

## 7. Audit checklist

- [ ] `UPL-01`: Window/document suppresses uncontained file drop navigation with `e.preventDefault()`.
- [ ] `UPL-02`: File input clears `e.target.value = ''` so re-selecting the same file fires `onChange`.
- [ ] `UPL-03`: `URL.createObjectURL()` previews are revoked with `URL.revokeObjectURL()` in cleanup effects.
- [ ] `UPL-04`: Resting upload UI states accepted extensions and maximum file size limits upfront.
- [ ] `UPL-05`: Multi-file uploads show per-file status; failures allow individual retry without batch loss.
- [ ] `UPL-06`: Uploads >1 MB have determinate progress percentage/bytes and an active Abort button.
