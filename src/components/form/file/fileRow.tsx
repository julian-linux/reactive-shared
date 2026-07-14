import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'

import { useQuery, useMutation } from '@tanstack/react-query'

import FileAvatar from './avatar'
import { isImageType } from './constants'
import { api } from '../../../utils/api'
import { Loading } from '../../loading'

import type { FileProp } from './sharedTypes'

const fetchImageBlob = async (file: FileProp): Promise<string> => {
  const response = await api.get(`files/file/${file.id}`, {
    responseType: 'blob',
    headers: {
      Accept: file.content_type
    }
  })
  return URL.createObjectURL(new Blob([response as unknown as BlobPart], { type: file.content_type }))
}

interface FileRowProps {
  file: FileProp
}

const FileRow = ({ file }: FileRowProps) => {
  const isImage = isImageType(file.content_type)

  const { data: imageUrl, isLoading } = useQuery({
    queryKey: [file.type, file.id],
    queryFn: () => fetchImageBlob(file),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: isImage
  })

  const { mutateAsync: getFile } = useMutation({
    mutationFn: () => api.get(`files/file/${file.id}`)
  })

  const handleDownloadFile = async () => {
    const link = document.createElement('a')
    link.download = file.name
    if (isImage) {
      link.href = imageUrl || ''
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    const fileBlob = await getFile()

    const url = URL.createObjectURL(new Blob([fileBlob as unknown as BlobPart], { type: file.content_type }))
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
          <Loading backdrop={false} />
        </Box>
      </ListItem>
    )
  }

  return (
    <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ mr: 1 }}>
        <FileAvatar file={file} imageUrl={imageUrl || ''} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
        <Button onClick={handleDownloadFile}>
          <Typography variant="caption" color="primary">{file.name}</Typography>
          <Typography variant="caption">{`${(file.size / 1024).toFixed(2)} Kb`}</Typography>
        </Button>
      </Box>
    </ListItem>
  )
}

export default FileRow
