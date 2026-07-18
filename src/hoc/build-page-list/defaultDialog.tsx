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
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import type { SxProps, Theme } from '@mui/system'

import { useNavigate } from 'react-router-dom'

import map from 'lodash/map'

import { sxCloseDialogButton, sxDialogPrint } from './sx'
import { Intl } from '../../utils'
import { formatToMoney } from '../../utils/utils'

export interface DialogOptionProps<T> {
  icon: ReactElement
  text: ReactElement
  to?: string | ((selectedItem: T) => void)
  onConfirm?: (selectedItem: T) => void
  Component?: React.ComponentType<{ item: T, onClose: () => void }>
  disabled?: boolean | ((selectedItem: T) => boolean)
  shouldRender?: (selectedItem: T) => boolean
  dialogTitle?: string | ((selectedItem: T) => string)
  fullScreen?: boolean,
  onClick?: (selectedItem: T) => void
}

export interface DialogOptionsProps<T> {
  [key: string]: DialogOptionProps<T>
}

export type PreviewProps<T> = Record<string, string | ((value: T) => { value: ReactElement, intl: string })> | undefined

interface DefaultDialogProps<T> {
  title: string
  onClose: () => void
  options: DialogOptionsProps<T>
  selectedItem: T
  dialogFullScreen: boolean
  dialogProps?: { sx?: SxProps }
  preview?: PreviewProps<T>
}

type HandleClickProps<T> = (options: DialogOptionProps<T>, key: string) => () => void

const hasId = <T,>(item: T): item is T & { id: string | number } => {
  return typeof item === 'object' && item !== null && 'id' in item
}

const DefaultDialogComponent = <T,>({ options, title, onClose, selectedItem, dialogFullScreen, dialogProps, preview }: DefaultDialogProps<T>): ReactElement => {
  const navigate = useNavigate()
  const [showRender, setShowRender] = useState('renderOptionList')
  const [selectedOption, setSelectedOption] = useState('')
  const actionToConfirm = useRef<any>(null)

  const fullScreen = dialogFullScreen || options?.[selectedOption]?.fullScreen || false

  const handleClick = useCallback<HandleClickProps<T>>(({ to, onConfirm, Component }, key) => () => {
    setSelectedOption(key)

    if (typeof to === 'string' && to !== '' && hasId(selectedItem)) {
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

  const renderPreview = useMemo(() => {
    if (preview === undefined) return null

    return (
      <TableContainer component={Paper} sx={{ '@media print': { display: 'none' } }}>
        <Table size='small'>
          <TableBody>
            {Object.entries(preview).map(([key, intl]) => {
              if (typeof intl === 'function') {
                const { value, intl: intlKey } = intl(selectedItem)
                return (
                  <TableRow key={key}>
                    <TableCell><Intl langKey={intlKey} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }} /></TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                )
              }

              let value = String((selectedItem as Record<string, unknown>)[key] ?? '')

              if (!isNaN(Number(value))) {
                value = formatToMoney(value)
              }

              return (
                <TableRow key={key}>
                  <TableCell><Intl langKey={intl} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }} /></TableCell>
                  <TableCell><span>{value}</span></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }, [preview, selectedItem])

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
        {renderPreview}
        {renderContent}
      </DialogContent>
    </Dialog>

  )
}

export default React.memo(DefaultDialogComponent) as typeof DefaultDialogComponent
