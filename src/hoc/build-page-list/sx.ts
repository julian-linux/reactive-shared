import { SxProps } from '@mui/system'

export const sxCloseDialogButton: SxProps = {
  position: 'absolute',
  right: 8,
  top: 8,
  color: (theme: any) => theme.palette.grey[500]
}

export const sxDialogPrint: SxProps = {
  '@media print': {
    '& .MuiDialog-paper': {
      margin: '0 !important',
      padding: '0 !important',
      maxWidth: 'none !important',
      maxHeight: 'none !important',
      width: '100% !important',
      height: '100% !important',
      borderRadius: '0 !important',
      boxShadow: 'none !important'
    },
    '& .MuiDialogContent-root': {
      margin: '0 !important',
      padding: '0 !important'
    },
    '& .MuiDialogTitle-root': {
      margin: '0 !important',
      padding: '0 !important'
    },
    '& .MuiDialogActions-root': {
      margin: '0 !important',
      padding: '0 !important'
    }
  }
}

