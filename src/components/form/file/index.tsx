import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react'

import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import CloseIcon from '@mui/icons-material/Close'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'

import { ACCEPTED_FILE_TYPES, IMAGE_TYPES, DOCUMENT_TYPES } from './constants'
import FileRow from './fileRow'
import FilesForUpload from './filesForUpload'
import { useAppContext } from '../../../hoc/hooks'
import { Intl } from '../../../utils/intl'
import { onlyText } from '../../../utils/intlHelpers'

import type { BuildInputProps } from '../sharedTypes'
import type { FileProp } from './sharedTypes'

type FileInputProps = BuildInputProps['inputProps'] & {
  imageUrls?: string[]
  onRemoveImage?: (url: string) => void
}

interface SharedUploadFilesProps extends Omit<BuildInputProps, 'inputProps'> {
  inputProps: FileInputProps
  /** Files that already exist on the server. They are rendered as downloadable rows. */
  uploadedFiles?: FileProp[]
  /** Hides the upload button and max-size hint while keeping both file lists visible. */
  disableUpload?: boolean
}

/**
 * File-upload field for the reactive-shared form system.
 *
 * Renders a localized upload button, checks the selected files against
 * `maxSize` and `fileType`, lists the files waiting to be uploaded (with a
 * remove action) and, optionally, files that have already been uploaded.
 *
 * The selection is reported to react-hook-form through
 * `renderProps.field.onChange` as a `File[]`, so the form value is always an
 * array, even when `multiple` is `false`.
 *
 * Must be rendered inside `<AppProvider>` (snackbar/app context). Rendering
 * `uploadedFiles` entries without a URL require `initApi`, because `FileRow`
 * fetches them from `GET files/file/:id`.
 *
 * @example
 * ```tsx
 * const inputsFormConfig: InputsFormConfigProps = {
 *   attachments: {
 *     type: 'file',
 *     name: 'attachments',
 *     label: 'Attachments',
 *     fileType: 'DOCUMENTS',
 *     multiple: true,
 *     maxSize: 10 * 1024 * 1024
 *   }
 * }
 *
 * <CreateForm inputsFormConfig={inputsFormConfig} onSubmit={onSubmit} />
 * ```
 *
 * @see ./README.md for the full API, translation keys and additional usage examples.
 */
