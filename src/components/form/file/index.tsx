import React, { useCallback, useRef, useMemo, useEffect } from 'react'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

import { ACCEPTED_FILE_TYPES, IMAGE_TYPES, DOCUMENT_TYPES } from './constants'
import FileRow from './fileRow'
import FilesForUpload from './filesForUpload'
import { useAppContext } from '../../../hoc/hooks'
import { Intl } from '../../../utils/intl'
import { onlyText } from '../../../utils/intlHelpers'

import type { BuildInputProps } from '../sharedTypes'
import type { FileProp } from './sharedTypes'

interface SharedUploadFilesProps extends BuildInputProps {
  uploadedFiles?: FileProp[]
  disableUpload?: boolean
}

export const SharedUploadFiles = ({
  renderProps,
  inputProps,
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
  }, [files, renderProps?.field])

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
      {!!uploadedFiles?.length && (
        <>
          <Intl langKey='FORM.LABEL.FILES_UPLOADED' variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }} />
          {uploadedFiles.map((file, index) => (
            <FileRow key={`uploaded-file-${index}`} file={file} />
          ))}
        </>
      )}
    </Box>
  )
}

export default SharedUploadFiles
