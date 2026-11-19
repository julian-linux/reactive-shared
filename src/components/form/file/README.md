# `SharedUploadFiles`

File-upload field for the `reactive-shared` form system.

It renders a localized upload button, validates the selected files against
`maxSize` and `fileType`, lists the files waiting to be uploaded (with a remove
action) and, optionally, lists files that have already been uploaded.

The selected files are reported to `react-hook-form` through
`renderProps.field.onChange` as a `File[]`. **The form value is always an array,
even when `multiple` is `false`.**

---

## Import

```tsx
import { SharedUploadFiles } from 'reactive-shared'
```

When working inside this repository:

```tsx
import SharedUploadFiles from 'src/components/form/file'
```

---

## Quick start (recommended: through the form builder)

Add an entry with `type: 'file'` to `inputsFormConfig`. `CreateForm` (and
therefore `BuildPageForm`) routes `type: 'file'` to `SharedUploadFiles`
automatically through `BuildInput`.

```tsx
import { CreateForm } from 'reactive-shared'
import type { InputsFormConfigProps } from 'reactive-shared'
import * as yup from 'yup'

const inputsFormConfig: InputsFormConfigProps = {
  attachments: {
    type: 'file',
    name: 'attachments',
    label: 'Attachments',
    fileType: 'DOCUMENTS',
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10 MB
    yupValidation: yup.array().min(1, 'At least one file is required')
  }
}

const handleSubmit = async (formData: { [key: string]: any }) => {
  // formData.attachments is File[]
  const files = (formData.attachments ?? []) as File[]

  const body = new FormData()
  files.forEach(file => body.append('attachments', file))

  await api.post('/files', body, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

<CreateForm
  inputsFormConfig={inputsFormConfig}
  confirmButtonLangkey="GENERAL.SAVE"
  onSubmit={handleSubmit}
/>
```

When submitting through a generated `useMutation` hook, file-valued params are
converted to `FormData` automatically. This includes the `File[]` value produced
by the file field, so you can pass the complete form values to `mutate`:

```tsx
beforeMutate: (formData, mutate) => mutate(formData)
```

If params contain no files, the request continues to use JSON. If any file is
present, the request uses multipart; scalar fields are stringified and arrays
or objects without files are JSON-serialized. Existing explicit `FormData`
values are also supported. When calling Axios directly (as in the example
above), create the `FormData` yourself.

### With `BuildPageForm`

```tsx
<BuildPageForm
  entity="DOCUMENT"
  buildFormProps={{ inputsFormConfig }}
  actions={{
    useMutate,
    afterMutate,
    beforeMutate: (formData, mutate) => mutate(formData)
  }}
/>
```

---

## Direct usage with `react-hook-form`

Use this when you need `uploadedFiles`, `disableUpload`, or full control over
the field.

```tsx
import { Controller, useForm } from 'react-hook-form'
import { SharedUploadFiles } from 'reactive-shared'

type FileProp = {
  id: string
  name: string
  size: number
  content_type: string
  type: string
}

const existingFiles: FileProp[] = []
const readOnly = false

const { control } = useForm<{ documents: File[] }>({
  defaultValues: { documents: [] }
})

<Controller
  name="documents"
  control={control}
  render={(renderProps) => (
    <SharedUploadFiles
      renderProps={renderProps}
      inputProps={{
        type: 'file',
        name: 'documents',
        label: 'Documents',
        fileType: 'DOCUMENTS',
        multiple: true,
        maxSize: 10 * 1024 * 1024
      }}
      uploadedFiles={existingFiles}
      disableUpload={readOnly}
    />
  )}
/>
```

---

## Props