export const SharedUploadFiles = ({
  renderProps,
  inputProps: { imageUrls = [], onRemoveImage, ...inputProps },
  uploadedFiles = [],
  disableUpload = false
}: SharedUploadFilesProps) => {
  const {
    multiple = false,
    maxSize = 5 * 1024 * 1024,
    fileType = ACCEPTED_FILE_TYPES.IMAGES as keyof typeof ACCEPTED_FILE_TYPES
  } = inputProps || {}

  const idRef = useRef<string>('')
  if (!idRef.current) {
    idRef.current = `upload-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`
  }
  const id = idRef.current

  const [files, setFiles] = React.useState<File[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<string[]>([])

  const { setSnackBarMessage } = useAppContext()

  const { accept, langKey } = useMemo(() => {
    let accept = ''
    let langKey = ''

    switch (fileType) {
      case ACCEPTED_FILE_TYPES.IMAGES:
        accept = Object.values(IMAGE_TYPES).join(',')
        langKey = 'FILE.LABEL.IMAGE' + (multiple ? 'S' : '')
        break
      case ACCEPTED_FILE_TYPES.DOCUMENTS:
        accept = Object.values(DOCUMENT_TYPES).join(',')
        langKey = 'FILE.LABEL.DOCUMENT' + (multiple ? 'S' : '')
        break
      case ACCEPTED_FILE_TYPES.ALL:
        accept = Object.values(DOCUMENT_TYPES).join(',') + ',' + Object.values(IMAGE_TYPES).join(',')
        langKey = 'FILE.LABEL.FILE' + (multiple ? 'S' : '')
        break
    }
    return { accept, langKey }
  }, [fileType, multiple])

  const handleSetFiles = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).every(file => {
      if (file.size > maxSize) {
        setSnackBarMessage({
          message: onlyText('FORM.ERROR.FILE_SIZE', { size: maxSize / 1024 / 1024 }),
          severity: 'error'
        })
        return false
      }
      if (!accept.split(',').some(type => file.type === type || file.name.endsWith(type))) {
        setSnackBarMessage({
          message: onlyText('FORM.ERROR.FILE_TYPE'),
          severity: 'error'
        })
        return false
      }
      return true
    })

    setFiles(prevFiles => ([...prevFiles, ...Array.from(files)]))
  }, [accept, maxSize, setSnackBarMessage])

  const handleRemoveFile = useCallback((idx: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== idx))
  }, [])

  useEffect(() => {
    renderProps?.field?.onChange?.(files)
  }, [files]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {!disableUpload && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Intl langKey={langKey} variant="h6" color="primary" sx={{ fontStyle: 'italic', mr: 2 }} />
          <Box sx={{ mr: 2 }}>
            <input
              accept={accept}
              multiple={multiple}
              style={{ display: 'none' }}
              id={`button-file-${id}`}
              type="file"
              onChange={handleSetFiles}
            />
            <label htmlFor={`button-file-${id}`}>
              <IconButton color="primary" component="span" size="small" >
                <CloudUploadIcon />
              </IconButton>
            </label>
          </Box>
          <Intl
            sx={{ ml: 2, fontSize: '10px', fontStyle: 'italic' }}
            langKey="FILE.LABEL.MAX_SIZE"
            variant="body2"
            color="textSecondary"
            replace={{ size: (maxSize / 1024 / 1024).toFixed(0) }}
          />
        </Box>
      )}
      {!!files?.length && (
        <>
          <Intl langKey='FORM.LABEL.FILES_FOR_UPLOAD' variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }} />
          <FilesForUpload files={files} onRemoveFile={handleRemoveFile} />
        </>
      )}
      {!!(uploadedFiles.length || imageUrls.length) && (
        <>
          <Intl langKey='FORM.LABEL.FILES_UPLOADED' variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }} />
          {uploadedFiles.map((file, index) => (
            <FileRow key={`uploaded-file-${index}`} file={file} />
          ))}
          {!!imageUrls.length && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {imageUrls.map((url, index) => (
                <Box
                  key={`${url}-${index}`}
                  sx={{
                    position: 'relative',
                    '&:hover .image-delete-button, &:focus-within .image-delete-button': {
                      opacity: 1
                    }
                  }}
                >
                  <Paper elevation={2} sx={{ display: 'inline-flex', overflow: 'hidden' }}>
                    <Avatar
                      src={failedImages.includes(url) ? undefined : url}
                      alt={`Uploaded image ${index + 1}`}
                      variant="square"
                      slotProps={{ img: { loading: 'lazy' } }}
                      onClick={() => !failedImages.includes(url) && setPreviewImage(url)}
                      onError={() => setFailedImages(prev => prev.includes(url) ? prev : [...prev, url])}
                      sx={{
                        width: 64,
                        height: 64,
                        cursor: failedImages.includes(url) ? 'default' : 'zoom-in',
                        '& img': { objectFit: 'cover' }
                      }}
                    >
                      <BrokenImageIcon color="disabled" />
                    </Avatar>
                  </Paper>
                  {onRemoveImage && (
                    <IconButton
                      aria-label={`Remove uploaded image ${index + 1}`}
                      className="image-delete-button"
                      color="error"
                      size="small"
                      onClick={() => onRemoveImage(url)}
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        zIndex: 1,
                        opacity: 0.5,
                        transition: 'opacity 150ms ease-in-out',
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        fullScreen
        slotProps={{ paper: { sx: { bgcolor: 'rgba(0, 0, 0, 0.95)' } } }}
      >
        <IconButton
          aria-label="Close image preview"
          onClick={() => setPreviewImage(null)}
          sx={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1, color: 'black', fontSize: 34 }}
        >
          <CloseIcon />
        </IconButton>
        {previewImage && (
          <Box
            component="img"
            src={previewImage}
            alt="Full screen image preview"
            loading="eager"
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </Dialog>
    </Box>
  )
}

export default SharedUploadFiles
