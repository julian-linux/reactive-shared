import { memo, useState, useEffect } from 'react'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import Avatar from '@mui/material/Avatar'

import { isImageType } from './constants'

import type { FileProp } from './sharedTypes'

interface FileAvatarProps {
  file: File | FileProp
  imageUrl?: string
}

const FileAvatar = ({ file, imageUrl }: FileAvatarProps) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const contentType =
    'content_type' in file
      ? (file as FileProp).content_type
      : (file as File).type
  const isImage = isImageType(contentType)

  useEffect(() => {
    // Clear previous blob URL
    setBlobUrl(null)

    // If imageUrl is provided, use it
    if (imageUrl) {
      setBlobUrl(imageUrl)
      return
    }

    // Check if it's actually a File object (which extends Blob)
    if (file instanceof File || file instanceof Blob) {
      try {
        const url = URL.createObjectURL(file)
        setBlobUrl(url)

        // Cleanup function
        return () => {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('Error creating object URL:', error)
      }
    } else {
      console.warn('File is not a File or Blob object:', file)
    }
  }, [file, imageUrl])

  if (isImage && blobUrl) {
    return (
      <>
        <Avatar src={blobUrl} alt={file.name} variant="square" />
      </>
    )
  }

  return (
    <Avatar variant="square">
      <InsertDriveFileIcon />
    </Avatar>
  )
}

export default memo(FileAvatar)
