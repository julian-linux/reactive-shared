// Libraries
import React from 'react'

// Material components
import MaterialDialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'

// Icons
import CloseIcon from '@mui/icons-material/Close'

// Shared
import { onlyText } from '../utils/intl'

interface SharedDialogProps extends DialogProps {
  children: any
  onClose?: () => void
  open: boolean
  title: string
}

const SharedDialog: React.FC<SharedDialogProps> = ({ children, onClose, open, title, ...modalProps }) => {
  return (
    <MaterialDialog {...modalProps} onClose={onClose} open={open}>
      <DialogTitle>
        {onlyText(title)}

        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'black',
            displayPrint: 'none'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {children}
      </DialogContent>
    </MaterialDialog>
  )
}

export const Dialog = React.memo(SharedDialog)
