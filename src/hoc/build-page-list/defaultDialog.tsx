import React, { useCallback, useMemo, useState, useRef } from 'react'
import type { ReactElement } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { SxProps, Theme } from '@mui/system'

import { useNavigate } from 'react-router-dom'

import map from 'lodash/map'

import { sxCloseDialogButton, sxDialogPrint } from './sx'
import { Intl } from '../../utils'

export interface SelectedItemProps {
  id: string | number
  name: string
  [key: string]: any
}

export interface DialogOptionProps {
  icon: ReactElement
  text: ReactElement
  to?: string | ((selectedItem: SelectedItemProps) => void)
  onConfirm?: (selectedItem: SelectedItemProps) => void
  Component?: React.ComponentType<{ item: SelectedItemProps, onClose: () => void }>
  disabled?: boolean | ((selectedItem: SelectedItemProps) => boolean)
  shouldRender?: (selectedItem: SelectedItemProps) => boolean
  dialogTitle?: string | ((selectedItem: SelectedItemProps) => string)
  fullScreen?: boolean,
  onClick?: (selectedItem: SelectedItemProps) => void
}

export interface DialogOptionsProps {
  [key: string]: DialogOptionProps
}

interface DefaultDialogProps {
  title: string
  onClose: () => void
  options: DialogOptionsProps
  selectedItem: SelectedItemProps
  dialogFullScreen: boolean
  dialogProps?: { sx?: SxProps }
}

type HandleClickProps = (options: DialogOptionProps, key: string) => () => void

const DefaultDialogComponent: React.FC<DefaultDialogProps> = ({ options, title, onClose, selectedItem, dialogFullScreen, dialogProps }) => {
  const navigate = useNavigate()
  const [showRender, setShowRender] = useState('renderOptionList')
  const [selectedOption, setSelectedOption] = useState('')
  const actionToConfirm = useRef<any>(null)

  const fullScreen = dialogFullScreen || options?.[selectedOption]?.fullScreen || false

  const handleClick = useCallback<HandleClickProps>(({ to, onConfirm, Component }, key) => () => {
    setSelectedOption(key)

    if (typeof to === 'string' && to !== '') {
      navigate(`${to}/${selectedItem.id}`)
    } else if (typeof to === 'function') {
      to(selectedItem)
    }

    if (Component !== undefined) {
      setShowRender('renderItemComponent')
    }

    if (onConfirm !== undefined) {
      actionToConfirm.current = onConfirm
      setShowRender('renderConfirmBox')
    }
  }, [navigate, selectedItem])

  const handleConfirmClick = useCallback(async () => {
    if (typeof actionToConfirm.current === 'function') {
      await actionToConfirm.current(selectedItem)
    }
    onClose()
  }, [selectedItem, onClose])

  const renderOptionsList = useMemo(() => {
    return (
      <List>
        {map(options, (option, key) => {
          const shouldRender = typeof option.shouldRender === 'function' ? option.shouldRender(selectedItem) : true
          const disabled = typeof option.disabled === 'function' ? option.disabled(selectedItem) : option.disabled

          if (!shouldRender) return null

          const onClick = () => {
            if (typeof option.onClick === 'function') {
              option.onClick(selectedItem)
            } else {
              handleClick(option, key)()
            }
          }

          return (
            <ListItemButton key={key} divider onClick={onClick} disabled={disabled}>
              <ListItemAvatar>{option.icon}</ListItemAvatar>
              <ListItemText primary={option.text} />
            </ListItemButton>
          )
        }
        )}
      </List>
    )
  }, [options, selectedItem, handleClick])

  const renderConfirmBox = useMemo(() => {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 5 }}>
          <Intl langKey='GENERAL.CONFIRM_ACTION' variant='h6' />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setShowRender('renderOptionList')}
          >
            <Intl langKey='GENERAL.BACK' />
          </Button>

          <Button
            variant='contained'
            color='secondary'
            onClick={handleConfirmClick}
          >
            <Intl langKey='GENERAL.CONFIRM' />
          </Button>
        </Box>
      </Box>
    )
  }, [handleConfirmClick])

  const renderItemComponent = React.useMemo(() => {
    if (selectedOption === '') return null

    const Component = options[selectedOption]?.Component

    if (Component === undefined) return undefined

    return <Component item={selectedItem} onClose={onClose} />
  }, [options, selectedItem, selectedOption, onClose])

  const renderDialogTitle = useMemo(() => {
    const dialogTitle = options[selectedOption]?.dialogTitle

    if (!dialogTitle) return title

    if (typeof dialogTitle === 'function') return dialogTitle(selectedItem)

    return dialogTitle
  }, [title, options, selectedItem, selectedOption])

  const renderContent = useMemo(() => {
    switch (showRender) {
      case 'renderConfirmBox':
        return renderConfirmBox
      case 'renderItemComponent':
        return renderItemComponent
      default:
        return renderOptionsList
    }
  }, [showRender, renderConfirmBox, renderItemComponent, renderOptionsList])

  return (
    <Dialog
      aria-labelledby='product-dialog'
      fullWidth
      fullScreen={fullScreen}
      onClose={onClose}
      open
      sx={{ ...sxDialogPrint, ...dialogProps?.sx, border: '1px solid' } as SxProps<Theme>}
    >
      <DialogTitle id='default-dialog-title' sx={{ '@media print': { display: 'none' } }}>
        {renderDialogTitle}
        <IconButton sx={sxCloseDialogButton} aria-label='close' onClick={onClose}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ '@media print': { overflow: 'hidden', margin: '0 !important', padding: '0 !important' } }}>
        {renderContent}
      </DialogContent>
    </Dialog>

  )
}

export default React.memo(DefaultDialogComponent)