### `SharedUploadFilesProps`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `renderProps` | `RenderProps` | — | Required. Provided by `Controller`/`BuildInput`. The component calls `renderProps.field.onChange(files)` when the selection changes. |
| `inputProps` | `InputProps` | — | Required. Field configuration. Only `multiple`, `maxSize` and `fileType` are read by this component. |
| `uploadedFiles` | `FileProp[]` | `[]` | Files that already exist on the server. Rendered as downloadable rows via `FileRow`. |
| `disableUpload` | `boolean` | `false` | Hides the upload button and max-size hint while keeping both file lists visible. |
| `useFormProps` | `any` | — | Inherited from `BuildInputProps`; not used by this component. |

### `inputProps` fields used

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | Allows selecting more than one file at a time and switches the title to its plural translation key. |
| `maxSize` | `number` | `5 * 1024 * 1024` (5 MB) | Maximum file size in **bytes**. |
| `fileType` | `'IMAGES' \| 'DOCUMENTS' \| 'ALL'` | `'IMAGES'` | Controls the accepted MIME types and the title translation key. |
| `imageUrls` | `string[]` | `[]` | Image URLs rendered as thumbnails in the uploaded-files section. |
| `onRemoveImage` | `(url: string) => void` | — | Called when the delete button on an image thumbnail is clicked. |

`onRemoveImage` is passed through `inputProps`. It receives the URL of the
thumbnail that was clicked; update `imageUrls` in the parent to remove that
thumbnail. The component does not modify the URL array itself.

```tsx
const [imageUrls, setImageUrls] = useState(initialImageUrls)

<SharedUploadFiles
  renderProps={renderProps}
  inputProps={{
    ...inputProps,
    imageUrls,
    onRemoveImage: (url) => {
      setImageUrls(currentUrls => currentUrls.filter(imageUrl => imageUrl !== url))
    }
  }}
/>
```

The delete button appears only when `onRemoveImage` is provided. It is partially
visible by default and becomes fully visible when the thumbnail is hovered or
focused.

All other `InputProps` fields (`accept`, `value`, `defaultValue`, `disabled`,
`onChange`, etc.) are **ignored** by this component. The `accept` attribute is
computed from `fileType`; use `disableUpload` to make the field read-only.

### `FileProp`

Used by `uploadedFiles`. Its shape is:

```ts
type FileProp = {
  id: string          // server file id
  name: string        // display name
  size: number        // bytes
  content_type: string // MIME type, e.g. "image/png"
  type: string        // file category used as part of the query key
  url?: string        // optional URL used directly to display an uploaded image
}
```

Uploaded images with a `url` are displayed from that URL. If an image has no
`url`, it continues to be loaded from `GET files/file/:id`. Non-image files
continue to use the existing file endpoint.

> `FileProp` is currently declared in `./sharedTypes.ts` and is not
> re-exported from the package root. Define it locally in external apps or
> import it from the internal path when working inside this repository.

---

## Accepted file types

`fileType` maps to the MIME types declared in `./constants.ts`:

| `fileType` | Accepted types |
| --- | --- |
| `IMAGES` | `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/tiff` |
| `DOCUMENTS` | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, `application/rtf`, `application/vnd.oasis.opendocument.text`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/csv`, `application/vnd.oasis.opendocument.spreadsheet` |
| `ALL` | All image and document types above |

---

## Working with existing files

`uploadedFiles` and `disableUpload` are **top-level props** of
`SharedUploadFiles`. `BuildInput` only forwards `renderProps`, `inputProps` and
`useFormProps`, so these two props are **not** passed when the field is
configured declaratively through `CreateForm`/`BuildPageForm`.

If you need them with the form builder, use a small wrapper and register the
field with `type: 'component'`:

```tsx
import { SharedUploadFiles } from 'reactive-shared'
import type { BuildInputProps } from 'reactive-shared'

type FileProp = {
  id: string
  name: string
  size: number
  content_type: string
  type: string
}

const UploadWithExisting = ({ renderProps, inputProps }: BuildInputProps) => (
  <SharedUploadFiles
    renderProps={renderProps}
    inputProps={inputProps}
    uploadedFiles={(inputProps.uploadedFiles ?? []) as FileProp[]}
    disableUpload={Boolean(inputProps.disableUpload)}
  />
)

const inputsFormConfig: InputsFormConfigProps = {
  attachments: {
    type: 'component',
    name: 'attachments',
    label: 'Attachments',
    component: UploadWithExisting,
    // Extra fields are allowed by InputProps' index signature
    uploadedFiles: existingFiles,
    disableUpload: true,
    fileType: 'DOCUMENTS',
    multiple: true
  }
}
```

Alternatively, render the component directly with `Controller` (see above).

> Existing files are **not** hydrated from `value`/`defaultValue`. The
> component ignores those props, so use `uploadedFiles` if you need to show
> files that are already stored on the server.

---

## Required translation keys

The component uses `Intl` / `onlyText`, so these keys must exist in the
translations initialized with `initLangCode`:

| Key | Used for | Placeholders |
| --- | --- | --- |
| `FILE.LABEL.IMAGE` | Title for a single image | — |
| `FILE.LABEL.IMAGES` | Title for multiple images | — |
| `FILE.LABEL.DOCUMENT` | Title for a single document | — |
| `FILE.LABEL.DOCUMENTS` | Title for multiple documents | — |
| `FILE.LABEL.FILE` | Title for a single file (`ALL`) | — |
| `FILE.LABEL.FILES` | Title for multiple files (`ALL`) | — |
| `FILE.LABEL.MAX_SIZE` | Max-size hint next to the button | `${size}` (MB) |
| `FORM.LABEL.FILES_FOR_UPLOAD` | Label above the pending files list | — |
| `FORM.LABEL.FILES_UPLOADED` | Label above the already-uploaded list | — |
| `FORM.ERROR.FILE_SIZE` | Snackbar shown when a file is too large | `${size}` (MB) |
| `FORM.ERROR.FILE_TYPE` | Snackbar shown for an unsupported type | — |

When a key is missing, `onlyText` renders `##KEY##`, so missing translations
are easy to spot.

---

## Runtime requirements

- Must be rendered inside `<AppProvider>`: the component uses
  `useAppContext()` for the snackbar, and `uploadedFiles` uses
  `@tanstack/react-query`.
- Uploaded files without a `url` require `initApi` because `FileRow` fetches
  them from `GET files/file/:id`.
- Translations must be initialized with `initLangCode` (see above).

---

## Behavior notes and caveats

1. **The value is always `File[]`**, even when `multiple={false}`. Read
   `formData[name][0]` for a single-file field.
2. **`onChange([])` fires on mount** because the component reports its state in
   an effect. Initialise the field accordingly when using `defaultValues`.
3. **Size/type errors only show a snackbar.** The current implementation calls
   `Array.from(files).every(...)` to validate, but the result is not used to
   filter the selection, so all chosen files are still appended to the pending
   list. Enforce hard rejection in `onSubmit`/`beforeMutate` if required.
4. **`multiple={false}` does not prevent multiple additions.** Each new
   selection is appended to the existing list; the component does not replace
   the previous file.
5. **The native file input is not reset after a selection.** Choosing the same
   file twice in a row may not fire `change` again.
6. **`accept` is computed from `fileType`.** Passing `accept` in `inputProps`
   has no effect.
7. **`uploadedFiles` / `disableUpload` are not forwarded by `BuildInput`.**
   Use direct `Controller` usage or the `type: 'component'` wrapper shown above.

---

## Related files

| File | Responsibility |
| --- | --- |
| `index.tsx` | Main `SharedUploadFiles` field: upload button, validation, lists. |
| `filesForUpload.tsx` | Renders pending `File[]` rows with a remove button. |
| `fileRow.tsx` | Renders an already-uploaded `FileProp` with download support. |
| `avatar.tsx` | Renders an image thumbnail or a generic file icon. |
| `constants.ts` | `ACCEPTED_FILE_TYPES`, `IMAGE_TYPES`, `DOCUMENT_TYPES`, `isImageType`, `isDocumentType`. |
| `sharedTypes.ts` | `FileProp`. |
